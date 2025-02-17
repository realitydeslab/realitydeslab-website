'use client'
import Link from './Link'
import Submenu from './Submenu'
import { usePathname } from 'next/navigation'
import headerNavLinks from '@/data/headerNavLinks'
import { useEffect, useState } from 'react'
import { EVENT_PROJECT_SHOW_DESC } from './ProjectDescription'

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
  const [hasProjectDescription, setHasProjectDescription] = useState(false)

  useEffect(() => {
    setHasProjectDescription(false)
    const handleShowDescription = (e: CustomEvent) => {
      setHasProjectDescription(!!e.detail)
    }
    window.addEventListener(EVENT_PROJECT_SHOW_DESC, handleShowDescription)
    return () => window.removeEventListener(EVENT_PROJECT_SHOW_DESC, handleShowDescription)
  }, [pathname])

  return (
    <nav
      className={`x-menu mt-12 flex flex-1 flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2 ${hasProjectDescription && '-mt-3'}`}
    >
      {headerNavLinks
        .filter((link) => link.href !== '/')
        .map((link) =>
          link.children ? (
            <Submenu title={link.title} key={`${link.title}_${pathname}`} open={defaultOpen}>
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
