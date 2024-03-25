import { Author, allAuthors, allProjects } from 'contentlayer/generated'
import { __ } from '@/plugins/libs/utils'
import ArticleTitle from '@/components/ArticleTitle'
import Article from '@/components/Article'
import ArticleHeader from '@/components/ArticleHeader'
import NotFound from 'app/not-found'
import MetaGroup from '@/components/MetaGroup'
import { ReactNode } from 'react'
import { wikilinks } from '@/components/helpers/Common'
import { authorPublications } from '@/components/helpers/Entry'

export const generateStaticParams = async () => allAuthors.map((p) => ({ slug: p.slug.split('/') }))

const Metainfo = ({ title, children }: { title: string; children: ReactNode | string }) => {
  return (
    <p>
      <span>{title}: </span>
      {children}
    </p>
  )
}

const a = (link: string) => {
  return (
    <a href={link} target="_blank" rel="nofollow">
      {link}
    </a>
  )
}

const AuthorProjects = ({ name }: { name: string }) => {
  const projects = allProjects
    .filter((p) => {
      return p.authors.some((a) => __(a) == name)
    })
    .map((p) => p.title)

  return (
    projects.length > 0 && (
      <MetaGroup>
        <h2>projects</h2>
        <div>{wikilinks(projects)}</div>
      </MetaGroup>
    )
  )
}

const Info = ({ author }: { author: Author }) => {
  const {
    position,
    email,
    affiliation,
    location,
    orcid,
    github,
    zotero,
    linkedin,
    website,
    twitter,
    biography,
  } = author

  return (
    <>
      <MetaGroup>
        <h2>infomation</h2>
        <div>
          {position && <Metainfo title="position">{__(position)}</Metainfo>}
          {email && (
            <Metainfo title="email">
              <a href={`mailto:${email}`}>{email}</a>
            </Metainfo>
          )}
          {affiliation && <Metainfo title="affiliation">{__(affiliation)}</Metainfo>}
          {location && <Metainfo title="location">{__(location)}</Metainfo>}
          {orcid && <Metainfo title="orcid">{__(orcid)}</Metainfo>}
          {github && <Metainfo title="github">{__(github)}</Metainfo>}
          {zotero && <Metainfo title="zotero">{__(zotero)}</Metainfo>}
          {linkedin && <Metainfo title="linkedin">{a(linkedin)}</Metainfo>}
          {website && <Metainfo title="website">{a(website)}</Metainfo>}
          {twitter && <Metainfo title="twitter">{a(twitter)}</Metainfo>}
        </div>
      </MetaGroup>
      <MetaGroup>
        <h2>biography</h2>
        <div>
          <p className="leading-normal">{biography}</p>
        </div>
      </MetaGroup>
    </>
  )
}

const Publications = ({ name }: { name: string }) => {
  const publications = authorPublications(name)
  return (
    Array.isArray(publications) && (
      <MetaGroup>
        <h2>publications</h2>
        <div>{publications}</div>
      </MetaGroup>
    )
  )
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const slug = decodeURI(params.slug.join('/'))
  const author = allAuthors.find((p) => p.slug == slug) as Author

  if (!author) return <NotFound />

  return (
    <Article>
      <ArticleHeader>
        <ArticleTitle>{author.name}</ArticleTitle>
      </ArticleHeader>
      <section className="x-content">
        <Info author={author} />
        <AuthorProjects name={author.name} />
        <Publications name={author.name} />
      </section>
    </Article>
  )
}
