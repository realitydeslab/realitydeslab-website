const IframeVideo = ({ videos }: { videos: string[] | undefined }) => {
  if (!videos || !videos.length) {
    return <></>
  }

  return videos.map((video, idx) => {
    return (
      <iframe
        allowFullScreen={true}
        key={`video_${idx}`}
        className="aspect-video h-auto w-full"
        title={`iframe-video-${idx}`}
        src={resoveVideoUrl(video)}
      ></iframe>
    )
  })
}

function youtube_parser(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length == 11 ? `http://www.youtube.com/embed/${match[7]}` : null
}

const resoveVideoUrl = (url: string): string => {
  if (url.indexOf('vimeo') >= 0) {
    const videoId = url.match(/vimeo.com\/(\d+)/)
    return videoId ? `https://player.vimeo.com/video/${videoId[1]}?api=1` : url
  } else {
    return youtube_parser(url) ?? url
  }
}

export default IframeVideo
