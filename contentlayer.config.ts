import { makeSource } from 'contentlayer/source-files'
import { writeFileSync } from 'fs'
import { slug } from 'github-slugger'
import path from 'path'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { remarkHandleWikiLink } from './plugins/remarkHandleWikiLink'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
// import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
import { remarkWikiLink } from '@portaljs/remark-wiki-link'

import _ from 'lodash'
import { Blog as BlogDef } from './defs/blog'
import { Author as AuthorDef } from './defs/author'
import { Project as ProjectDef } from './defs/project'
import { Page as PageDef } from './defs/page'
import { Code as CodeDef } from './defs/code'
import { Course as CourseDef } from './defs/course'
import { permalinks, vault_root, target_root } from './defs/common'

import { remarkExtractFrontmatter, remarkImgToJsx } from 'pliny/mdx-plugins/index.js'
import rehypeHiddenElement from './plugins/rehypeHiddenElement'
import { remarkImgToNextImage } from './plugins/remarkImageToNextImage'

const root = process.cwd()

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
// function createTagCount(allBlogs) {
//   const tagCount: Record<string, number> = {}
//   allBlogs.forEach((file) => {
//     if (file.tags && (!isProduction || file.draft !== true)) {
//       file.tags.forEach((tag) => {
//         const formattedTag = slug(tag)
//         if (formattedTag in tagCount) {
//           tagCount[formattedTag] += 1
//         } else {
//           tagCount[formattedTag] = 1
//         }
//       })
//     }
//   })
//   writeFileSync('./app/tag-data.json', JSON.stringify(tagCount))
// }

// function createSearchIndex(allBlogs) {
//   if (
//     siteMetadata?.search?.provider === 'kbar' &&
//     siteMetadata.search.kbarConfig.searchDocumentsPath
//   ) {
//     writeFileSync(
//       `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
//       JSON.stringify(allCoreContent(sortPosts(allBlogs)))
//     )
//     console.log('Local search index generated...')
//   }
// }

export const Blog = BlogDef
export const Author = AuthorDef
export const Project = ProjectDef
export const Page = PageDef
export const Code = CodeDef
export const Course = CourseDef

export default makeSource({
  contentDirPath: vault_root,
  // contentDirInclude: ['Projects', 'Blogs', 'Meta', 'Webpages', 'Codes'],//隐藏部分内容，暂不全量发布
  contentDirInclude: ['Projects', 'Webpages', 'Codes', 'Blogs', 'Courses'],
  documentTypes: [Code, Project, Page, Blog, Course, Author],
  disableImportAliasWarning: true,
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      // remarkCodeTitles,
      remarkMath,
      [remarkWikiLink, { pathFormat: 'obsidian-short', permalinks }],
      [remarkHandleWikiLink, { vault_root, target_root, permalinks, pathFormat: 'obsidian-short' }],
      [remarkImgToNextImage, { target_root }],
      // remarkImgToJsx,
    ],
    rehypePlugins: [
      rehypeHiddenElement,
      rehypeSlug,
      // rehypeAutolinkHeadings,
      rehypeKatex,
      [rehypeCitation, { path: path.join(root, vault_root), suppressBibliography: true, linkCitations: true }],
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      rehypePresetMinify,
    ],
  },
  onSuccess: async (importData) => {
    // const { allBlogs } = await importData()
    // createTagCount(allBlogs)
    // createSearchIndex(allBlogs)
  },
})
