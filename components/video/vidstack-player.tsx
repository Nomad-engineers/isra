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
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isStopped, setIsStopped] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const hasSetInitialTime = useRef(false);

    // Control functions for YouTube iframe
    const postMessageToYouTube = (action: string, value?: string) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
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

    // Expose methods via ref
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

    // Handle video events for HTML5 video
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

      const handleLoadedMetadata = () => {
        if (!hasSetInitialTime.current && startTime > 0) {
          video.currentTime = startTime;
          hasSetInitialTime.current = true;
          if (autoPlay) {
            video.play().catch(console.error);
          }
        }
      };

      video.addEventListener("play", handlePlayEvent);
      video.addEventListener("pause", handlePauseEvent);
      video.addEventListener("ended", handleEndedEvent);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("play", handlePlayEvent);
        video.removeEventListener("pause", handlePauseEvent);
        video.removeEventListener("ended", handleEndedEvent);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }, [onPlayStateChange, startTime, autoPlay]);

    // Extract YouTube video ID from URL
    const getYoutubeVideoId = (url: string) => {
      if (!url) return null;

      const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : null;
    };

    // Handle YouTube URLs
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

      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? "1" : "0"}&mute=${muted ? "1" : "0"}&controls=${controls && !showCustomControls ? "1" : "0"}&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&enablejsapi=1&cc_load_policy=0&hl=en&playlist=${videoId}&loop=1&fs=0&autohide=1&widgetid=1${startTime > 0 ? `&start=${Math.floor(startTime)}` : ""}`;

      return (
        <div
          className={`w-full h-full bg-black rounded-lg overflow-hidden relative`}
          style={{ aspectRatio }}
        >
          <style jsx>{`
            /* Hide YouTube video title and all related elements */
            iframe[src*="youtube.com"] {
              pointer-events: none;
            }

            /* Hide title overlays and branding */
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
            .ytp-watermark-text {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }

            /* Hide "More videos" and recommendations */
            .ytp-pause-overlay,
            .ytp-recommendations,
            .ytp-suggestion,
            .ytp-suggestion-set,
            .ytp-upnext,
            .ytp-endscreen,
            .ytp-endscreen-content,
            .ytp-related-on-error-overlay,
            .ytp-player-content,
            .ytp-related-container {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }

            /* Hide buttons and interactive elements */
            .ytp-button,
            .ytp-next-button,
            .ytp-prev-button,
            .ytp-menu-button,
            .ytp-share-button,
            .ytp-button.ytp-overflow-button,
            .ytp-button.ytp-settings-button {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }

            /* Hide any overlays that might contain titles or suggestions */
            .ytp-ce-element,
            .ytp-ce,
            .ytp-ce-video,
            .ytp-ce-playlist,
            .ytp-ce-channel,
            .ytp-autonav-endscreen,
            .ytp-autonav-overlay {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }

            /* Hide YouTube's overlay advertisements and cards */
            .ytp-ad-overlay,
            .ytp-cards-button,
            .ytp-cards-teaser,
            .ytp-invideo-ad-clickthrough-overlay,
            .ytp-ad-message-overlay {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }

            /* Hide YouTube's video info and suggestions */
            .ytp-info-panel,
            .ytp-info-panel-content,
            .ytp-info-panel-title,
            .ytp-info-panel-text {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }

            /* Hide YouTube's "More videos" and end screen suggestions more aggressively */
            .ytp-pause-overlay,
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
            .videowall-endscreen,
            .ytp-cards-button,
            .ytp-cards-teaser {
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
          <iframe
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
            onLoad={() => {
              if (iframeRef.current) {
                iframeRef.current.onload = () => {
                  const hideOverlays = () => {
                    const iframe = iframeRef.current;
                    if (iframe && iframe.contentWindow) {
                      try {
                        iframe.contentWindow.postMessage(
                          JSON.stringify({
                            event: "command",
                            func: "hideAnnotations",
                            args: [],
                          }),
                          "*"
                        );
                      } catch (e) {
                        // Expected due to cross-origin
                      }
                    }
                  };

                  const monitorSuggestions = () => {
                    const suggestionSelectors = [
                      ".ytp-pause-overlay",
                      ".ytp-related-videos",
                      ".ytp-suggested-video",
                      ".ytp-more-videos",
                      ".ytp-video-wall",
                      ".html5-endscreen",
                      ".ytp-endscreen-showcase",
                      ".videowall-endscreen",
                      '[class*="endscreen"]',
                      '[class*="suggestion"]',
                      '[class*="related"]',
                    ];

                    suggestionSelectors.forEach((selector) => {
                      try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach((el) => {
                          const htmlEl = el as HTMLElement;
                          if (htmlEl && htmlEl.style.display !== "none") {
                            htmlEl.style.display = "none";
                            htmlEl.style.opacity = "0";
                            htmlEl.style.visibility = "hidden";
                            htmlEl.style.position = "absolute";
                            htmlEl.style.left = "-9999px";
                            htmlEl.style.top = "-9999px";
                          }
                        });
                      } catch (e) {
                        // Ignore errors
                      }
                    });
                  };

                  setTimeout(hideOverlays, 1000);
                  setTimeout(hideOverlays, 3000);
                  setTimeout(hideOverlays, 5000);

                  setTimeout(monitorSuggestions, 2000);
                  setInterval(monitorSuggestions, 5000);
                };
              }
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black via-black/90 to-transparent z-20 pointer-events-none"
            style={{ height: "20%" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent z-20 pointer-events-none"
            style={{
              height: showCustomControls ? "60px" : "25%",
              display: "block",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-black z-25 pointer-events-none"
            style={{
              height: showCustomControls ? "24px" : "40px",
              display: "block",
            }}
          />
          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/60 to-transparent z-20 pointer-events-none" />

          {showCustomControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 z-30 pointer-events-none">
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

    // Handle direct video URLs with HTML5 video
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
          style={{
            pointerEvents: "none",
          }}
        />
        {showCustomControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4">
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
