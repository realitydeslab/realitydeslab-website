/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'

const CustomLink = ({
  href,
  className,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')
  const classNames =
    'text-primary-500 transition-all duration-150 hover:text-primary-900 ' +
    (className ? className : '')
  if (isInternalLink) {
    return <Link className={classNames} href={href} {...rest} />
  }

  if (isAnchorLink) {
    return <a className={classNames} href={href} {...rest} />
  }

  return (
    <a className={classNames} target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  )
}

export default CustomLink
