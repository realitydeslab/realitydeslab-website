import { __ } from '@/libs/utils'
import moment from 'moment'
import { wikilinks, joinAnchors } from './helpers/Common'

interface Props {
  authors: string[] | null | undefined
  className?: string
  byClassName?: string
  date?: string | undefined
  layout?: 'default' | 'post'
}

export default function Authors({
  authors,
  className = '',
  byClassName = '',
  date,
  layout = 'default',
}: Props) {
  if (!authors) return <></>

  // const names = authors.map((author) => __(author)).join(', ')
  const names = joinAnchors(wikilinks(authors, true))
  const d = date ? moment(date).format('MMM D,YYYY') : null

  switch (layout) {
    case 'post':
      return (
        <p className={`x-authors ${className}`}>
          {date && <span>{d}</span>}
          <span className={`mr-2 border-r border-primary-700 pr-2`}></span>
          {names}
        </p>
      )
    default:
      return (
        <p className={`x-authors flex gap-1 ${className}`}>
          {names && (
            <>
              <span className={`${byClassName}`}>by</span>
              <span>{names}</span>
            </>
          )}
          {date && <span className={`${byClassName}`}>on {d}</span>}
        </p>
      )
  }
}
