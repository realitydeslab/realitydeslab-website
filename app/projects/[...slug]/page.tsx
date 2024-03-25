import { Project, allProjects } from 'contentlayer/generated'
import { components } from '@/components/MDXComponents'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { __ } from '@/plugins/libs/utils'
import Authors from '@/components/Authors'
import ArticleTitle from '@/components/ArticleTitle'
import Article from '@/components/Article'
import ArticleHeader from '@/components/ArticleHeader'
import ArticleMeta from '@/components/ArticleMeta'
import IframeVideo from '@/components/IframeVideo'
import Citation from '@/components/Citation'
import { joinAnchors, wikilink, wikilinks } from '@/components/helpers/Common'
import NotFound from 'app/not-found'
import MetaGroup from '@/components/MetaGroup'
import { Links } from '@/components/helpers/Common'
import { entryRecognitions } from '@/components/helpers/Entry'
import Image from 'next/image'

export const generateStaticParams = async () =>
  allProjects.map((p) => ({ slug: p.slug.split('/') }))

const Publications = ({ project }: { project: Project }) => {
  const { papers, exhibitions, awards, otherEntries } = project

  const showBlock =
    (papers.length || exhibitions.length || awards.length || otherEntries.length) > 0

  return (
    showBlock && (
      <MetaGroup>
        <h2>publications</h2>
        <div>
          {entryRecognitions(papers)}
          {entryRecognitions(awards)}
          {entryRecognitions(exhibitions)}
          {entryRecognitions(otherEntries)}
        </div>
      </MetaGroup>
    )
  )
}

const Metadata = ({ project }: { project: Project }) => {
  const { media, techs, topics } = project

  return (
    (media.length || techs.length || topics.length) > 0 && (
      <MetaGroup>
        <h2>metadata</h2>
        <div>
          {media.length ? (
            <p>
              <span>Media: </span>
              {joinAnchors(wikilinks(media, true))}
            </p>
          ) : (
            <></>
          )}
          {techs.length ? (
            <p>
              <span>Technologies: </span>
              {joinAnchors(wikilinks(techs, true))}
            </p>
          ) : (
            <></>
          )}
          {topics.length ? (
            <p>
              <span>Research Topics: </span>
              {joinAnchors(wikilinks(topics, true))}
            </p>
          ) : (
            <></>
          )}
        </div>
      </MetaGroup>
    )
  )
}

const Credits = ({ project }: { project: Project }) => {
  return (
    project.credits?.length && (
      <MetaGroup>
        <h2>credits</h2>
        <div>
          {project.credits.map((credit, idx) => {
            return (
              <p key={`${credit.person}_${idx}`}>
                <span>{__(credit.role)}: </span>
                {wikilink(credit.person, true)}
              </p>
            )
          })}
        </div>
      </MetaGroup>
    )
  )
}

const Preview = ({ project }: { project: Project }) => {
  return (
    project.preview_data && (
      <MetaGroup>
        <div className="relative">
          {project.preview_data.map((preview, index) => {
            return (
              <Image
                key={preview.uri}
                alt={`project image ${index}`}
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
                src={preview.uri}
              />
            )
          })}
        </div>
      </MetaGroup>
    )
  )
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = decodeURI(params.slug.join('/'))
  const project = allProjects.find((p) => p.slug == slug) as Project

  if (!project) return <NotFound />

  return (
    <Article>
      <ArticleHeader>
        <ArticleTitle>{project.title}</ArticleTitle>
        <ArticleMeta>
          {project.year_range && <p>{project.year_range}</p>}
          <Authors authors={project.authors} />
        </ArticleMeta>
        <IframeVideo videos={project.videos}></IframeVideo>
      </ArticleHeader>
      <section className="x-content">
        <MDXLayoutRenderer code={project.body.code} components={components} toc={project.toc} />
        <Citation>{project.citation}</Citation>
        <Links title="websites" links={project.websites} target="_blank" />
        <Links title="repos" links={project.repos} target="_blank" />
        <Publications project={project} />
        <Metadata project={project} />
        <Credits project={project} />
        <Preview project={project} />
      </section>
    </Article>
  )
}
