import { computedFields, parsePermalink } from './common'
import siteMetadata from '../data/siteMetadata'
import { defineDocumentType } from 'contentlayer/source-files'
import vault_root from '../publish.config'
import { Author } from './author'

const resolvePreviewData = (doc) => doc.cover && parsePermalink(doc.cover)

export const Code = defineDocumentType(() => ({
  name: 'Code',
  filePathPattern: vault_root + '/Codes/**/*.md',
  contentType: 'mdx',
  onExtraFieldData: 'ignore',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    draft: { type: 'boolean' },
    published: { type: 'boolean' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    authors: { type: 'list', of: Author, default: [] },
    description: { type: 'string' },
    cover: { type: 'string' },
    version: { type: 'string' },
    repos: { type: 'list', of: { type: 'string' }, default: [] },
    relatedWorks: { type: 'list', of: { type: 'string' } },
  },
  computedFields: {
    ...computedFields,
    parsed_cover: {
      type: 'json',
      resolve: (doc) => resolvePreviewData(doc),
    },
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        description: doc.description,
        image: doc.parsed_cover ?? siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))
