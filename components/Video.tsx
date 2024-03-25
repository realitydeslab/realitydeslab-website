'use client'

import { useState, useRef, useEffect } from 'react'
interface Props {
  src: string
  pauseWhenSlideChange?: boolean
}

const Video = ({ src, pauseWhenSlideChange }: Props) => {
  const [videoPlay, setVideoPlay] = useState(false)
  const vidRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (pauseWhenSlideChange) {
      const handleSlideChnage = () => {
        vidRef.current?.pause()
      }
      window.addEventListener('slideshow.change', handleSlideChnage)
      return () => window.removeEventListener('slideshow.change', handleSlideChnage)
    }
  })

  const togglePlay = () => {
    const { current } = vidRef
    const playing = !current?.paused
    setVideoPlay(!playing)
    vidRef.current?.toggleAttribute('controls', !playing)
    vidRef.current && (playing ? vidRef.current.pause() : vidRef.current.play())
  }

  return (
    <div className="relative">
      <button
        className="group absolute inset-[30%] z-10 flex cursor-pointer items-center  justify-center transition-all duration-150"
        onClick={togglePlay}
      >
        <svg
          className={
            videoPlay ? 'opacity-0 group-hover:opacity-100' : ' opacity-80 group-hover:opacity-100'
          }
          width="29"
          height="45"
          viewBox="0 0 29 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 44.7832V0.783203L29 22.7832L0 44.7832Z" fill="white" />
        </svg>
      </button>
      <video ref={vidRef} src={src}>
        <track kind="captions" srcLang="en" label="english_captions" />
      </video>
    </div>
  )
}

export default Video
