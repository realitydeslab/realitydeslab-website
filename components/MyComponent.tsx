import { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  className?: string
}

export default function MyComponent({ title, children, className }: Props) {
  return <div className={className}>{children}</div>
}
