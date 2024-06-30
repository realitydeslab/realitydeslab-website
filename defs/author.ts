import { computedFields } from './common'
import { defineDocumentType } from 'contentlayer2/source-files'

export const Author = defineDocumentType(() => ({
  name: 'Author',
  filePathPattern: '/Meta/Authors/**/*.md',
  onExtraFieldData: 'ignore',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    aliases: { type: 'list', of: { type: 'string' }, default: [] },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    published: { type: 'boolean' },
    position: { type: 'string' },
    email: { type: 'string' },
    affiliation: { type: 'string' },
    preview: { type: 'string' },
    location: { type: 'string' },
    orcid: { type: 'string' },
    github: { type: 'string' },
    zotero: { type: 'string' },
    linkedin: { type: 'string' },
    website: { type: 'string' },
    twitter: { type: 'string' },
    biography: { type: 'string' },
  },
  computedFields,
}))
