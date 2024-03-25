import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  style: object
  align: 'left' | 'right' | undefined
}

export default function ImageControl({ children, style, align }: Props) {
  return (
    <div style={style} className="x-image-control" data-align={align}>
      {children}
    </div>
  )
}
