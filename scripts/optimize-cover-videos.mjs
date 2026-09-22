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

// Previews loop muted inside a card no wider than about 1400px, so the 55% of
// pixels above 1280 are decoded and thrown away. Dropping to 1280 saves more
// than tightening quality would: on the worst offender, 1920/CRF30 gives 9.42MB
// while 1280/CRF32 gives 4.94MB. Full duration is preserved and the unused
// audio track is dropped.
const MAX_WIDTH = 1280
const CRF = 32
const PRESET = 6

const apply = process.argv.includes('--apply')

const coverVideoNames = async () => {
  // `vault` is a symlink to the archive repository; glob needs `follow`.
  const documents = await glob('**/*.md', {
    cwd: vault_root, absolute: true, ignore: ['**/_archive/**', '**/.*/**'], follow: true,
  })
  const names = new Map()
  for (const document of documents) {
    const { coverVideo } = matter(fs.readFileSync(document, 'utf8')).data
    if (!coverVideo) continue
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

const encode = (source, target) =>
  run('ffmpeg', [
    '-y', '-v', 'error',
    '-i', source,
    '-an',
    '-vf', `scale='min(${MAX_WIDTH},iw)':-2`,
    '-c:v', 'libsvtav1',
    '-crf', String(CRF),
    '-preset', String(PRESET),
    '-movflags', '+faststart',
    // The staging path ends in .partial, so the muxer cannot be inferred.
    '-f', 'mp4',
    target,
  ])

/** Repoint every wikilink at a renamed file, across the whole vault. */
const applyRenames = async (renames) => {
  if (!renames.length) return 0
  const documents = await glob('**/*.md', {
    cwd: vault_root, absolute: true, ignore: ['**/.*/**'], follow: true,
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

  for (const [name] of names) {
    const source = await resolveSource(name)
    if (!source) {
      console.log(chalk.yellow(`  missing ${name}`))
      continue
    }
    const target = source.replace(/\.[^./\\]+$/, '.mp4')
    const staging = `${target}.partial.mp4`
    try {
      await encode(source, staging)
    } catch (error) {
      console.log(chalk.yellow(`  skip ${name}: ${error.message.split('\n')[0]}`))
      fs.removeSync(staging)
      left += 1
      continue
    }
    const originalSize = fs.statSync(source).size
    const newSize = fs.statSync(staging).size
    // Six of these are already AV1; leave one alone if re-encoding gains nothing.
    if (newSize >= originalSize) {
      fs.removeSync(staging)
      left += 1
      console.log(chalk.gray(`  keep ${name} (${(originalSize / 1048576).toFixed(1)}MB, re-encode was larger)`))
      continue
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
    if (apply) {
      fs.moveSync(staging, target, { overwrite: true })
      if (target !== source) fs.removeSync(source)
    } else {
      fs.removeSync(staging)
    }
  }

  const touched = await applyRenames(renames)
  const saved = originalBytes ? Math.round(100 - (100 * newBytes) / originalBytes) : 0
  console.log(
    chalk.bgGreen(
      `${apply ? 'Rewrote' : 'Would rewrite'} ${rewritten} cover videos (${left} kept): ` +
        `${(originalBytes / 1048576).toFixed(0)}MB -> ${(newBytes / 1048576).toFixed(0)}MB, saved ${saved}%. ` +
        `${renames.length} renamed, ${touched} documents updated.`
    )
  )
  if (!apply) console.log(chalk.gray('Dry run. Re-run with --apply to write.'))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
