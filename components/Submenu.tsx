'use client'
import { useState, ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface Props {
  children: ReactNode
  title: string
  open: boolean
}

const Submenu = ({ title, children, open = false }: Props) => {
  const [menuShow, setMenuShow] = useState<boolean>(open)
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-4">
      <button
        className={
          pathname == '/'
            ? 'cursor-pointer text-left text-primary-900'
            : 'duration-400 cursor-pointer text-left text-primary-500 transition-all hover:text-primary-900'
        }
        onClick={() => setMenuShow(!menuShow)}
      >
        {title}
      </button>
      <div className={menuShow ? 'flex flex-col gap-2 px-6' : 'hidden'}>{children}</div>
    </div>
  )
}

export default Submenu
