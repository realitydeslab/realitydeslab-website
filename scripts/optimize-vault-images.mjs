import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import sharp from 'sharp'
import { glob } from 'glob'
import { vault_root } from './inc/utils.mjs'

const run = (label, value) => console.log(`  ${label} ${value}`)

// `_resources` is documented as the web-ready copy of each asset, with
// `_archive` holding originals, but it accumulated archival masters:
// photographs kept as PNGs up to 8001px wide. A PNG stores a photograph
// losslessly, which is the wrong trade for a photograph and costs roughly
// twenty times what JPEG does at a quality no viewer can distinguish.
//
// Every file here is committed to Git LFS, so `git checkout <commit> -- <path>`
// restores any original.

// Beyond the widest next.config.js `deviceSizes` entry, pixels are decoded and
// discarded on every optimizer request.
const MAX_WIDTH = 2560

// These are sources that next/image re-encodes per request, so the stored copy
// is one lossy generation upstream of what a visitor sees. Keep it generous.
const JPEG_QUALITY = 92
const PNG_EFFORT = 9

// sharp's own thread pool does not saturate ten cores on a small image, and the
// loop below awaits one file at a time. Encoding several concurrently does.
const CONCURRENCY = 6

const apply = process.argv.includes('--apply')

// Photographs exported with an alpha channel often carry a handful of stray
// non-opaque pixels, so testing the channel's minimum flags them as
// transparent when they are visually solid. Mean alpha measures how much of
// the image is actually see-through: conference logos sit between 20% and 84%,
// while these photographs sit at 0.0%.
const TRANSPARENCY_THRESHOLD = 0.005

/**
 * A PNG only needs to stay a PNG when it actually uses transparency;
 * converting one that does would flatten it onto black.
 */
const usesTransparency = async (file) => {
  const metadata = await sharp(file).metadata()
  if (!metadata.hasAlpha) return false
  const stats = await sharp(file).stats()
  if (stats.channels.length < 4) return false
  return 1 - stats.channels[3].mean / 255 > TRANSPARENCY_THRESHOLD
}

/**
 * Repoint wikilinks whose target no longer exists at the file that replaced it.
 *
 * This reconciles against what is on disk rather than against renames recorded
 * during this run, so interrupting a conversion cannot leave a document
 * pointing at a file that is already gone: the next run repairs it.
 */
const repairReferences = async () => {
  const assets = await glob('**/_resources/**/*', {
    cwd: vault_root, absolute: true, nodir: true, follow: true, ignore: ['**/_archive/**'],
  })
  const present = new Set(assets.map((asset) => path.basename(asset)))
  // stem -> the extension that now exists, for stems with exactly one candidate
  const replacement = new Map()
  for (const asset of assets) {
    const name = path.basename(asset)
    const stem = name.slice(0, -path.extname(name).length)
    replacement.set(stem, replacement.has(stem) ? null : name)
  }

  const documents = await glob('**/*.md', {
    // Archived snapshots record what a document said at the time; leave them.
    cwd: vault_root, absolute: true, ignore: ['**/_archive/**', '**/.*/**'], follow: true,
  })
  let touched = 0
  let repaired = 0
  for (const document of documents) {
    const before = fs.readFileSync(document, 'utf8')
    const after = before.replace(/([^[\]|#/\\]+)\.(png|webm|mov)\b/gi, (match, stem) => {
      if (present.has(match)) return match
      const now = replacement.get(stem)
      if (!now || now === match) return match
      repaired += 1
      return now
    })
    if (after === before) continue
    touched += 1
    if (apply) fs.writeFileSync(document, after)
  }
  return { touched, repaired }
}

const main = async () => {
  const sources = await glob('**/_resources/**/*.png', {
    // Archived material is the record of what an asset originally was.
    cwd: vault_root, absolute: true, nodir: true, follow: true, ignore: ['**/_archive/**'],
  })
  let originalBytes = 0
  let newBytes = 0
  let toJpeg = 0
  let keptPng = 0
  let left = 0

  const convert = async (source) => {
    let transparent
    try {
      transparent = await usesTransparency(source)
    } catch (error) {
      console.log(chalk.yellow(`  skip ${path.basename(source)}: ${error.message.split('\n')[0]}`))
      left += 1
      return
    }

    const target = transparent ? source : source.replace(/\.png$/i, '.jpg')
    const staging = `${target}.partial${transparent ? '.png' : '.jpg'}`
    const pipeline = sharp(source).resize({ width: MAX_WIDTH, withoutEnlargement: true })

    try {
      await (transparent
        ? pipeline.png({ compressionLevel: PNG_EFFORT, effort: PNG_EFFORT })
        : pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      ).toFile(staging)
    } catch (error) {
      console.log(chalk.yellow(`  skip ${path.basename(source)}: ${error.message.split('\n')[0]}`))
      fs.removeSync(staging)
      left += 1
      return
    }

    const originalSize = fs.statSync(source).size
    const newSize = fs.statSync(staging).size
    // Leave an asset alone when re-encoding it would not actually help.
    if (newSize >= originalSize) {
      fs.removeSync(staging)
      left += 1
      return
    }

    originalBytes += originalSize
    newBytes += newSize
    if (transparent) keptPng += 1
    else {
      toJpeg += 1
    }

    if (apply) {
      fs.moveSync(staging, target, { overwrite: true })
      if (target !== source) fs.removeSync(source)
    } else {
      fs.removeSync(staging)
    }
  }

  // A fixed-size pool: each worker pulls the next file until the list is done.
  const queue = [...sources]
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let next = queue.pop(); next; next = queue.pop()) await convert(next)
    })
  )

  const { touched, repaired } = await repairReferences()
  const saved = originalBytes ? Math.round(100 - (100 * newBytes) / originalBytes) : 0
  console.log(chalk.bgGreen(`${apply ? 'Rewrote' : 'Would rewrite'} ${toJpeg + keptPng} images`))
  run('to JPEG (opaque):', toJpeg)
  run('kept PNG (transparent):', keptPng)
  run('left as-is:', left)
  run('size:', `${(originalBytes / 1048576).toFixed(0)}MB -> ${(newBytes / 1048576).toFixed(0)}MB, saved ${saved}%`)
  run('references repaired:', `${repaired} in ${touched} documents`)
  if (!apply) console.log(chalk.gray('Dry run. Re-run with --apply to write.'))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
