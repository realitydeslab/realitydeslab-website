import 'dotenv/config'
import fs from 'fs-extra'
import { open } from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'

// Run only after a successful content build. Stale files are moved outside the
// public/build trees, so they remain recoverable without being deployable.
const apply = process.argv.includes('--apply')
const generated = '.contentlayer/generated'
const indexes = await glob('*/_index.json', { cwd: generated })
if (!indexes.length) throw new Error('Build content before auditing its assets')
const documents = (await Promise.all(indexes.map((f) => fs.readJson(path.join(generated, f))))).flat()
if (!documents.length || documents.some((d) => d.published !== true)) {
  throw new Error('Expected a nonempty, published-only generated collection')
}
const missingVideoFallbacks = documents
  .filter((doc) => doc.coverVideo_data?.type === 'video' &&
    !/\.h264\.mp4$/i.test(doc.coverVideo_data.uri) && !doc.coverVideoFallback_data?.uri)
  .map((doc) => doc.title ?? doc._id)
if (missingVideoFallbacks.length) {
  throw new Error(`Published cover videos need H.264 fallbacks: ${missingVideoFallbacks.join(', ')}`)
}
const prefix = `/${process.env.PUBLISH_ROOT || 'media'}/`
if (!/^\/[a-zA-Z0-9_-]+\/$/.test(prefix)) throw new Error('Invalid generated media folder')
const references = new Set()
function collect(value) {
  if (Array.isArray(value)) value.forEach(collect)
  else if (value && typeof value === 'object') Object.values(value).forEach(collect)
  else if (typeof value === 'string') {
    const pattern = new RegExp(`${prefix}[^"'<>\x60\n\\\\]+`, 'g')
    for (const match of value.matchAll(pattern)) {
      const relative = decodeURI(match[0].split(/[?#]/)[0]).slice(1)
      if (relative.split('/').includes('..')) throw new Error(`Unsafe asset reference: ${relative}`)
      references.add(relative)
    }
  }
}
documents.forEach(collect)
const coverVideos = new Set(documents.flatMap((doc) => [
  doc.coverVideo_data?.uri,
  doc.coverVideoFallback_data?.uri,
]).filter((uri) => typeof uri === 'string' && uri.startsWith(prefix) && /\.mp4(?:[?#]|$)/i.test(uri))
  .map((uri) => decodeURI(uri.split(/[?#]/)[0]).slice(1)))

async function hasFastStart(asset) {
  const handle = await open(asset, 'r')
  try {
    const { size } = await handle.stat()
    const header = Buffer.alloc(16)
    for (let offset = 0; offset + 8 <= size;) {
      const { bytesRead } = await handle.read(header, 0, 8, offset)
      if (bytesRead !== 8) return false
      let boxSize = header.readUInt32BE(0)
      const type = header.toString('ascii', 4, 8)
      if (boxSize === 1) {
        if ((await handle.read(header, 8, 8, offset + 8)).bytesRead !== 8) return false
        const extended = header.readBigUInt64BE(8)
        if (extended > BigInt(Number.MAX_SAFE_INTEGER)) return false
        boxSize = Number(extended)
      } else if (boxSize === 0) boxSize = size - offset
      if (boxSize < 8 || offset + boxSize > size) return false
      if (type === 'moov') return true
      if (type === 'mdat') return false
      offset += boxSize
    }
    return false
  } finally {
    await handle.close()
  }
}

for (const file of references) {
  const asset = path.join('public', file)
  if (!(await fs.pathExists(asset))) throw new Error(`Missing published asset: ${file}`)
  // A partial LFS checkout leaves a small pointer that otherwise passes
  // existence checks and gets deployed as broken media.
  if ((await fs.stat(asset)).size < 256 &&
    (await fs.readFile(asset, 'utf8')).startsWith('version https://git-lfs.github.com/spec/v1\n')) {
    throw new Error(`Published asset is a Git LFS pointer: ${file}`)
  }
  if (coverVideos.has(file) && !(await hasFastStart(asset))) {
    throw new Error(`Published cover video needs fast-start MP4 metadata: ${file}`)
  }
}
const stale = []
for (const file of await glob(`${prefix.slice(1)}**/*`, { cwd: 'public', nodir: true })) {
  if (!references.has(file)) stale.push(path.join('public', file))
}
const ids = new Set(documents.map((d) => d._id))
for (const file of await glob('*/*.json', { cwd: generated })) {
  if (file.endsWith('/_index.json')) continue
  const source = path.join(generated, file)
  const doc = await fs.readJson(source)
  if (doc._id && !ids.has(doc._id)) {
    stale.push(source)
    const generatedModule = source.replace(/\.json$/, '.mjs')
    if (await fs.pathExists(generatedModule)) stale.push(generatedModule)
  }
}
const legacy = 'public/static/vault'
if (await fs.pathExists(legacy)) {
  if (JSON.stringify(documents).includes('/static/vault/')) throw new Error('Legacy assets still have references')
  stale.push(legacy)
}
const quarantine = path.join('output', 'asset-quarantine', new Date().toISOString().replaceAll(':', '-'))
if (apply) for (const file of stale) await fs.move(file, path.join(quarantine, file))
const report = { checkedAt: new Date().toISOString(), applied: apply, documents: documents.length,
  referencedAssets: references.size, moved: stale, quarantine: apply && stale.length ? quarantine : null }
await fs.outputJson('output/audit/published-assets.json', report, { spaces: 2 })
console.log(`${documents.length} published documents, ${references.size} existing media assets, ${stale.length} stale paths ${apply ? 'quarantined' : 'found'}`)
