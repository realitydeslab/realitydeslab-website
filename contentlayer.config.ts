import 'dotenv/config'
import { makeSource } from 'contentlayer2/source-files'
import path from 'path'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
// import siteMetadata from './data/siteMetadata'
import permalinks from './.cache/permalinks.json'

import _ from 'lodash'
import { Blog as BlogDef } from './defs/blog'
import { Author as AuthorDef } from './defs/author'
import { Project as ProjectDef } from './defs/project'
import { Page as PageDef } from './defs/page'
import { Code as CodeDef } from './defs/code'
import { Course as CourseDef } from './defs/course'

import { remarkExtractFrontmatter, remarkCodeTitles } from 'pliny/mdx-plugins/index.js'
import rehypeHiddenElement from './plugins/rehypeHiddenElement'
import remarkParseMedia from './plugins/remark-parse-media'
import remarkWikiLink from './plugins/remark-wiki-link'

export const Blog = BlogDef
export const Author = AuthorDef
export const Project = ProjectDef
export const Page = PageDef
export const Code = CodeDef
export const Course = CourseDef
import { vault_root } from './defs/common'

export default makeSource({
  // contentDirInclude: ['Projects', 'Blogs', 'Meta', 'Webpages', 'Codes'],//隐藏部分内容，暂不全量发布
  contentDirInclude: ['Projects', 'Webpages', 'Codes', 'Blogs', 'Courses'],
  documentTypes: [Code, Project, Page, Blog, Course, Author],
  disableImportAliasWarning: true,
  contentDirPath: vault_root,
  contentDirExclude: ['.obsidian'],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkExtractFrontmatter,
      remarkGfm,
      // remarkCodeTitles,
      remarkMath,
      [remarkWikiLink, { permalinks }],
      [remarkParseMedia, { useJSX: true }], //img tag to Next Image
    ],
    rehypePlugins: [
      rehypeHiddenElement,
      rehypeSlug,
      rehypeKatex,
      [
        rehypeCitation,
        {
          path: path.join(process.cwd(), vault_root),
          suppressBibliography: true,
          linkCitations: true,
        },
      ],
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
      rehypePresetMinify,
    ],
  },
})
