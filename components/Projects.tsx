'use client'
import { Project } from 'contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer.js'
import { EVENT_PROJECT_SHOW_DESC } from './ProjectDescription'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import Cover from './Cover'

// Main profile, level 4.0 (up to 1080p), 8-bit: what optimize-cover-videos.mjs writes.
const AV1_TYPE = 'video/mp4; codecs="av01.0.08M.08"'
const PREVIEW_START_EVENT = 'project-preview-start'

function ProjectCard({ project, first, warm }: { project: CoreContent<Project>; first: boolean; warm: boolean }) {
  const [preview, setPreview] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [touchMode, setTouchMode] = useState(false)
  const card = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const touchStart = useRef<number | null>(null)
  const touchPlayback = useRef(false)
  const suppressClick = useRef(false)
  const hasVideo = project.coverVideo_data?.type === 'video'
  const fallback: string | undefined = project.coverVideoFallback_data?.uri
  const light = project.coverTextDark
  const stroke = light ? undefined : 'rgb(0 0 0 / 55%)'
  useEffect(() => {
    const player = video.current
    if (!player) return
    let cancelled = false
    if (preview) {
      let retries = 0
      let retryTimer: number | undefined
      // WebKit may reject play() while it switches from AV1 to H.264.
      // Keep the cover/title visible until playback actually starts.
      const play = () => {
        if (cancelled) return
        player.play().then(() => {
          if (!cancelled) setPlaying(true)
        }).catch((error: DOMException) => {
          if (cancelled) return
          if (error.name === 'NotAllowedError' || retries++ >= 30) {
            setPreview(false)
            return
          }
          retryTimer = window.setTimeout(play, 300)
        })
      }
      if (player.readyState === HTMLMediaElement.HAVE_NOTHING) player.load()
      play()
      return () => {
        cancelled = true
        if (retryTimer) window.clearTimeout(retryTimer)
      }
    } else {
      player.pause()
      player.currentTime = 0
    }
    return () => { cancelled = true }
  }, [preview, loaded])
  // A stale `playing` from the last hover must not reveal the video early.
  const showing = preview && playing
  const startPreview = () => {
    if (hasVideo && window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.dispatchEvent(new CustomEvent(PREVIEW_START_EVENT, { detail: project.slug }))
      setLoaded(true)
      setPlaying(false)
      setPreview(true)
    }
  }
  const videoMounted = hasVideo && (loaded || warm)
  const stopTouchPreview = useCallback(() => {
    touchStart.current = null
    if (touchPlayback.current) {
      touchPlayback.current = false
      setTouchMode(false)
      setPreview(false)
      setLoaded(false)
    }
  }, [])
  useEffect(() => {
    const stopPreviousPreview = (event: Event) => {
      if ((event as CustomEvent<string>).detail === project.slug) return
      video.current?.pause()
      stopTouchPreview()
      setPreview(false)
      setLoaded(false)
      setPlaying(false)
    }
    window.addEventListener(PREVIEW_START_EVENT, stopPreviousPreview)
    return () => window.removeEventListener(PREVIEW_START_EVENT, stopPreviousPreview)
  }, [project.slug, stopTouchPreview])
  useEffect(() => {
    if (!touchMode || !card.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stopTouchPreview()
    })
    observer.observe(card.current)
    return () => observer.disconnect()
  }, [touchMode, stopTouchPreview])
  const startTouchPreview = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== 'touch' || !hasVideo ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    stopTouchPreview()
    suppressClick.current = false
    touchStart.current = Date.now()
    touchPlayback.current = true
    window.dispatchEvent(new CustomEvent(PREVIEW_START_EVENT, { detail: project.slug }))
    setTouchMode(true)
    setLoaded(true)
    setPlaying(false)
    setPreview(true)
  }
  const endTouchPreview = () => {
    if (touchStart.current === null) return
    const held = Date.now() - touchStart.current >= 250
    touchStart.current = null
    if (held) suppressClick.current = true
    else stopTouchPreview()
  }
  return (
    <article ref={card} className="min-w-0 lg:w-full lg:max-w-wide"
      onMouseEnter={() => window.dispatchEvent(new CustomEvent(EVENT_PROJECT_SHOW_DESC, { detail: project }))}
      onMouseLeave={() => { if (!touchPlayback.current) setPreview(false); window.dispatchEvent(new CustomEvent(EVENT_PROJECT_SHOW_DESC, { detail: null })) }}>
        <Link href={project.url} prefetch={false} aria-label={`View ${project.title}`} className="relative block overflow-hidden [container-type:inline-size]"
          onMouseEnter={startPreview} onMouseLeave={() => { if (!touchPlayback.current) { setPreview(false); setLoaded(false) } }}
          onFocus={startPreview} onBlur={() => { if (!touchPlayback.current) { setPreview(false); setLoaded(false) } }}
          onPointerDown={startTouchPreview} onPointerUp={endTouchPreview}
          onPointerCancel={() => { touchStart.current = null; suppressClick.current = true }}
          onContextMenu={(event) => { if (touchPlayback.current) event.preventDefault() }}
          onClick={(event) => {
            if (suppressClick.current) {
              event.preventDefault()
              suppressClick.current = false
            }
          }}>
          <Cover cover={project.cover_data} alt={project.title} eager={first} className="h-auto w-full object-cover" />
          {videoMounted && <video ref={video} src={fallback ? undefined : project.coverVideo_data.uri} muted loop={!touchMode} playsInline
            preload={warm ? 'metadata' : 'none'} aria-hidden="true" tabIndex={-1}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${showing ? 'opacity-100' : 'opacity-0'}`}
            onEnded={() => {
              if (touchPlayback.current) {
                if (touchStart.current !== null) suppressClick.current = true
                stopTouchPreview()
              }
            }}>
            {/* Safari reports AV1 as unplayable without a hardware decoder and moves on to H.264. */}
            {fallback && <source src={project.coverVideo_data.uri} type={AV1_TYPE} />}
            {fallback && <source src={fallback} type="video/mp4" />}
          </video>}
          <span aria-hidden="true"
            className={`pointer-events-none absolute inset-0 flex flex-col items-end justify-end p-3 text-right leading-tight sm:p-6 lg:p-10 transition-opacity duration-200 motion-reduce:transition-none ${light ? 'text-black' : 'text-white'} ${showing ? 'opacity-0' : 'opacity-100'}`}
            style={{ paintOrder: 'stroke fill', textShadow: light ? undefined : '0 1px 3px rgb(0 0 0 / 35%)' }}>
            <span className="text-[clamp(1rem,3.16cqw,2.125rem)] leading-tight" style={{ WebkitTextStroke: stroke && `0.75px ${stroke}` }}>
              {project.title}
            </span>
            {project.description && (
              <span className="mt-2 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(0.625rem,2.8cqw,0.6875rem)] sm:max-w-[70%] sm:overflow-visible sm:text-clip sm:whitespace-normal sm:text-[clamp(0.6875rem,1.86cqw,1.25rem)]" style={{ WebkitTextStroke: stroke && `0.5px ${stroke}` }}>
                {project.description}
              </span>
            )}
          </span>
        </Link>
    </article>
  )
}

export default function Projects({ projects }: { projects: CoreContent<Project>[] }) {
  const list = useRef<HTMLDivElement>(null)
  const [warmIndices, setWarmIndices] = useState<number[]>([])
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    // WebKit requests the entire H.264 file for metadata, even with fast-start MP4s.
    const webkit = /AppleWebKit/.test(navigator.userAgent) && !/(Chrome|Chromium)/.test(navigator.userAgent)
    if (connection?.saveData || webkit || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const maxWarm = window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 2 : 1
    const root = list.current?.closest('main')
    const cards = list.current?.querySelectorAll('article')
    if (!root || !cards?.length || !window.IntersectionObserver) return
    const ratios = new Map<Element, number>()
    let timer: number | undefined
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio)
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const visible = [...cards]
          .map((card, index) => ({ index, ratio: ratios.get(card) ?? 0 }))
          .filter(({ index, ratio }) => ratio > 0.15 && projects[index].coverVideo_data?.type === 'video')
          .sort((a, b) => b.ratio - a.ratio)
          .slice(0, maxWarm)
          .map(({ index }) => index)
        setWarmIndices(visible)
      }, 350)
    }, { root, threshold: [0, 0.25, 0.5, 0.75, 1] })
    cards.forEach((card) => observer.observe(card))
    return () => {
      observer.disconnect()
      if (timer) window.clearTimeout(timer)
    }
  }, [projects])
  return <div ref={list} className="flex min-w-0 flex-col gap-6">{projects.map((project, index) => <ProjectCard key={project.slug} project={project} first={index === 0} warm={warmIndices.includes(index)} />)}</div>
}
