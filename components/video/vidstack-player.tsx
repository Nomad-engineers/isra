"use client";

import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { Play } from "lucide-react";

// Vidstack CSS imports - REQUIRED for player to render correctly
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface VidstackPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  aspectRatio?: string;
  showCustomControls?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  startTime?: number;
}

export interface VidstackPlayerRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  isPlaying: () => boolean;
  getCurrentTime: () => number;
  setCurrentTime: (time: number) => void;
}

// Extract YouTube video ID from various URL formats
function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  // Handle various YouTube URL formats
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube\.com\/user\/[^/]+\/\?v=)([^#&?\n]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const regex of regexPatterns) {
    const match = url.match(regex);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }

  // Try extracting from standard watch URL
  const urlParams = new URLSearchParams(url.split("?")[1] || "");
  const vParam = urlParams.get("v");
  if (vParam && vParam.length === 11) {
    return vParam;
  }

  return null;
}

// Convert URL to Vidstack-compatible source
function getVidstackSource(url: string): string {
  if (!url) {
    return "https://stream.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM.m3u8";
  }

  // Check if it's a YouTube URL
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
      // Vidstack uses youtube/VIDEO_ID format
      return `youtube/${videoId}`;
    }
  }

  // Return as-is for other URLs (mp4, webm, hls, etc.)
  return url;
}

