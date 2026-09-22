// Only known HTTPS providers can become frames. Preserve Vimeo unlisted hashes.
export function resolveVideoUrl(value) {
  let url
  try { url = new URL(value) } catch { return null }
  if (!['https:', 'http:'].includes(url.protocol)) return null
  const host = url.hostname.toLowerCase()
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const parts = url.pathname.split('/').filter(Boolean)
    const index = parts.findIndex((part) => /^\d+$/.test(part))
    if (index < 0) return null
    const result = new URL(`https://player.vimeo.com/video/${parts[index]}`)
    const hash = url.searchParams.get('h') || parts[index + 1]
    if (hash && /^[a-zA-Z0-9]+$/.test(hash)) result.searchParams.set('h', hash)
    // Use the native full-screen player on iPhone when the viewer presses play.
    result.searchParams.set('playsinline', '0')
    return { src: result.href, provider: 'Vimeo', original: value.replace(/^http:/, 'https:') }
  }
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(host)) {
    const parts = url.pathname.split('/').filter(Boolean)
    const id = host === 'youtu.be' ? parts[0] : url.searchParams.get('v') || (['embed', 'shorts'].includes(parts[0]) ? parts[1] : '')
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id || '')) return null
    return { src: `https://www.youtube-nocookie.com/embed/${id}?playsinline=0`, provider: 'YouTube', original: `https://www.youtube.com/watch?v=${id}` }
  }
  return null
}
