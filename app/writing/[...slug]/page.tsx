import { Blog, allBlogs } from 'contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { __ } from '@/plugins/libs/utils'
import Authors from '@/components/Authors'
import ArticleTitle from '@/components/ArticleTitle'
import Article from '@/components/Article'
import ArticleHeader from '@/components/ArticleHeader'
import Citation from '@/components/Citation'
import { joinAnchors, wikilinks } from '@/components/helpers/Common'
import NotFound from 'app/not-found'
import MetaGroup from '@/components/MetaGroup'
import Cover from '@/components/Cover'
export const generateStaticParams = async () =>
  allBlogs.map((p) => ({ slug: p.slug ? p.slug.split('/') : null }))

type Props = { blog: Blog }

const Metadata = ({ blog }: Props) => {
  const { media, techs, topics } = blog
  const mediaData = joinAnchors(wikilinks(media, true))
  const techsData = joinAnchors(wikilinks(techs, true))
  const topicsData = joinAnchors(wikilinks(topics, true))

  return (
    <MetaGroup>
      <h2>Metadata</h2>
      <div className="x-metadata grid gap-3 leading-tight">
        {mediaData && (
          <p>
            <span>Media: </span>
            {mediaData}
          </p>
        )}
        {techsData && (
          <p>
            <span>Technologies: </span>
            {techsData}
          </p>
        )}
        {topicsData && (
          <p>
            <span>Research Topics: </span>
            {topicsData}
          </p>
        )}
      </div>
    </MetaGroup>
  )
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = decodeURI(params.slug.join('/'))
  const blog = allBlogs.find((p) => p.slug && p.slug == slug) as Blog

  if (!blog) return <NotFound />

  return (
    <Article slug={blog.slug}>
      <ArticleHeader>
        <ArticleTitle>{blog.title ?? ''}</ArticleTitle>
        <Authors authors={blog.authors} date={blog.date} layout="post" />
        <Cover cover={blog.parsed_cover} alt={blog.title} />
      </ArticleHeader>
      <section className="x-content">
        <MDXLayoutRenderer code={blog.body.code} components={components} toc={blog.toc} />
        <Citation>{blog.citation}</Citation>
        {/* <Publications blog={blog} /> */}
        <Metadata blog={blog} />
        {/* <Credits blog={blog} /> */}
      </section>
    </Article>
  )
}
