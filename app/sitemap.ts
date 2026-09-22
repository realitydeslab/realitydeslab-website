import { MetadataRoute } from 'next'
import { allDocuments } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = ['/', '/writing', '/code', '/teaching', ...allDocuments
    .filter((doc) => 'published' in doc && doc.published === true)
    .map((doc) => doc.url)]
  return [...new Set(urls)].map((url) => ({ url: new URL(url, siteMetadata.siteUrl).href }))
}
