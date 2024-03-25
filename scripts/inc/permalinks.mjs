import fs from 'fs-extra'
import { glob } from 'glob'
import matter from 'gray-matter'
import { fileIsPublished } from './utils.mjs'
import path from 'path'
import chalk from 'chalk'
import _ from 'lodash'
import pluralize from 'pluralize'

export const handlePermalinks = async () => {
  console.log('handle permalinks..')
  let permalinks = {}

  const search = 'vault/**/*.md',
    ignore = ['vault/_*/**', 'vault/**/_*']

  const files = await glob(search, { ignore })

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const front = matter(content)

    if (fileIsPublished(front.data)) {
      const filename = path.parse(file).name,
        { slug, type } = front.data
      permalinks[filename] = `/${pluralize(_.toLower(type))}/${slug}`
      console.log(chalk.bgGreen(`[${type}]`), ` ${filename} -> ${permalinks[filename]}`)
    }
  })

  fs.outputFileSync('cache/permalinks.json', JSON.stringify(permalinks))
  console.log('cache/permalinks.json created.')
}
