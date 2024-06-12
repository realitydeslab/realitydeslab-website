import { rewritePermalink } from '@/plugins/libs/permalinkParser'
import { __ } from '@/plugins/libs/utils'
import Link from 'next/link'
import { ReactNode } from 'react'
import MetaGroup from '../MetaGroup'

const EntryWrap = ({ children, key }: { key: string; children: ReactNode }) => {
  return (
    <div
      key={key}
      className="x-post-entry flex max-w-content flex-col gap-4 border-b border-primary-400 pb-4 lg:gap-6 lg:pb-6"
    >
      {children}
    </div>
  )
}

const Links = ({
  links,
  title,
  target = '_self',
}: {
  title: string
  links?: string[]
  target?: '_self' | '_blank'
}) => {
  return (
    links &&
    links.length > 0 && (
      <MetaGroup>
        <h2>{title}</h2>
        <div>
          {links.map((link, idx) => (
            <p key={`link_${title}_${idx}`}>
              <Link href={link}>{link}</Link>
            </p>
          ))}
        </div>
      </MetaGroup>
    )
  )
}

const wikilink = (link: string, compact: boolean = false) => {
  const RenderLink = (href: string, title: string) => {
    
    
    
    return <span key={title}>{title}</span> //暂时先不返回链接

    return href !== '/' ? (
      <a key={title} href={href}>
        {title}
      </a>
    ) : (
      <span key={title}>{title}</span>
    )
  }

  const RenderLine = (href: string, title: string) => {
    const a = href !== '/' && (
      <a className="x-link-arrow ml-1 inline-block" href={href}>
        [→]
      </a>
    )
    return (
      <p key={title}>
        {title}
        {a}
      </p>
    )
  }
  const title = __(link)
  const href = rewritePermalink(title)
  return compact ? RenderLink(href, title) : RenderLine(href, title)
}

const wikilinks = (links: string[], compact: boolean = false) =>
  links.map((link) => wikilink(link, compact))

const joinAnchors = (nodes) => {
  return nodes.reduce((accu, elem) => {
    return accu === null ? [elem] : [...accu, ', ', elem]
  }, null)
}
export { wikilinks, wikilink, joinAnchors, EntryWrap, Links }
