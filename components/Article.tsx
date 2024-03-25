import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  layout?: 'content' | 'wide'
  slug?: string
}

export default function Article({ slug, children, className = '', layout = 'content' }: Props) {
  return (
    <article
      className={`flex flex-1 flex-col gap-6 lg:gap-[3.75rem] x-article-${
        slug ?? 'default'
      } ${className} ${layout == 'wide' ? 'max-w-wide' : 'max-w-content'}`}
    >
      {children}
    </article>
  )
}
