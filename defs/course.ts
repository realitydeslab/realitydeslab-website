import { resolvePreviewData, computedFields } from './common'
import siteMetadata from '../data/siteMetadata'
import { defineDocumentType } from 'contentlayer2/source-files'
import { Author } from './author'

export const Course = defineDocumentType(() => ({
  name: 'Course',
  filePathPattern: '/Courses/**/*.md',
  contentType: 'mdx',
  onExtraFieldData: 'ignore',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    codename: { type: 'string', required: true },
    draft: { type: 'boolean' },
    published: { type: 'boolean' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    authors: { type: 'list', of: Author, default: [] },
    date: { type: 'date', required: true },
    description: { type: 'string' },
    cover: { type: 'string' },
    year: { type: 'number' },
    version: { type: 'string' },
    bibliography: { type: 'string' },
    repos: { type: 'list', of: { type: 'string' }, default: [] },
    relatedWorks: { type: 'list', of: { type: 'string' } },
    affiliation: { type: 'list', of: { type: 'string' } },
    topics: { type: 'list', of: { type: 'string' } },
    quarter: { type: 'string' },
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
