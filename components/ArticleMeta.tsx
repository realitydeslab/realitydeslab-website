import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function ArticleMeta({ children, className = '' }: Props) {
  return (
    <section className={`flex flex-col gap-1 text-14 leading-normal lg:text-base ${className}`}>
      {children}
    </section>
  )
}
