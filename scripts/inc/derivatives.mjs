import crypto from 'crypto'
import { execFile } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import sharp from 'sharp'
import { promisify } from 'util'
import { glob } from 'glob'
import { cache_root } from './utils.mjs'

const run = promisify(execFile)

// Deployment uploads every referenced asset, so the vault's archival originals
// (photographs kept as 8000px PNGs, 1080p H.264 hover loops) are re-encoded
// once into web deliverables. Originals are never touched; derivatives live in
// the cache and are keyed by source identity, so a rebuild reuses them.
export const IMAGE_SOURCES = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bmp'])
export const VIDEO_SOURCES = new Set(['.mp4', '.webm', '.mov'])

// Beyond the widest entry in next.config.js `deviceSizes`, pixels are decoded
// and thrown away on every optimizer request.
const MAX_IMAGE_WIDTH = 2560
const AVIF_QUALITY = 90

// Hover previews render inside a card, play muted, and loop. Full duration and
// 1080p are preserved; only the wildly inconsistent bitrates are normalised.
const MAX_VIDEO_WIDTH = 1920
const AV1_CRF = 30
const AV1_PRESET = 6

const derivative_root = `${cache_root}/derivatives`

// Content-addressed, not path- or mtime-addressed: a fresh CI checkout gives
// every file a new mtime, and the vault is checked out at a different path
// there, so either would miss the cache on every run and re-encode everything.
const fingerprint = (source, recipe) =>
  crypto.createHash('sha1').update(recipe).update(fs.readFileSync(source)).digest('hex')

const buildImage = async (source, target) => {
  const metadata = await sharp(source).metadata()
  // An animated PNG or WebP would silently collapse to its first frame.
  if ((metadata.pages ?? 1) > 1) return false
  await sharp(source)
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .avif({ quality: AVIF_QUALITY })
    .toFile(target)
  return true
}

const buildVideo = async (source, target) => {
  await run('ffmpeg', [
    '-y', '-v', 'error',
    '-i', source,
    '-an',
    '-vf', `scale='min(${MAX_VIDEO_WIDTH},iw)':-2`,
    '-c:v', 'libsvtav1',
    '-crf', String(AV1_CRF),
    '-preset', String(AV1_PRESET),
    '-movflags', '+faststart',
    // The staging path ends in .partial, so the muxer cannot be inferred.
    '-f', 'mp4',
    target,
  ])
  return true
}

const recipes = {
  image: {
    extension: '.avif',
    recipe: `avif:${MAX_IMAGE_WIDTH}:${AVIF_QUALITY}`,
    build: buildImage,
  },
  video: {
    extension: '.mp4',
    recipe: `av1:${MAX_VIDEO_WIDTH}:${AV1_CRF}:${AV1_PRESET}`,
    build: buildVideo,
  },
}

/**
 * Only assets that a published document actually references are ever deployed,
 * so re-encoding the rest of the vault would burn build time for nothing.
 * Wikilinks resolve by basename, which is what the resolver matches on too.
 */
const referencedBasenames = async () => {
  const staged = `${cache_root}/published-content`
  if (!fs.existsSync(staged)) return null
  const documents = await glob('**/*.md', { cwd: staged, absolute: true })
  const names = new Set()
  for (const document of documents) {
    const body = fs.readFileSync(document, 'utf8')
    for (const [, target] of body.matchAll(/\[\[([^\]|#]+)/g)) {
      names.add(path.basename(target.trim()).toLowerCase())
    }
  }
  return names
}

const kindOf = (source) => {
  const extension = path.extname(source).toLowerCase()
  if (IMAGE_SOURCES.has(extension)) return 'image'
  if (VIDEO_SOURCES.has(extension)) return 'video'
  return null
}

/**
 * Re-encode every convertible source once and record where its deliverable
 * landed. A derivative is only recorded when it is genuinely smaller, so an
 * already-optimised asset keeps being served verbatim.
 */
export const buildDerivatives = async (files) => {
  fs.ensureDirSync(derivative_root)
  const referenced = await referencedBasenames()
  const map = {}
  let built = 0
  let reused = 0
  let skipped = 0
  let sourceBytes = 0
  let derivedBytes = 0

  for (const source of files) {
    const kind = kindOf(source)
    if (!kind) continue
    if (referenced && !referenced.has(path.basename(source).toLowerCase())) continue
    const { extension, recipe, build } = recipes[kind]
    const target = `${derivative_root}/${fingerprint(source, recipe)}${extension}`

    if (!fs.existsSync(target)) {
      const staging = `${target}.partial`
      try {
        const produced = await build(source, staging)
        if (!produced) {
          fs.removeSync(staging)
          skipped += 1
          continue
        }
        fs.moveSync(staging, target, { overwrite: true })
        built += 1
      } catch (error) {
        // A source this toolchain cannot read must not fail the whole build;
        // the original is still copied verbatim by the resolver.
        fs.removeSync(staging)
        console.log(chalk.yellow(`[derivative skipped] ${path.basename(source)}: ${error.message.split('\n')[0]}`))
        skipped += 1
        continue
      }
    } else {
      reused += 1
    }

    const originalSize = fs.statSync(source).size
    const derivedSize = fs.statSync(target).size
    if (derivedSize >= originalSize) {
      skipped += 1
      continue
    }
    sourceBytes += originalSize
    derivedBytes += derivedSize
    map[source] = { target, extension }
  }

  fs.outputFileSync(`${cache_root}/derivatives.json`, JSON.stringify(map))
  const saved = sourceBytes ? Math.round(100 - (100 * derivedBytes) / sourceBytes) : 0
  console.log(
    chalk.bgGreen(
      `derivatives: ${Object.keys(map).length} used (${built} built, ${reused} cached, ${skipped} skipped) ` +
        `${(sourceBytes / 1048576).toFixed(0)}MB -> ${(derivedBytes / 1048576).toFixed(0)}MB, saved ${saved}%`
    )
  )
}
