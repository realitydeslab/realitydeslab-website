import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string | undefined
}

const MetaGroup = ({ className = '', children }: Props) => {
  return <div className={`x-meta-group ${className}`}>{children}</div>
}

export default MetaGroup
