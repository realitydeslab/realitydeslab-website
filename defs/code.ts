import { computedFields, resolvePreviewData } from './common'
import siteMetadata from '../data/siteMetadata'
import { defineDocumentType } from 'contentlayer2/source-files'
import { Author } from './author'

export const Code = defineDocumentType(() => ({
  name: 'Code',
  filePathPattern: '/Codes/**/*.md',
  contentType: 'mdx',
  onExtraFieldData: 'ignore',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    // codename: { type: 'string', required: true },
    codename: { type: 'string' },
    draft: { type: 'boolean' },
    published: { type: 'boolean' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    authors: { type: 'list', of: Author, default: [] },
    date: { type: 'date' },
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
