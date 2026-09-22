import { resolveVideoUrl } from '@/libs/video-url.mjs'

// Embeds assume 16:9. A project whose master is another shape declares it per
// video in `videoAspect:`, index-matched to `videos:` (e.g. "2/1"). Anything
// unparseable falls back rather than reaching the style attribute.
const DEFAULT_ASPECT = '16 / 9'

function parseAspect(value: string | undefined) {
  const match = /^\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?)\s*)?$/.exec(value ?? '')
  if (!match) return DEFAULT_ASPECT
  const width = Number(match[1])
  const height = match[2] === undefined ? 1 : Number(match[2])
  if (!(width > 0) || !(height > 0)) return DEFAULT_ASPECT
  return `${width} / ${height}`
}

function Embed({ video, index, aspect }: { video: string; index: number; aspect?: string }) {
  const resolved = resolveVideoUrl(video)
  if (!resolved) return <p>Video link unavailable.</p>
  return (
    <figure className="w-full min-w-0">
      <iframe allowFullScreen
        allow="fullscreen; picture-in-picture; encrypted-media; autoplay"
        loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
        className="h-auto w-full bg-black" style={{ aspectRatio: parseAspect(aspect) }}
        title={`${resolved.provider} project video ${index + 1}`} src={resolved.src} />
    </figure>
  )
}

export default function IframeVideo({ videos, aspects }: { videos: string[] | undefined; aspects?: string[] }) {
  return videos?.map((video, index) => (
    <Embed key={video} video={video} index={index} aspect={aspects?.[index]} />
  ))
}
