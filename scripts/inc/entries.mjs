import fs from 'fs-extra'
import { glob } from 'glob'
import matter from 'gray-matter'
import { fileIsPublished } from './utils.mjs'
import path from 'path'
import chalk from 'chalk'

export const handleEntries = async () => {
  console.log('handle entries..')
  let entries = {}

  const search = 'vault/Entries/**/*.md',
    ignore = ['vault/_*/**', 'vault/**/_*']

  const files = await glob(search, { ignore })

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const front = matter(content)

    if (fileIsPublished(front.data)) {
      const filename = path.parse(file).name
      console.log(chalk.bgGreen(`[entry] ${filename}`))
      entries[filename] = front.data
    }
  })

  fs.outputFileSync('cache/entries.json', JSON.stringify(entries))

  console.log('cache/entries.json created.')
}
