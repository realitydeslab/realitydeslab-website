'use client'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import Video from './Video'
import Image from 'next/image'

interface Props {
  slides: {
    type: string
    uri: string
  }[]
  noVideo?: boolean
}

const Slideshow = ({ slides, noVideo }: Props) => {
  return slides.length ? (
    <div className="x-slideshow aspect-video">
      <Swiper
        navigation
        modules={[Navigation]}
        onSlideChange={() => {
          window.dispatchEvent(new Event('slideshow.change'))
        }}
      >
        {slides
          .filter((slide) => {
            if (slide.type == 'img') return true
            if (slide.type == 'video') return !noVideo
          })
          .map(({ type, uri }) => (
            <SwiperSlide key={uri}>
              {type == 'video' ? (
                <Video src={uri} pauseWhenSlideChange />
              ) : (
                <Image
                  className="aspect-video h-auto bg-primary-300 object-cover lg:w-full"
                  sizes="100vw"
                  fill={true}
                  src={uri}
                  alt={type}
                />
              )}
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  ) : (
    <></>
  )
}

export default Slideshow
