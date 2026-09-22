'use client'
import { Project } from 'contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer.js'
import { EVENT_PROJECT_SHOW_DESC } from './ProjectDescription'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Cover from './Cover'

function ProjectCard({ project, first }: { project: CoreContent<Project>; first: boolean }) {
  const [preview, setPreview] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const hasVideo = project.coverVideo_data?.type === 'video'
  const light = project.coverTextDark
  const stroke = light ? undefined : 'rgb(0 0 0 / 55%)'
  useEffect(() => {
    const player = video.current
    if (!player) return
    let cancelled = false
    if (preview) {
      player.play().catch(() => { if (!cancelled) setPreview(false) })
    } else {
      player.pause()
      player.currentTime = 0
    }
    return () => { cancelled = true }
  }, [preview])
  const startPreview = () => {
    if (hasVideo && window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLoaded(true)
      setPreview(true)
    }
  }
  return (
    <article className="min-w-0 lg:w-full lg:max-w-wide"
      onMouseEnter={() => window.dispatchEvent(new CustomEvent(EVENT_PROJECT_SHOW_DESC, { detail: project }))}
      onMouseLeave={() => { setPreview(false); window.dispatchEvent(new CustomEvent(EVENT_PROJECT_SHOW_DESC, { detail: null })) }}>
        <Link href={project.url} aria-label={`View ${project.title}`} className="relative block overflow-hidden [container-type:inline-size]"
          onMouseEnter={startPreview} onMouseLeave={() => setPreview(false)}
          onFocus={startPreview} onBlur={() => setPreview(false)}>
          <Cover cover={project.cover_data} alt={project.title} eager={first} className="h-auto w-full object-cover" />
          {loaded && <video ref={video} src={project.coverVideo_data.uri} muted loop playsInline
            preload="none" aria-hidden="true" tabIndex={-1}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${preview ? 'opacity-100' : 'opacity-0'}`}
            poster={project.cover_data?.uri} onError={() => setPreview(false)} />}
          <span aria-hidden="true"
            className={`pointer-events-none absolute inset-0 flex flex-col items-end justify-end p-6 text-right leading-tight lg:p-10 transition-opacity duration-200 motion-reduce:transition-none ${light ? 'text-black' : 'text-white'} ${preview ? 'opacity-0' : 'opacity-100'}`}
            style={{ paintOrder: 'stroke fill', textShadow: light ? undefined : '0 1px 3px rgb(0 0 0 / 35%)' }}>
            <span className="text-[clamp(1rem,3.16cqw,2.125rem)] leading-tight" style={{ WebkitTextStroke: stroke && `0.75px ${stroke}` }}>
              {project.title}
            </span>
            {project.description && (
              <span className="mt-2 max-w-[70%] text-[clamp(0.6875rem,1.86cqw,1.25rem)]" style={{ WebkitTextStroke: stroke && `0.5px ${stroke}` }}>
                {project.description}
              </span>
            )}
          </span>
        </Link>
    </article>
  )
}

export default function Projects({ projects }: { projects: CoreContent<Project>[] }) {
  return <div className="flex min-w-0 flex-col gap-6">{projects.map((project, index) => <ProjectCard key={project.slug} project={project} first={index === 0} />)}</div>
}
