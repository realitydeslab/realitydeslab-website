import fs from 'fs-extra'
import { glob } from 'glob'
import matter from 'gray-matter'
import path from 'node:path'
import { cache_root } from './utils.mjs'

export const handlePermalinks = async () => {
  const root = path.resolve('.cache/published-content')
  const files = await glob('**/*.md', { cwd: root })
  const destinations = new Map()
  const add = (key, url) => {
    if (!key) return
    const values = destinations.get(key) ?? new Set()
    values.add(url)
    destinations.set(key, values)
  }
  for (const file of files.sort()) {
    const { data } = matter(await fs.readFile(path.join(root, file), 'utf8'))
    if (!data.slug || !data.type) continue
    const prefix = { Page: '', Blog: 'writing', Course: 'teaching' }[data.type] ?? data.type.toLowerCase()
    const url = `${prefix ? '/' + prefix : ''}/${data.slug}`
    add(file.replace(/\.md$/, ''), url)
    add(path.parse(file).name, url)
    add(data.title, url)
    for (const alias of data.aliases ?? []) add(alias, url)
  }
  const links = Object.fromEntries([...destinations].filter(([, values]) => values.size === 1)
    .map(([key, values]) => [key, [...values][0]]))
  await fs.outputJson(`${cache_root}/permalinks.json`, links)
  console.log(`Indexed ${files.length} published documents; ambiguous short names require qualified paths`)
}
