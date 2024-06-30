import { computedFields } from './common'
import siteMetadata from '../data/siteMetadata'
import { defineDocumentType } from 'contentlayer2/source-files'

export const Page = defineDocumentType(() => ({
  name: 'Page',
  filePathPattern: '/Webpages/**/*.md',
  contentType: 'mdx',
  onExtraFieldData: 'ignore',
  fields: {
    title: { type: 'string', required: true },
    title_prefix: { type: 'string' },
    page_title: { type: 'string' },
    slug: { type: 'string', required: true },
    draft: { type: 'boolean' },
    published: { type: 'boolean' },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    date: { type: 'date', required: true },
    lastmod: { type: 'date' },
    description: { type: 'string' },
    preview: { type: 'string' },
    images: { type: 'json' },
    topics: { type: 'list', of: { type: 'string' } },
    relatedWorks: { type: 'list', of: { type: 'string' } },
    categories: { type: 'list', of: { type: 'string' } },
  },
  computedFields: {
    ...computedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.description,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))
