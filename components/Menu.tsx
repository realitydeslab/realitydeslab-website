'use client'
import Link from './Link'
import Submenu from './Submenu'
import { usePathname } from 'next/navigation'
import headerNavLinks from '@/data/headerNavLinks'
import { useEffect, useState } from 'react'

type Props = {
  defaultOpen?: boolean
}

const shouldActive = (pathname: string, href: string): boolean => {
  if (pathname == href) return true
  const matched = pathname.match(/(\/\w+)\/.+/)
  if (matched && matched[1] == href) return true
  return false
}

const Menu = ({ defaultOpen = false }: Props) => {
  const pathname = usePathname()

  return (
    <nav className="x-menu grid gap-4">
      {headerNavLinks
        .filter((link) => link.href !== '/')
        .map((link) =>
          link.children ? (
            <Submenu
              title={link.title}
              key={`${link.title}_${pathname}`}
              open={defaultOpen || link.children.some((c) => c.href == pathname)}
            >
              {link.children.map((child, index) => (
                <Link
                  key={child.codename + index}
                  href={child.href}
                  className={`${pathname === child.href ? 'text-primary-900' : ''}`}
                >
                  {child.codename}
                </Link>
              ))}
            </Submenu>
          ) : (
            <Link
              key={link.title}
              href={link.href}
              className={`${shouldActive(pathname, link.href) ? 'text-primary-900' : ''}`}
            >
              {link.title}
            </Link>
          )
        )}
    </nav>
  )
}

export default Menu
