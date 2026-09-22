import { resolveVideoUrl } from '@/libs/video-url.mjs'

function Embed({ video, index }: { video: string; index: number }) {
  const resolved = resolveVideoUrl(video)
  if (!resolved) return <p>Video link unavailable.</p>
  return (
    <figure className="w-full min-w-0">
      <iframe allowFullScreen
        allow="fullscreen; picture-in-picture; encrypted-media; autoplay"
        loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video h-auto w-full bg-black"
        title={`${resolved.provider} project video ${index + 1}`} src={resolved.src} />
    </figure>
  )
}

export default function IframeVideo({ videos }: { videos: string[] | undefined }) {
  return videos?.map((video, index) => <Embed key={video} video={video} index={index} />)
}
