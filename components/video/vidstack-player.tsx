'use client'

import {
  MediaPlayer,
  MediaOutlet,
  MediaCommunitySkin,
  MediaPoster,
  type MediaPlayerProps,
} from '@vidstack/react'
import React, { useRef } from 'react'

interface VidstackPlayerProps extends Omit<MediaPlayerProps, 'src'> {
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
  ...mediaPlayerProps
}: VidstackPlayerProps) {
  // Handle YouTube URLs and other video formats
  const getVideoSource = (url: string) => {
    if (!url) return null

    // Handle YouTube URLs - Vidstack supports YouTube directly
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // For YouTube, Vidstack expects the watch URL
      return url
    }

    // Handle direct video URLs
    if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
      return url
    }

    return url
  }

  const videoSource = src ? getVideoSource(src) : null

  // Default to a demo video if no source is provided
  const finalSource = videoSource || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  return (
    <div className={`w-full h-full bg-black rounded-lg overflow-hidden`} style={{ aspectRatio }}>
      <MediaPlayer
        className="w-full h-full"
        title={title}
        src={finalSource}
        poster={poster}
        crossOrigin=""
        playsInline
        autoPlay={autoPlay}
        muted={muted}
        {...mediaPlayerProps}
      >
        <MediaOutlet>
          {poster && <MediaPoster alt={title} />}
        </MediaOutlet>
        {controls && <MediaCommunitySkin />}
      </MediaPlayer>
    </div>
  )
}