import { Code, allCodes } from 'contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components.js'
import { __ } from '@/libs/utils'
import Authors from '@/components/Authors'
import ArticleTitle from '@/components/ArticleTitle'
import Article from '@/components/Article'
import ArticleHeader from '@/components/ArticleHeader'
import ArticleMeta from '@/components/ArticleMeta'
import { notFound } from 'next/navigation'
import Cover from '@/components/Cover'

export const generateStaticParams = async () => allCodes.map((p) => ({ slug: p.slug.split('/') }))

type Props = { code: Code }

const CodeRepo = ({ code }: Props) => {
  return (
    code.repos.length && (
      <div className="flex flex-col gap-1 font-code lg:gap-4">
        {/* {code.version && <p className="text-24 lg:text-32">{code.version}</p>} */}
        <p>
          <a className="font-code text-xs hover:text-accent-500" href={code.repos[0]}>
            {code.repos[0]}
          </a>
        </p>
      </div>
    )
  )
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug.join('/')
  const code = allCodes.find((p) => p.slug == slug) as Code

  return code ? (
    <Article slug={code.slug}>
      <ArticleHeader>
        <ArticleTitle>{code.title ?? ''}</ArticleTitle>

        <Authors authors={code.authors} />
        <CodeRepo code={code} />

        <Cover cover={code.parsed_cover} alt={code.title} />
      </ArticleHeader>
      <section className="x-content">
        <MDXLayoutRenderer code={code.body.code} components={components} toc={code.toc} />
      </section>
    </Article>
  ) : (
    notFound()
  )
}
