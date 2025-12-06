"use client";

import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  startTime?: number; // Это время от начала вебинара (из props)
  disableInteraction?: boolean;
  roomId?: string;
}

export interface VidstackPlayerRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  isPlaying: () => boolean;
  getCurrentTime: () => number;
  setCurrentTime: (time: number) => void;
}

const VidstackPlayer = forwardRef<VidstackPlayerRef, VidstackPlayerProps>(
  (
    {
      src,
      poster,
      title = "Video Player",
      autoPlay = true,
      muted = true,
      controls = true,
      aspectRatio = "16/9",
      showCustomControls = false,
      onPlayStateChange,
      startTime = 0,
      disableInteraction = false,
      roomId,
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStopped, setIsStopped] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const hasSetInitialTime = useRef(false);
    const lastSyncTime = useRef<number>(0);

    // YouTube API
    const postMessageToYouTube = (action: string, value?: string) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: action,
            args: value ? [value] : [],
          }),
          "*"
        );
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsStopped(false);

      if (videoRef.current) {
        videoRef.current.play();
      } else if (iframeRef.current) {
        postMessageToYouTube("playVideo");
      }

      onPlayStateChange?.(true);
    };

    const handlePause = () => {
      setIsPlaying(false);

      if (videoRef.current) {
        videoRef.current.pause();
      } else if (iframeRef.current) {
        postMessageToYouTube("pauseVideo");
      }

      onPlayStateChange?.(false);
    };

    const handleStop = () => {
      setIsPlaying(false);
      setIsStopped(true);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } else if (iframeRef.current) {
        postMessageToYouTube("stopVideo");
      }

      onPlayStateChange?.(false);
    };

    const getCurrentTime = () => {
      if (videoRef.current) {
        return videoRef.current.currentTime;
      }
      return 0;
    };

    const setCurrentTime = (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      } else if (iframeRef.current) {
        postMessageToYouTube("seekTo", time.toString());
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        play: handlePlay,
        pause: handlePause,
        stop: handleStop,
        isPlaying: () => isPlaying,
        getCurrentTime,
        setCurrentTime,
      }),
      [isPlaying]
    );

    // Для HTML5 видео: синхронизация с startTime
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedMetadata = () => {
        if (!hasSetInitialTime.current && startTime > 0) {
          video.currentTime = startTime;
          hasSetInitialTime.current = true;
          // console.log("✅ Set HTML5 video time to:", startTime);

          if (autoPlay) {
            video.play().catch(console.error);
          }
        }
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }, [startTime, autoPlay]);

    // Периодическая синхронизация для HTML5 (каждые 30 секунд)
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !autoPlay) return;

      const syncInterval = setInterval(() => {
        if (video.paused) return;

        const currentVideoTime = video.currentTime;
        const expectedTime =
          startTime + (Date.now() - lastSyncTime.current) / 1000;
        const drift = Math.abs(currentVideoTime - expectedTime);

        // Если разница больше 3 секунд, синхронизируем
        if (drift > 3) {
          // console.log("🔄 Syncing video time. Drift:", drift);
          video.currentTime = startTime;
        }
      }, 30000);

      lastSyncTime.current = Date.now();

      return () => clearInterval(syncInterval);
    }, [startTime, autoPlay]);

    // События HTML5 видео
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handlePlayEvent = () => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      };

      const handlePauseEvent = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };

      const handleEndedEvent = () => {
        setIsPlaying(false);
        setIsStopped(true);
        onPlayStateChange?.(false);
      };

      const preventPause = (e: Event) => {
        if (disableInteraction && isPlaying) {
          e.preventDefault();
          video.play();
        }
      };

      video.addEventListener("play", handlePlayEvent);
      video.addEventListener("pause", handlePauseEvent);
      video.addEventListener("ended", handleEndedEvent);

      if (disableInteraction) {
        video.addEventListener("pause", preventPause);
      }

      return () => {
        video.removeEventListener("play", handlePlayEvent);
        video.removeEventListener("pause", handlePauseEvent);
        video.removeEventListener("ended", handleEndedEvent);
        video.removeEventListener("pause", preventPause);
      };
    }, [onPlayStateChange, disableInteraction, isPlaying]);

    const getYoutubeVideoId = (url: string) => {
      if (!url) return null;

      const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : null;
    };

    // YouTube - ВСЕГДА используем startTime из props
    if (src && (src.includes("youtube.com") || src.includes("youtu.be"))) {
      const videoId = getYoutubeVideoId(src);
      if (!videoId) {
        return (
          <div
            className={`w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center`}
            style={{ aspectRatio }}
          >
            <div className="text-white text-center">
              <p>Invalid YouTube URL</p>
            </div>
          </div>
        );
      }

      // Используем startTime напрямую (это время с момента начала вебинара)
      const currentStartTime = Math.floor(startTime);

      // YouTube URL с текущим временем
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? "1" : "0"}&mute=${muted ? "1" : "0"}&controls=${controls && !showCustomControls ? "1" : "0"}&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&enablejsapi=1&cc_load_policy=0&hl=en&playlist=${videoId}&loop=1&fs=0&autohide=1&widgetid=1&start=${currentStartTime}`;

      // console.log("🎬 YouTube loading at:", currentStartTime, "seconds");

      return (
        <div
          className={`w-full h-full bg-black rounded-lg overflow-hidden relative`}
          style={{ aspectRatio }}
        >
          <style jsx>{`
            iframe[src*="youtube.com"] {
              pointer-events: ${disableInteraction ? "none" : "auto"};
            }

            .ytp-title-text,
            .ytp-title,
            .ytp-title-channel,
            .ytp-impression-link,
            .ytp-chrome-top,
            .ytp-chrome-bottom,
            .ytp-show-cards-title,
            .ytp-videowall-still-info,
            .ytp-branding,
            .ytp-branding-img,
            .ytp-watermark,
            .ytp-watermark-text,
            .ytp-pause-overlay,
            .ytp-recommendations,
            .ytp-suggestion,
            .ytp-suggestion-set,
            .ytp-upnext,
            .ytp-endscreen,
            .ytp-endscreen-content,
            .ytp-related-on-error-overlay,
            .ytp-player-content,
            .ytp-related-container,
            .ytp-button,
            .ytp-next-button,
            .ytp-prev-button,
            .ytp-menu-button,
            .ytp-share-button,
            .ytp-button.ytp-overflow-button,
            .ytp-button.ytp-settings-button,
            .ytp-ce-element,
            .ytp-ce,
            .ytp-ce-video,
            .ytp-ce-playlist,
            .ytp-ce-channel,
            .ytp-autonav-endscreen,
            .ytp-autonav-overlay,
            .ytp-ad-overlay,
            .ytp-cards-button,
            .ytp-cards-teaser,
            .ytp-invideo-ad-clickthrough-overlay,
            .ytp-ad-message-overlay,
            .ytp-info-panel,
            .ytp-info-panel-content,
            .ytp-info-panel-title,
            .ytp-info-panel-text,
            .ytp-related-videos,
            .ytp-suggested-video,
            .ytp-more-videos,
            .ytp-video-wall,
            .ytp-watch-later,
            .ytp-share-options,
            .html5-endscreen,
            .html5-endscreen-content,
            .ytp-endscreen-showcase,
            .ytp-endscreen-takeover,
            .videowall-endscreen {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              position: absolute !important;
              left: -9999px !important;
              top: -9999px !important;
              width: 0 !important;
              height: 0 !important;
              overflow: hidden !important;
            }
          `}</style>

          {/* Добавляем key чтобы iframe перезагружался при изменении startTime */}
          <iframe
            key={`youtube-${currentStartTime}`}
            ref={iframeRef}
            className="w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              pointerEvents: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
          />

          <div
            className="absolute inset-0 z-30 cursor-default"
            style={{ pointerEvents: "auto" }}
            onClick={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />

          <div
            className="absolute bottom-0 left-0 right-0 bg-black z-25 pointer-events-none"
            style={{
              height: showCustomControls ? "24px" : "40px",
              display: "block",
            }}
          />

          {showCustomControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 z-40 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="h-8 w-8 p-0"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStop}
                  className="h-8 w-8 p-0"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // HTML5 видео
    const videoSource = src && src.match(/\.(mp4|webm|ogg|mov)$/i) ? src : null;
    const finalSource =
      videoSource ||
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    return (
      <div
        className={`w-full h-full bg-black rounded-lg overflow-hidden relative`}
        style={{ aspectRatio }}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          title={title}
          src={finalSource}
          poster={poster}
          crossOrigin=""
          playsInline
          autoPlay={autoPlay}
          muted={muted}
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          style={{
            pointerEvents: "none",
          }}
        />

        <div
          className="absolute inset-0 z-30 cursor-default"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        />

        {showCustomControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 z-40">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={isPlaying ? handlePause : handlePlay}
                className="h-8 w-8 p-0"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleStop}
                className="h-8 w-8 p-0"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

VidstackPlayer.displayName = "VidstackPlayer";

export { VidstackPlayer };
