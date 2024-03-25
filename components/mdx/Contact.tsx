import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  style: object
  title: string
}

export default function Contact({ children, style, title }: Props) {
  return (
    <div style={style} className="x-contact">
      <label>{title}</label>
      <div>{children}</div>
    </div>
  )
}
