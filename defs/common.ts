import { ComputedFields } from 'contentlayer/source-files'
import readingTime from 'reading-time'
import { extractTocHeadings } from 'pliny/mdx-plugins/index.js'
import configs from '../publish.config'
import { getPermalinks } from '@portaljs/remark-wiki-link'
import { permaLinkParser } from '../plugins/libs/permalinkParser'
import _ from 'lodash'
import pluralize from 'pluralize'

const { target_root, vault_root } = configs

const permalinks = getPermalinks(vault_root)

const parsePermalink = permaLinkParser({
  vault_root,
  target_root,
  pathFormat: 'obsidian-short',
  permalinks,
})

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  url: {
    type: 'string',
    resolve: (doc) => `/${pluralize(_.toLower(doc.type))}/${doc.slug}`,
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'string', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

export { computedFields, target_root, vault_root, permalinks, parsePermalink }
