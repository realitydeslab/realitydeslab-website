'use client'

import { useState, useEffect } from 'react'
import Brand from './Brand'
import Menu from './Menu'
import { usePathname } from 'next/navigation'

const MobileNav = () => {
  const [openPath, setOpenPath] = useState<string | null>(null)
  const pathname = usePathname()
  const navShow = openPath === pathname

  const onToggleNav = () => setOpenPath(navShow ? null : pathname)
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    main.style.overflow = navShow ? 'hidden' : 'auto'
    return () => { main.style.overflow = 'auto' }
  }, [navShow])
  useEffect(() => { document.querySelector('main')?.scrollTo(0, 0) }, [pathname])

  return (
    <nav className="relative z-10  grid h-full p-5 lg:hidden">
      <div className="items-top flex justify-between">
        <Brand />
        <button aria-label="Toggle Menu" aria-expanded={navShow} aria-controls="mobile-menu" onClick={onToggleNav} className="grid h-11 w-11 pt-1">
          <svg
            className={`place-self-center ${navShow ? 'hidden' : 'block'}`}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="4" width="18" height="2" fill="black" />
            <rect x="3" y="11" width="18" height="2" fill="black" />
            <rect x="3" y="18" width="18" height="2" fill="black" />
          </svg>
          <svg
            className={`place-self-center ${navShow ? 'block' : 'hidden'}`}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="4.57544"
              y="17.793"
              width="19"
              height="2"
              transform="rotate(-45 4.57544 17.793)"
              fill="black"
            />
            <rect
              x="5.9895"
              y="4.79297"
              width="19"
              height="2"
              transform="rotate(45 5.9895 4.79297)"
              fill="black"
            />
          </svg>
        </button>
      </div>
      <div id="mobile-menu" inert={!navShow}
        className={`fixed inset-0 z-[-1] bg-white pt-[5.625rem] ${
          navShow ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="max-h-full overflow-y-auto px-5 pb-5">
          <Menu defaultOpen={true} />
        </div>
      </div>
    </nav>
  )
}

export default MobileNav
