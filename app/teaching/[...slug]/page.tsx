import { Course, allCourses } from 'contentlayer/generated'
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

export const generateStaticParams = async () => allCourses.map((p) => ({ slug: p.slug.split('/') }))

type Props = { course: Course }

const CourseRepo = ({ course }: Props) => {
  return (
    course.repos.length && (
      <div className="flex flex-col gap-1 font-code lg:gap-4">
        {/* {code.version && <p className="text-24 lg:text-32">{code.version}</p>} */}
        <p>
          <a className="font-code text-xs hover:text-accent-500" href={course.repos[0]}>
            {course.repos[0]}
          </a>
        </p>
      </div>
    )
  )
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = decodeURI(params.slug.join('/'))

  const course = allCourses.find((p) => p.slug == slug) as Course

  return course ? (
    <Article slug={course.slug}>
      <ArticleHeader>
        <ArticleTitle>{course.title ?? ''}</ArticleTitle>

        <Authors authors={course.authors} />
        <CourseRepo course={course} />

        <Cover cover={course.parsed_cover} alt={course.title} />
      </ArticleHeader>
      <section className="x-content">
        <MDXLayoutRenderer code={course.body.code} components={components} toc={course.toc} />
      </section>
    </Article>
  ) : (
    <NotFound />
  )
}
