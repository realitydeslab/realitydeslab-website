import 'dotenv/config'
import fs from 'fs-extra'
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
  .filter((doc) => doc.coverVideo_data?.type === 'video' && !doc.coverVideoFallback_data?.uri)
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
for (const file of references) {
  if (!(await fs.pathExists(path.join('public', file)))) throw new Error(`Missing published asset: ${file}`)
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
