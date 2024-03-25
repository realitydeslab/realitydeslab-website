import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  style: object
}

export default function Contacts({ children, style }: Props) {
  return (
    <address style={style} className="x-contacts">
      {children}
    </address>
  )
}
