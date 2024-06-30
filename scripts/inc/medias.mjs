import fs from 'fs-extra'
import { glob } from 'glob'
import matter from 'gray-matter'
import { vault_root as root, cache_root, fileIsPublished } from './utils.mjs'
import path from 'path'
import chalk from 'chalk'
import _ from 'lodash'
import pluralize from 'pluralize'

export const handleMedias = async () => {
  console.log('handle medias..')
  const search = '/**/*.{zip,bib,csl,webp,jpg,jpeg,gif,bmp,svg,apng,png,avif,ico,pdf,mp4,mov,webm}'
  const files = await glob(search, { root })

  fs.outputFileSync(`${cache_root}/medias.json`, JSON.stringify(files))
  console.log(chalk.bgGreen(`${cache_root}/medias.json created. total files: ${files.length}`))
}
