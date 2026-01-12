"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { SendEventRequest } from "@/lib/chat-websocket";
import {
  ArrowLeft,
  Send,
  Users,
  Loader2,
  MessageSquare,
  Settings,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";
import { VidstackPlayer } from "@/components/video/vidstack-player";
import { WebinarSettingsModal } from "@/components/webinars/webinar-settings-modal";
import { WebinarBanner } from "@/components/webinars/webinar-banner";
import { roomsApi } from "@/api/rooms";
import { WebinarRoomStats } from "@/types/webinar";

interface WebinarUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

interface WebinarData {
  id: string;
  name: string;
  description: string;
  speaker: string;
  type: string;
  videoUrl: string;
  scheduledDate: string;
  roomStarted: boolean;
  showChat?: boolean;
  isVolumeOn?: boolean;
  bannerUrl?: string;
  showBanner?: boolean;
  btnUrl?: string;
  showBtn?: boolean;
  startedAt?: string;
  createdAt: string;
  user?: WebinarUser;
}

export default function WebinarRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<any>(null);

  const [roomId, setRoomId] = useState<string>("");
  const [webinar, setWebinar] = useState<WebinarData | null>(null);

  // Handle params for client component
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setRoomId(resolvedParams.id);
      } catch {
        // Silent fail - roomId will remain empty
      }
    };

    resolveParams();
  }, [params]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [userName, setUserName] = useState("Гость");
  const [userPhone, setUserPhone] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [onlineParticipants, setOnlineParticipants] = useState(0);
  const [duration, setDuration] = useState("00:00:00");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [webinarStarted, setWebinarStarted] = useState(false);
  const [videoStartTime, setVideoStartTime] = useState(0);

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webinarSettings, setWebinarSettings] = useState({
    showChat: true,
    isVolumeOn: true,
    bannerSettings: {
      show: false,
      text: "",
      button: "",
      buttonUrl: "",
    },
  });

  const {
    messages,
    events,
    isConnected,
    sendMessage,
    sendEvent,
    loadMessages,
  } = useChatWebSocket({
    roomId,
    userIdentifier: userPhone,
    userName,
    autoConnect: !!userPhone && !!userName,
  });

  useEffect(() => {
    if (userPhone && userName) {
      setLoadingHistory(true);
      loadMessages()
        .catch(() => {
          // Silent fail - chat history will be empty
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [userPhone, userName, loadMessages]);

  useEffect(() => {
    if (events.length > 0) {
      events.forEach((event) => {
        switch (event.type) {
          case "event":
            if (event.data.showChat !== undefined) {
              setWebinarSettings((prev) => ({
                ...prev,
                showChat: Boolean(event.data.showChat),
              }));
            }
            if (event.data.isVolumeOn !== undefined) {
              setWebinarSettings((prev) => ({
                ...prev,
                isVolumeOn: Boolean(event.data.isVolumeOn),
              }));
            }
            if (event.data.muted !== undefined) {
              setWebinarSettings((prev) => ({
                ...prev,
                isVolumeOn: !event.data.muted,
              }));
            }
            if (event.data.bannerUrl !== undefined) {
              setWebinarSettings((prev) => ({
                ...prev,
                bannerUrl: event.data.bannerUrl,
              }));
            }
            if (event.data.showBanner !== undefined) {
              setWebinarSettings((prev) => ({
                ...prev,
                showBanner: event.data.showBanner,
              }));
            }
            if (event.data.btnUrl !== undefined) {
              setWebinarSettings((prev) => ({
                ...prev,
                btnUrl: event.data.btnUrl,
              }));
            }
            if (event.data.showBtn !== undefined) {
              setWebinarSettings((prev) => ({
                ...prev,
                showBtn: event.data.showBtn,
              }));
            }
            if (event.data.bannerSettings) {
              const bannerSettings = event.data.bannerSettings as {
                text?: string;
                show?: boolean;
                button?: string;
              };
              setWebinarSettings((prev) => ({
                ...prev,
                bannerUrl: bannerSettings.text || "",
                showBanner: Boolean(bannerSettings.show),
                btnUrl: bannerSettings.button || "",
                showBtn: !!bannerSettings.button,
              }));
            }
            if (event.data.roomStarted !== undefined) {
              setWebinar((prev) =>
                prev ? { ...prev, roomStarted: Boolean(event.data.roomStarted) } : null
              );
            }
            break;

          default:
            // Handle unknown event types silently
            break;
        }
      });
    }
  }, [events]);

  useEffect(() => {
    const fetchWebinarAndValidate = async () => {
      try {
        const webinarResponse = await fetch(
          `https://isracms.vercel.app/api/rooms/${roomId}`
        );

        if (!webinarResponse.ok) {
          console.warn("Failed to fetch webinar, using mock data");
          const mockData: WebinarData = {
            id: roomId,
            name: "Тестовый вебинар",
            description: "Это тестовый вебинар для демонстрации чата",
            speaker: "Спикер",
            type: "webinar",
            videoUrl: "",
            scheduledDate: new Date().toISOString(),
            roomStarted: true,
            showChat: true,
            createdAt: new Date().toISOString(),
          };
          setWebinar(mockData);
          setLoading(false);
          setLoadingHistory(false);
          return;
        }

        const webinarData = await webinarResponse.json();
        setWebinar(webinarData);

        await handleGuestAuth();
      } catch {
        setLoading(false);
        setLoadingHistory(false);

        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные вебинара",
          variant: "destructive",
        });
      }
    };

    const handleGuestAuth = async () => {
      const storedName = localStorage.getItem("user_name");
      const storedPhone = localStorage.getItem("user_phone");

      if (!storedName || !storedPhone) {
        router.push(`/room/${roomId}/auth`);
        return;
      }

      setUserName(storedName);
      setUserPhone(storedPhone);
      setLoading(false);
      setLoadingHistory(false);
    };

    fetchWebinarAndValidate();
  }, [roomId, router, toast]);

  // Timer for duration and sync video
  useEffect(() => {
    if (!webinar?.roomStarted || !webinar?.startedAt) return;

    const startTime = new Date(webinar.startedAt).getTime();

    // Calculate initial elapsed time and set it for video
    const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
    setVideoStartTime(initialElapsed);

    // Calculate elapsed time and set video position
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;

      setDuration(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );

      // Sync video time if player exists and video is not at correct position
      if (videoPlayerRef.current && videoPlayerRef.current.getCurrentTime) {
        const currentTime = videoPlayerRef.current.getCurrentTime();
        const timeDiff = Math.abs(currentTime - elapsed);

        // Only sync if difference is more than 3 seconds to avoid constant adjustments
        if (timeDiff > 3) {
          videoPlayerRef.current.setCurrentTime(elapsed);
        }
      }
    };

    // Initial sync
    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [webinar]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to fetch webinar stats
  const fetchWebinarStats = async () => {
    if (!roomId) return; // Don't fetch if no roomId
    
    try {
      const stats = await roomsApi.getWebinarStats(roomId);
      setOnlineParticipants(stats.onlineParticipants);
      setViewerCount(stats.onlineParticipants);
    } catch {
      // Silent fail - keep using current data
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, events]);

  useEffect(() => {
    if (!loadingHistory) {
      scrollToBottom();
    }
  }, [loadingHistory]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !webinarSettings.showChat || !isConnected)
      return;

    try {
      await sendMessage(messageText);
      setMessageText("");
      setTimeout(scrollToBottom, 100);
    } catch {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!roomId) return; // Don't start fetching until roomId is available
    
    // Fetch stats immediately
    fetchWebinarStats();

    // Set up interval to fetch stats every 10 seconds
    const interval = setInterval(fetchWebinarStats, 10000);

    // Set initial viewer count as fallback
    if (viewerCount === 0) {
      setViewerCount(Math.floor(Math.random() * 50) + 10);
    }

    return () => clearInterval(interval);
  }, [roomId, viewerCount]);

  const handlePlayVideo = () => {
    if (videoPlayerRef.current && webinar?.startedAt) {
      const startTime = new Date(webinar.startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      videoPlayerRef.current.setCurrentTime(elapsed);
      videoPlayerRef.current.play();

      setIsVideoPlaying(true);
      setWebinarStarted(true);
    }
  };

  const handleStopVideo = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.stop();
      setIsVideoPlaying(false);
      setWebinarStarted(false);
    }
  };

  const handleVideoStateChange = (playing: boolean) => {
    setIsVideoPlaying(playing);
  };

  const handleStartWebinar = async () => {
    try {
      if (!webinarStarted) {
        await handlePlayVideo();

        const startEvent: SendEventRequest = {
          type: "webinar_status",
          data: {
            status: "started",
            timestamp: new Date().toISOString(),
            startedBy: userName,
          },
        };

        await sendEvent(startEvent);

        toast({
          title: "Вебинар запущен",
          description: "Вебинар и видео запущены",
          variant: "default",
        });
      } else {
        await handleStopVideo();

        const stopEvent: SendEventRequest = {
          type: "webinar_status",
          data: {
            status: "stopped",
            timestamp: new Date().toISOString(),
            stoppedBy: userName,
          },
        };

        await sendEvent(stopEvent);

        toast({
          title: "Вебинар остановлен",
          description: "Вебинар и видео остановлены",
          variant: "default",
        });
      }
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить состояние вебинара",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground text-lg">Загрузка вебинара...</p>
        </div>
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Вебинар не найден</h2>
            <Button
              onClick={() => router.push("/rooms")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к списку
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/rooms")}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Назад</span>
              </Button>

              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-xl font-bold text-foreground truncate">{webinar.name}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Ведущий: {webinar.speaker}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {webinar.roomStarted && (
                <div className="flex items-center gap-1 sm:gap-2 text-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-mono text-xs sm:text-sm">{duration}</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="shrink-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <WebinarBanner
        show={webinarSettings.bannerSettings.show}
        text={webinarSettings.bannerSettings.text}
        buttonText={webinarSettings.bannerSettings.button}
        buttonUrl={webinarSettings.bannerSettings.buttonUrl}
      />

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        {!webinar.roomStarted ? (
          <div className="min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-160px)] flex items-center justify-center">
            <Card className="max-w-md w-full mx-2">
              <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 text-center space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Вебинар еще не начался
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Этот вебинар пока не запущен организатором. Пожалуйста,
                    подождите немного или вернитесь позже.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {webinar.scheduledDate ? (
                        <>
                          Запланировано на:{" "}
                          {new Date(webinar.scheduledDate).toLocaleDateString(
                            "ru-RU",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </>
                      ) : (
                        <>Время начала будет объявлено позже</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                  <Button
                    onClick={() => router.push("/rooms")}
                    className="w-full"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Вернуться к списку вебинаров
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                    size="sm"
                  >
                    Обновить страницу
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-6 h-[calc(100vh-100px)] sm:h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)]">
            {/* Video Player - First on mobile, second on desktop */}
            <Card
              className={`flex flex-col order-1 lg:order-2 ${webinarSettings.showChat ? "lg:col-span-2" : "lg:col-span-3"} min-h-0`}
            >
              <CardContent className="p-0 flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-0">
                <div className="w-full h-full bg-black rounded-lg overflow-hidden">
                  <VidstackPlayer
                    ref={videoPlayerRef}
                    src={
                      webinar.videoUrl ||
                      "https://www.youtube.com/watch?v=6fty5yB7bFo"
                    }
                    autoPlay={webinar.roomStarted}
                    muted={!webinarSettings.isVolumeOn}
                    controls={true}
                    aspectRatio="16/9"
                    startTime={videoStartTime}
                    onPlayStateChange={handleVideoStateChange}
                  />
                </div>
              </CardContent>

              {webinar.description && (
                <div className="p-3 sm:p-4 border-t border-border">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1 sm:mb-2">
                    О вебинаре
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{webinar.description}</p>
                </div>
              )}
            </Card>

            {/* Chat - Second on mobile, first on desktop */}
            {webinarSettings.showChat && (
              <Card className="lg:col-span-1 lg:order-1 flex flex-col order-2 min-h-0 h-[300px] sm:h-[400px] lg:h-auto">
                <div className="p-2 sm:p-4 border-b border-border shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-1 sm:gap-2">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="truncate">Чат</span>
                    </h2>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {isConnected ? (
                        <div className="text-green-500">
                          <Wifi className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      ) : (
                        <div className="text-red-500">
                          <WifiOff className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">{onlineParticipants} онлайн</span>
                        <span className="sm:hidden">{onlineParticipants}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 min-h-0">
                  {loadingHistory ? (
                    <div className="text-center text-muted-foreground py-6 sm:py-8">
                      <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 animate-spin opacity-50" />
                      <p className="text-xs sm:text-sm">Загрузка истории сообщений...</p>
                    </div>
                  ) : messages.length === 0 && events.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6 sm:py-8">
                      <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                      <p className="text-xs sm:text-sm">Пока нет сообщений</p>
                      <p className="text-xs">Будьте первым, кто напишет!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-baseline gap-1 sm:gap-2">
                            <span className="font-semibold text-primary text-xs sm:text-sm truncate">
                              {msg.username}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                              {new Date(msg.createdAt).toLocaleTimeString(
                                "ru-RU",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-foreground text-xs sm:text-sm bg-muted/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 break-words">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-2 sm:p-4 border-t border-border shrink-0">
                  <div className="flex gap-1 sm:gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Написать сообщение..."
                      disabled={!isConnected}
                      className="disabled:opacity-50 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !isConnected}
                      size="sm"
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <WebinarSettingsModal
        webinar={webinar}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onlineParticipants={onlineParticipants}
        onSettingsUpdate={(updatedWebinar) => {
          setWebinar((prev) => (prev ? { ...prev, ...updatedWebinar } : null));
          if (updatedWebinar.showChat !== undefined) {
            setWebinarSettings((prev) => ({
              ...prev,
              showChat: updatedWebinar.showChat!,
            }));
          }
        }}
      />
    </div>
  );
}
