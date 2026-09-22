import fs from 'fs-extra'
import path from 'node:path'
import { glob } from 'glob'
import matter from 'gray-matter'
import { vault_root, fileIsPublished } from './utils.mjs'

// Compile only explicitly published documents. Hiding routes after compilation
// still exposes draft bodies and their copied assets in the build output.
export async function stagePublishedContent() {
  const root = path.resolve(vault_root)
  const target = path.resolve('.cache/published-content')
  if (!(await fs.pathExists(root))) throw new Error(`Missing Obsidian vault: ${root}`)
  await fs.emptyDir(target)
  const files = await glob('{Projects,Webpages,Codes,Blogs,Courses}/**/*.md', {
    cwd: root, ignore: ['**/_*/**', '**/.*'],
  })
  let count = 0
  for (const file of files) {
    const source = await fs.readFile(path.join(root, file), 'utf8')
    if (!fileIsPublished(matter(source).data)) continue
    await fs.outputFile(path.join(target, file), source.replace(/<hide\b[^>]*>[\s\S]*?<\/hide>/gi, ''))
    count++
  }
  console.log(`Staged ${count} explicitly published documents`)
}
