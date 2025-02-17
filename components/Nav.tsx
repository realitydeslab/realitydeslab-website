'use client'

import MobileNav from './MobileNav'
import ProjectDescription from './ProjectDescription'
import { usePathname } from 'next/navigation'
import Brand from './Brand'
import Menu from './Menu'
const Nav = () => {
  const pathname = usePathname()

  return (
    <header className="relative lg:overflow-hidden" data-path={pathname}>
      <div className="hidden w-[16.875rem] flex-col p-10 pr-5 lg:flex max-h-screen">
        <Brand />
        <Menu />
        <ProjectDescription />
      </div>
      <MobileNav />
    </header>
  )
}

export default Nav
