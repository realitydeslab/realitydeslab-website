import { execFile } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import matter from 'gray-matter'
import { glob } from 'glob'
import { promisify } from 'util'
import { vault_root } from './inc/utils.mjs'

const run = promisify(execFile)

// Cover videos are the only assets a visitor downloads verbatim. Images pass
// through next/image, which re-encodes them per request, so an oversized
// original costs nothing on the wire; a <video src> costs exactly its bytes.
//
// These were encoded at whatever the source happened to be, giving bitrates
// from 867k to 7595k for the same 1080p frame. This normalises them to AV1 at
// a fixed quality, in place. Every file is committed to Git LFS, so
// `git checkout <commit> -- <path>` restores any original.

// Keep each source at its own resolution: a card is about 1400px wide, and on
// a 2x display that needs ~2800 physical pixels, so downscaling to 1280 is
// visibly soft. This caps at 1920 and never shrinks a 1280 source, changing
// only the codec and the bitrate, which range from 867k to 7595k across these
// files for the same 1080p frame. Full duration is kept; the silent audio
// track is dropped.
const MAX_WIDTH = 1920
const CRF = 30
const PRESET = 6

// CRF alone let high-detail footage run to 6.3M (FungiSync: foliage and
// particles), because constant quality spends whatever that detail costs. A
// ceiling bounds those clips without touching easy ones: FungiSync goes from
// 12.9MB to 5.9MB with SSIM 0.982 against the source.
const MAX_BITRATE = '2500k'

// Safari decodes AV1 only where the device has a hardware decoder (M3 Macs,
// iPhone 15 Pro and later) and has no software fallback, so every AV1 cover
// ships with an H.264 sibling the page offers second. H.264 needs more bits
// than AV1 for the same picture, hence the higher ceiling.
const FALLBACK_SUFFIX = '.h264.mp4'
const FALLBACK_CRF = 23
const FALLBACK_MAX_BITRATE = '3500k'

// Encoding one file at a time leaves most of a ten-core machine idle.
const CONCURRENCY = 4

const apply = process.argv.includes('--apply')

const coverVideoNames = async () => {
  // `vault` is a symlink to the archive repository; glob needs `follow`.
  const documents = await glob('**/*.md', {
    cwd: vault_root, absolute: true, ignore: ['**/_archive/**', '**/.*/**'], follow: true,
  })
  const names = new Map()
  for (const document of documents) {
    const { coverVideo, published } = matter(fs.readFileSync(document, 'utf8')).data
    if (published !== true || !coverVideo) continue
    const name = String(coverVideo).replace(/\[\[|\]\]/g, '').split('|')[0].trim()
    if (name) names.set(name, document)
  }
  return names
}

const resolveSource = async (name) => {
  const hits = await glob(`**/${name}`, {
    cwd: vault_root, absolute: true, ignore: ['**/_archive/**'], follow: true,
  })
  return hits[0] ?? null
}

const fallbackOf = (primary) => primary.replace(/\.mp4$/i, FALLBACK_SUFFIX)

const encodeFallback = (source, target) =>
  run('ffmpeg', [
    '-y', '-v', 'error', '-nostdin',
    '-i', source,
    '-an',
    '-vf', `scale='min(${MAX_WIDTH},iw)':-2`,
    '-c:v', 'libx264',
    '-crf', String(FALLBACK_CRF),
    '-preset', 'slow',
    '-maxrate', FALLBACK_MAX_BITRATE,
    '-bufsize', `${parseInt(FALLBACK_MAX_BITRATE, 10) * 2}k`,
    // The widest-supported H.264 profile for 1080p; that is the point of it.
    '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-f', 'mp4',
    target,
  ])

const encode = (source, target) =>
  run('ffmpeg', [
    '-y', '-v', 'error', '-nostdin',
    '-i', source,
    '-an',
    '-vf', `scale='min(${MAX_WIDTH},iw)':-2`,
    '-c:v', 'libsvtav1',
    '-crf', String(CRF),
    '-preset', String(PRESET),
    '-svtav1-params', `mbr=${MAX_BITRATE}`,
    '-movflags', '+faststart',
    // The staging path ends in .partial, so the muxer cannot be inferred.
    '-f', 'mp4',
    target,
  ])

/**
 * Whether a file is already what this script would produce.
 *
 * Without this check every run re-encodes every video and keeps the result if
 * it is smaller, which it usually is: each run then costs another generation of
 * quality for a few percent of size.
 */
const probe = async (source) => {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width:format=bit_rate',
    '-of', 'json', source,
  ])
  return JSON.parse(stdout)
}

const codecOf = async (source) => (await probe(source)).streams?.[0]?.codec_name

const alreadyOptimized = async (source) => {
  const { streams: [stream] = [] } = await probe(source)
  if (!stream) return false
  // Existing AV1 may be an authored master. Never recompress it merely to
  // meet a bitrate target; ensure its H.264 sibling instead.
  return stream.codec_name === 'av1' && stream.width <= MAX_WIDTH
}

