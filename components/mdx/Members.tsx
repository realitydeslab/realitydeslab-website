import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  style: object
}

export default function Members({ children, style }: Props) {
  return (
    <div style={style} className="x-members">
      {children}
    </div>
  )
}