// Play overlay component with animation
function PlayOverlay({
  onPlay,
  poster,
}: {
  onPlay: () => void;
  poster?: string;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onPlay}
      style={{
        backgroundImage: poster ? `url(${poster})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay on top of poster */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Play Button */}
        <div className="relative">
          {/* Pulsing rings */}
          <div className="absolute inset-0 animate-ping-slow rounded-full bg-primary/30" />
          <div
            className="absolute inset-0 animate-ping-slower rounded-full bg-primary/20"
            style={{ animationDelay: "0.5s" }}
          />

          {/* Main button */}
          <button
            className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/50 hover:scale-110 transition-transform duration-300 group"
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
          >
            <Play className="w-10 h-10 md:w-14 md:h-14 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Text labels with animation */}
        <div className="flex flex-col items-center gap-2 text-center px-4">
          {/* Kazakh text */}
          <p className="text-white text-lg md:text-xl font-semibold animate-fade-in-up">
          Вебинарды көру үшін басыңыз
          </p>
          {/* Russian text */}
          <p className="text-white/80 text-base md:text-lg animate-fade-in-up-delay">
          Нажмите, чтобы смотреть вебинар
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 animate-fade-in-up-delay-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-red-400 font-bold text-sm uppercase tracking-wider">
            Live • Тікелей эфир
          </span>
        </div>
      </div>
    </div>
  );
}

const VidstackPlayer = forwardRef<VidstackPlayerRef, VidstackPlayerProps>(
  (
    {
      src,
      poster,
      title = "Video Player",
      // autoPlay not used - always show overlay first
      muted = true,
      controls = true,
      aspectRatio = "16/9",
      onPlayStateChange,
      startTime = 0,
    },
    ref
  ) => {
    const playerRef = useRef<MediaPlayerInstance>(null);
    const [isCurrentlyPlaying, setIsCurrentlyPlaying] = useState(false);
    // Always show overlay on load - user must click to start watching
    const [showPlayOverlay, setShowPlayOverlay] = useState(true);

    // Convert source
    const videoSource = getVidstackSource(src || "");

    // Determine source type for styling - only HLS/DASH have quality selection in Vidstack
    const isHLS = src?.includes(".m3u8");
    const isDASH = src?.includes(".mpd");
    const hasQualityOptions = isHLS || isDASH;

    // Handle play overlay click
    const handlePlayOverlayClick = useCallback(() => {
      // Hide overlay first
      setShowPlayOverlay(false);
      
      // Start playback - the player should already be mounted
      const player = playerRef.current;
      if (player) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          player.play().catch(() => {
            // Autoplay might be blocked, but overlay is already hidden
            // User can click the native play button
          });
        });
      }
    }, []);

    // Handle play state changes
    const handlePlay = useCallback(() => {
      setIsCurrentlyPlaying(true);
      setShowPlayOverlay(false);
      onPlayStateChange?.(true);
    }, [onPlayStateChange]);

    const handlePause = useCallback(() => {
      setIsCurrentlyPlaying(false);
      onPlayStateChange?.(false);
    }, [onPlayStateChange]);

    const handleEnded = useCallback(() => {
      setIsCurrentlyPlaying(false);
      onPlayStateChange?.(false);
    }, [onPlayStateChange]);

    // Set initial time when loaded
    const handleCanPlay = useCallback(() => {
      if (startTime > 0 && playerRef.current) {
        playerRef.current.currentTime = startTime;
      }
    }, [startTime]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          setShowPlayOverlay(false);
          if (playerRef.current) {
            playerRef.current.play().catch(() => {
              // Autoplay might be blocked
            });
          }
        },
        pause: () => {
          playerRef.current?.pause();
        },
        stop: () => {
          if (playerRef.current) {
            playerRef.current.pause();
            playerRef.current.currentTime = 0;
          }
        },
        isPlaying: () => isCurrentlyPlaying,
        getCurrentTime: () => playerRef.current?.currentTime || 0,
        setCurrentTime: (time: number) => {
          if (playerRef.current) {
            playerRef.current.currentTime = time;
          }
        },
      }),
      [isCurrentlyPlaying]
    );

    // Set up event listeners
    useEffect(() => {
      const player = playerRef.current;
      if (!player) return;

      player.addEventListener("play", handlePlay);
      player.addEventListener("pause", handlePause);
      player.addEventListener("ended", handleEnded);
      player.addEventListener("can-play", handleCanPlay);

      return () => {
        player.removeEventListener("play", handlePlay);
        player.removeEventListener("pause", handlePause);
        player.removeEventListener("ended", handleEnded);
        player.removeEventListener("can-play", handleCanPlay);
      };
    }, [handlePlay, handlePause, handleEnded, handleCanPlay]);

    return (
      <div
        className={`w-full h-full bg-black rounded-lg overflow-hidden vidstack-live-player relative ${
          !hasQualityOptions ? "vidstack-no-quality" : ""
        }`}
        style={{ aspectRatio }}
      >
        {/* Play overlay - shown until user clicks (only if not autoPlay) */}
        {showPlayOverlay && (
          <PlayOverlay onPlay={handlePlayOverlayClick} poster={poster} />
        )}

        <MediaPlayer
          ref={playerRef}
          title={title}
          src={videoSource}
          poster={poster}
          viewType="video"
          streamType="live"
          logLevel="warn"
          crossOrigin
          playsInline
          autoPlay={false} // Always start paused, user clicks overlay to play
          muted={muted}
          className="w-full h-full"
        >
          <MediaProvider>
            {poster && <Poster className="vds-poster" alt={title} />}
          </MediaProvider>
          {controls && (
            <DefaultVideoLayout
              icons={defaultLayoutIcons}
              // Disable playback rate (speed control) - only 1x available
              playbackRates={[1]}
              // Hide unnecessary menu items - keep Quality visible
              slots={{
                // Keep playbackMenuLoop null to hide loop checkbox
                playbackMenuLoop: null,
                // Remove accessibility menu items
                accessibilityMenuItemsStart: null,
                accessibilityMenuItemsEnd: null,
                // Remove audio menu items
                audioMenuItemsStart: null,
                audioMenuItemsEnd: null,
                // Remove captions menu items (subtitles)
                captionsMenuItemsStart: null,
                captionsMenuItemsEnd: null,
              }}
            />
          )}
        </MediaPlayer>
      </div>
    );
  }
);

VidstackPlayer.displayName = "VidstackPlayer";

export { VidstackPlayer };
