import { Code, allCodes } from 'contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { __ } from '@/plugins/libs/utils'
import Authors from '@/components/Authors'
import ArticleTitle from '@/components/ArticleTitle'
import Article from '@/components/Article'
import ArticleHeader from '@/components/ArticleHeader'
import ArticleMeta from '@/components/ArticleMeta'
import NotFound from 'app/not-found'
import Cover from '@/components/Cover'

export const generateStaticParams = async () => allCodes.map((p) => ({ slug: p.slug.split('/') }))

type Props = { code: Code }

const CodeRepo = ({ code }: Props) => {
  return (
    code.repos.length && (
      <div className="flex flex-col gap-1 pt-3 font-code lg:gap-4 lg:pt-9">
        {code.version && <p className="text-24 lg:text-32">{code.version}</p>}
        <p>
          <a className="hover:text-accent-500" href={code.repos[0]}>
            {code.repos[0]}
          </a>
        </p>
      </div>
    )
  )
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = decodeURI(params.slug.join('/'))
  const code = allCodes.find((p) => p.slug == slug) as Code

  return code ? (
    <Article slug={code.slug}>
      <ArticleHeader>
        <ArticleTitle>{code.title ?? ''}</ArticleTitle>
        <Authors authors={code.authors} />
        <Cover cover={code.parsed_cover} alt={code.title} />
        <ArticleMeta>
          <CodeRepo code={code} />
        </ArticleMeta>
      </ArticleHeader>
      <section className="x-content">
        <MDXLayoutRenderer code={code.body.code} components={components} toc={code.toc} />
      </section>
    </Article>
  ) : (
    <NotFound />
  )
}
