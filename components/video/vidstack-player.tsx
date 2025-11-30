'use client'

interface VidstackPlayerProps {
  src?: string
  poster?: string
  title?: string
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  aspectRatio?: string
}

export function VidstackPlayer({
  src,
  poster,
  title = 'Video Player',
  autoPlay = true,
  muted = true,
  controls = true,
  aspectRatio = '16/9',
}: VidstackPlayerProps) {
  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null

    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  // Handle YouTube URLs
  if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
    const videoId = getYoutubeVideoId(src)
    if (!videoId) {
      return (
        <div className={`w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center`} style={{ aspectRatio }}>
          <div className="text-white text-center">
            <p>Invalid YouTube URL</p>
          </div>
        </div>
      )
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? '1' : '0'}&mute=${muted ? '1' : '0'}&controls=${controls ? '1' : '0'}&rel=0&modestbranding=1`

    return (
      <div className={`w-full h-full bg-black rounded-lg overflow-hidden`} style={{ aspectRatio }}>
        <iframe
          className="w-full h-full"
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  // Handle direct video URLs with HTML5 video
  const videoSource = src && src.match(/\.(mp4|webm|ogg|mov)$/i) ? src : null

  // Default to a demo video if no valid source is provided
  const finalSource = videoSource || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div className={`w-full h-full bg-black rounded-lg overflow-hidden`} style={{ aspectRatio }}>
      <video
        className="w-full h-full"
        title={title}
        src={finalSource}
        poster={poster}
        crossOrigin=""
        playsInline
        autoPlay={autoPlay}
        muted={muted}
        controls={controls}
      />
    </div>
  )
}