import { MetadataRoute } from 'next'
import { allPages, allProjects } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const projectRoutes = allProjects
    .filter((project) => !project.draft)
    .map((project) => ({
      url: `${siteUrl}/${project.url}`,
      lastModified: new Date().toISOString().split('T')[0],
    }))

  const pageRoutes = allPages
    .filter((page) => !page.draft)
    .map((page) => ({
      url: `${siteUrl}/${page.url}`,
      lastModified: new Date().toISOString().split('T')[0],
    }))

  return [...pageRoutes, ...projectRoutes]
}
