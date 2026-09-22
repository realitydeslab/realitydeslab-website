'use client'

import { useEffect, useRef, useState, type VideoHTMLAttributes } from 'react'

type Props = VideoHTMLAttributes<HTMLVideoElement> & {
  src: string
  title?: string
  pauseWhenSlideChange?: boolean
}

export default function Video({ src, title = 'Project video', pauseWhenSlideChange, ...props }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!pauseWhenSlideChange) return
    const pause = () => ref.current?.pause()
    window.addEventListener('slideshow.change', pause)
    return () => window.removeEventListener('slideshow.change', pause)
  }, [pauseWhenSlideChange])

  return (
    <figure className="x-video min-w-0">
      <video {...props} ref={ref} src={src} aria-label={title} controls playsInline={false} preload="metadata"
        className="aspect-video w-full bg-black object-contain"
        onError={() => setMessage('This video could not load.')}
      />
      {message && <p role="status" className="text-14">{message}</p>}
    </figure>
  )
}
