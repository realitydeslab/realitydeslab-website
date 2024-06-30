import { ComputedFields } from 'contentlayer2/source-files'
import readingTime from 'reading-time'
import { extractTocHeadings } from 'pliny/mdx-plugins/index.js'
import _ from 'lodash'
import { resolvePermalink } from '../libs/permalink-resolver'

const publish_root = process.env.PUBLISH_ROOT ?? 'publish'
const vault_root = process.env.VAULT_ROOT ?? 'vault'

const resolveWikiLinks = (data) => data.array().map((token) => resolvePermalink(token))

const resolvePreviewData = (doc) => doc.cover && resolvePermalink(doc.cover)

const resolveSlug = (type: string): string => {
  switch (type) {
    case 'blog':
      return 'writing'
    case 'course':
      return 'teaching'
    default:
      return type
  }
}

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  url: {
    type: 'string',
    resolve: (doc) => `/${resolveSlug(_.toLower(doc.type))}/${doc.slug}`,
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

export { computedFields, vault_root, publish_root, resolvePreviewData, resolveWikiLinks }
