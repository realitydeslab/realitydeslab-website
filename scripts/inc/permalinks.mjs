import fs from 'fs-extra'
import { glob } from 'glob'
import matter from 'gray-matter'
import { vault_root as root, cache_root, fileIsPublished } from './utils.mjs'
import path from 'path'
import chalk from 'chalk'
import _ from 'lodash'

export const handlePermalinks = async () => {
  console.log('handle permalinks..')
  let permalinks = {}

  const search = '/**/*.md',
    ignore = ['/_*/**', '/**/_*']

  const files = await glob(search, { ignore, root })
  let total = 0
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const front = matter(content)

    if (fileIsPublished(front.data)) {
      const filename = path.parse(file).name,
        { slug, type } = front.data
      permalinks[filename] = `/${_.toLower(type)}/${slug}`
      console.log(chalk.bgGreen(`[${type}]`), ` ${filename} -> ${permalinks[filename]}`)
      total++
    }
  })

  fs.outputFileSync(`${cache_root}/permalinks.json`, JSON.stringify(permalinks))
  console.log(`${cache_root}/permalinks.json created. total:${total}`)
}
