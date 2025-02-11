import { computedFields, resolvePreviewData } from './common'
import siteMetadata from '../data/siteMetadata'
import { defineDocumentType } from 'contentlayer2/source-files'

import { Author } from './author'

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: '/Blogs/**/*.md',
  contentType: 'mdx',
  onExtraFieldData: 'ignore',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    codename: { type: 'string' },
    draft: { type: 'boolean' },
    published: { type: 'boolean' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    authors: { type: 'list', of: Author },
    date: { type: 'date', required: true },
    lastmod: { type: 'date' },
    description: { type: 'string' },
    cover: { type: 'string' },
    citation: { type: 'string' },
    media: { type: 'list', of: { type: 'string' }, default: [] },
    techs: { type: 'list', of: { type: 'string' }, default: [] },
    topics: { type: 'list', of: { type: 'string' }, default: [] },
    relatedWorks: { type: 'list', of: { type: 'string' } },
    categories: { type: 'list', of: { type: 'string' } },
    // layout: { type: 'string' },
    bibliography: { type: 'string' },
    // canonicalUrl: { type: 'string' },
    // order: { type: 'number', default: 0 },
    csl: { type: 'string' },
    year: { type: 'string' },
    yearStart: { type: 'number' },
    yearEnd: { type: 'string' },
    completed: { type: 'boolean' },
    preview: { type: 'string' },
    coverVideo: { type: 'string' },
    coverSlides: { type: 'string' },
    videos: { type: 'list', of: { type: 'string' } },
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
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.description,
        image: doc.cover ?? siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc.url}`,
      }),
    },
  },
}))
