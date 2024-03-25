'use client'
import { useEffect, useState } from 'react'
import { truncate } from 'lodash'
import { usePathname } from 'next/navigation'

export const EVENT_PROJECT_SHOW_DESC = 'project.show_description'

type ProjectDesc = {
  title: string
  description: string
  year_range: string
}

export default function ProjectDescription() {
  const pathname = usePathname()
  const [desc, setDesc] = useState<ProjectDesc | null>(null)
  const showYearRange = (year_range: string) => {
    return year_range && year_range !== ' - '
  }
  useEffect(() => {
    setDesc(null)

    const handleShowDescription = (e: CustomEvent) => {
      setDesc(e.detail)
    }
    window.addEventListener(EVENT_PROJECT_SHOW_DESC, handleShowDescription)
    return () => window.removeEventListener(EVENT_PROJECT_SHOW_DESC, handleShowDescription)
  }, [pathname])

  return (
    <div className="x-project-desc absolute inset-x-0 bottom-0 p-10">
      <h3 className="text-[1.25rem] leading-tight">{desc && desc.title}</h3>
      {desc && showYearRange(desc.year_range) && <p className="text-sm">{desc.year_range}</p>}
      <p className="mt-3 text-sm">
        {desc && truncate(desc.description, { length: 150, separator: /,? +/ })}
      </p>
    </div>
  )
}