/** Repoint every wikilink at a renamed file, across the whole vault. */
const applyRenames = async (renames) => {
  if (!renames.length) return 0
  const documents = await glob('**/*.md', {
    // Archived snapshots record what a document said at the time; leave them.
    cwd: vault_root, absolute: true, ignore: ['**/_archive/**', '**/.*/**'], follow: true,
  })
  let touched = 0
  for (const document of documents) {
    const before = fs.readFileSync(document, 'utf8')
    let after = before
    for (const [from, to] of renames) after = after.split(from).join(to)
    if (after === before) continue
    touched += 1
    if (apply) fs.writeFileSync(document, after)
  }
  return touched
}

const main = async () => {
  const names = await coverVideoNames()
  const renames = []
  let originalBytes = 0
  let newBytes = 0
  let rewritten = 0
  let left = 0

  let fallbacks = 0

  /** Write the H.264 sibling for `primary`, encoded from `source`. */
  const writeFallback = async (source, primary) => {
    const fallback = fallbackOf(primary)
    const staging = `${fallback}.partial.mp4`
    await encodeFallback(source, staging)
    console.log(`  + ${(fs.statSync(staging).size / 1048576).toFixed(1)}M H.264  ${path.basename(fallback)}`)
    fallbacks += 1
    if (apply) fs.moveSync(staging, fallback, { overwrite: true })
    else fs.removeSync(staging)
  }

  const convert = async (name) => {
    // An explicit H.264 master preserves detail that a prior AV1 transcode lost.
    if (/\.h264\.mp4$/i.test(name)) {
      left += 1
      return
    }
    const source = await resolveSource(name)
    if (!source) {
      console.log(chalk.yellow(`  missing ${name}`))
      return
    }
    const target = source.replace(/\.[^./\\]+$/, '.mp4')
    const staging = `${target}.partial.mp4`
    const sourceCodec = await codecOf(source)
    try {
      if (await alreadyOptimized(source)) {
        left += 1
        // Encoded before fallbacks existed: add the sibling it lacks.
        if (!fs.existsSync(fallbackOf(target))) await writeFallback(source, target)
        return
      }
      await encode(source, staging)
    } catch (error) {
      console.log(chalk.yellow(`  skip ${name}: ${error.message.split('\n')[0]}`))
      fs.removeSync(staging)
      left += 1
      return
    }
    const originalSize = fs.statSync(source).size
    const newSize = fs.statSync(staging).size
    // Keep an existing AV1 master when another generation would not help.
    // H.264 sources still get an AV1 version, even if it is larger, so every
    // published preview offers both codecs.
    if (newSize >= originalSize && sourceCodec === 'av1') {
      fs.removeSync(staging)
      left += 1
      console.log(chalk.gray(`  keep ${name} (${(originalSize / 1048576).toFixed(1)}MB, re-encode was larger)`))
      if (!fs.existsSync(fallbackOf(source))) {
        await writeFallback(source, source).catch((error) =>
          console.log(chalk.yellow(`  skip ${name}: fallback failed: ${error.message.split('\n')[0]}`)))
      }
      return
    }
    console.log(
      `  ${(originalSize / 1048576).toFixed(1)}M -> ${(newSize / 1048576).toFixed(1)}M  ` +
        `${String(Math.round(100 - (100 * newSize) / originalSize)).padStart(2)}%  ${name}`
    )
    originalBytes += originalSize
    newBytes += newSize
    rewritten += 1
    if (path.basename(source) !== path.basename(target)) {
      renames.push([path.basename(source), path.basename(target)])
    }
    if (sourceCodec === 'h264') {
      // Remux without recompression so Safari can read metadata near the start.
      if (!fs.existsSync(fallbackOf(target))) {
        if (apply) await run('ffmpeg', [
          '-y', '-v', 'error', '-nostdin', '-i', source,
          '-map', '0', '-c', 'copy', '-movflags', '+faststart',
          '-f', 'mp4', fallbackOf(target),
        ])
        fallbacks += 1
      }
    } else if (!fs.existsSync(fallbackOf(target))) {
      try {
        await writeFallback(source, target)
      } catch (error) {
        console.log(chalk.yellow(`  skip ${name}: fallback failed: ${error.message.split('\n')[0]}`))
        fs.removeSync(staging)
        return
      }
    }
    if (apply) {
      fs.moveSync(staging, target, { overwrite: true })
      if (target !== source) fs.removeSync(source)
    } else {
      fs.removeSync(staging)
    }
  }

  const queue = [...names.keys()]
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let next = queue.pop(); next; next = queue.pop()) await convert(next)
    })
  )

  const touched = await applyRenames(renames)
  const saved = originalBytes ? Math.round(100 - (100 * newBytes) / originalBytes) : 0
  console.log(
    chalk.bgGreen(
      `${apply ? 'Rewrote' : 'Would rewrite'} ${rewritten} cover videos (${left} kept): ` +
        `${(originalBytes / 1048576).toFixed(0)}MB -> ${(newBytes / 1048576).toFixed(0)}MB, saved ${saved}%. ` +
        `${fallbacks} H.264 fallbacks, ${renames.length} renamed, ${touched} documents updated.`
    )
  )
  if (!apply) console.log(chalk.gray('Dry run. Re-run with --apply to write.'))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
