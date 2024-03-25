import { computedFields, parsePermalink } from './common'
import siteMetadata from '../data/siteMetadata'
import { defineDocumentType } from 'contentlayer/source-files'
import vault_root from '../publish.config'
import { Author } from './author'

const resolvePreviewData = (doc) => doc.cover && parsePermalink(doc.cover)

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: vault_root + '/Blogs/**/*.md',
  contentType: 'mdx',
  onExtraFieldData: 'ignore',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
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
    // bibliography: { type: 'string' },
    // canonicalUrl: { type: 'string' },
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
