import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'
import matter from 'gray-matter'
import { vault_root, fileIsPublished } from './inc/utils.mjs'
import { resolveVideoUrl } from '../libs/video-url.mjs'

const root = path.resolve(vault_root)
const files = await glob('Projects/**/*.md', { cwd: root, ignore: ['**/_*/**'] })
const rows = []
for (const file of files.sort()) {
  const { data, content } = matter(await fs.readFile(path.join(root, file), 'utf8'))
  if (data.type !== 'Project') continue
  const body = content.replace(/<hide\b[^>]*>[\s\S]*?<\/hide>/gi, '')
  rows.push({ file, title: data.title, slug: data.slug, published: fileIsPublished(data),
    legacyDraft: data.draft === true, words: body.split(/\s+/).filter(Boolean).length,
    videos: (data.videos || []).map((url) => ({ url, embed: resolveVideoUrl(url) })),
    hasDescription: Boolean(data.description), hasCover: Boolean(data.cover),
    hasPublications: /^## (?:Publications|Research|Papers|Team and publication)/m.test(body) || Boolean(data.papers?.length),
    hasExhibitions: /^## Exhibitions/m.test(body) || Boolean(data.exhibitions?.length),
    localImages: (body.match(/!\[\[/g) || []).length })
}
const report = { checkedAt: new Date().toISOString(), vault: root, projects: rows }
await fs.mkdir('docs/maintenance', { recursive: true })
await fs.writeFile('docs/maintenance/project-inventory.json', JSON.stringify(report, null, 2) + '\n')
console.log(`${rows.filter((r) => r.published).length} published projects; ${rows.length} total project records`)
for (const row of rows.filter((r) => r.published)) {
  const issues = [!row.hasDescription && 'missing description', !row.hasCover && 'missing cover',
    !row.hasPublications && 'no publication section', !row.hasExhibitions && 'no exhibition section',
    row.legacyDraft && 'legacy draft flag conflicts with published',
    row.videos.some((v) => !v.embed) && 'unsupported video URL'].filter(Boolean)
  if (issues.length) console.log(`${row.slug}: ${issues.join('; ')}`)
}
