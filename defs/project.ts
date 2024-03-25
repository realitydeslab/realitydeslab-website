import { defineDocumentType } from 'contentlayer/source-files'
import { __, collect } from '../plugins/libs/utils'
import _ from 'lodash'

import { vault_root, computedFields, parsePermalink } from './common'

const resolveWikiLinks = (data) => data.array().map((token) => parsePermalink(token))

export const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: vault_root + '/Projects/**/*.md',
  onExtraFieldData: 'ignore',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    codename: { type: 'string', required: true },
    completed: { type: 'boolean' },
    draft: { type: 'boolean' },
    published: { type: 'boolean' },
    yearStart: { type: 'number' },
    yearEnd: { type: 'number' },
    description: { type: 'string' },
    cover: { type: 'string' },
    coverVideo: { type: 'string' },
    videos: { type: 'list', of: { type: 'string' } },
    coverSlides: { type: 'list', of: { type: 'string' }, default: [] },
    preview: { type: 'list', of: { type: 'string' }, default: [] },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    categories: { type: 'list', of: { type: 'string' }, default: [] },
    topics: { type: 'list', of: { type: 'string' }, default: [] },
    media: { type: 'list', of: { type: 'string' }, default: [] },
    techs: { type: 'list', of: { type: 'string' }, default: [] },
    authors: { type: 'list', of: { type: 'string' }, default: [] },
    websites: { type: 'list', of: { type: 'string' }, default: [] },
    repos: { type: 'list', of: { type: 'string' }, default: [] },
    papers: { type: 'list', of: { type: 'string' }, default: [] },
    exhibitions: { type: 'list', of: { type: 'string' }, default: [] },
    workshops: { type: 'list', of: { type: 'string' }, default: [] },
    awards: { type: 'list', of: { type: 'string' }, default: [] },
    reports: { type: 'list', of: { type: 'string' }, default: [] },
    talks: { type: 'list', of: { type: 'string' }, default: [] },
    blogs: { type: 'list', of: { type: 'string' }, default: [] },
    relatedWorks: { type: 'list', of: { type: 'string' }, default: [] },
    credits: { type: 'list', of: { type: 'json' } },
    otherEntries: { type: 'list', of: { type: 'string' }, default: [] },
    citation: { type: 'string' },
  },
  computedFields: {
    ...computedFields,
    preview_data: {
      type: 'list',
      of: { type: 'json' },
      resolve: (doc) => resolveWikiLinks(doc.preview),
    },
    cover_data: {
      type: 'json',
      resolve: (doc) => parsePermalink(doc.cover ?? ''),
    },
    coverVideo_data: {
      type: 'json',
      resolve: (doc) => parsePermalink(doc.coverVideo ?? ''),
    },
    coverSlides_data: {
      type: 'list',
      of: { type: 'json' },
      resolve: (doc) => resolveWikiLinks(doc.coverSlides),
    },
    year_range: {
      type: 'string',
      resolve: (doc) => {
        const { yearStart, yearEnd } = doc
        if (yearStart && yearEnd) {
          return `${doc.yearStart ?? ''} - ${doc.yearEnd ?? ''}`
        } else if (yearStart) {
          return `${yearStart}`
        } else {
          return null
        }
      },
    },
  },
}))
