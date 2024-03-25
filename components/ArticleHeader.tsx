import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function ArticleHeader({ children, className = '' }: Props) {
  return (
    <section className={`flex flex-col gap-4 leading-tight lg:gap-6 ${className}`}>
      {children}
    </section>
  )
}
