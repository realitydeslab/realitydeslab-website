import type { Metadata } from 'next'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { __ } from '@/libs/utils'
import { allPages, Page as BasePage } from 'contentlayer/generated'
import ArticleTitle from '@/components/ArticleTitle'
import Article from '@/components/Article'
import ArticleHeader from '@/components/ArticleHeader'

export const generateStaticParams = async () => allPages.map((p) => ({ slug: p.slug }))

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params
  const page = allPages.find((p) => p.slug == slug) as BasePage
  return (
    <Article slug={page.slug}>
      <ArticleHeader>
        <ArticleTitle prefix={page.title_prefix}>{page.page_title ?? page.title}</ArticleTitle>
      </ArticleHeader>
      <section className="x-content">
        <MDXLayoutRenderer code={page.body.code} components={components} toc={page.toc} />
      </section>
    </Article>
  )
}
