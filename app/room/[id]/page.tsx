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
  Info,
} from "lucide-react";
import { VidstackPlayer } from "@/components/video/vidstack-player";
import { WebinarSettingsModal } from "@/components/webinars/webinar-settings-modal";
import { WebinarBanner } from "@/components/webinars/webinar-banner";
import { roomsApi } from "@/api/rooms";

import { WebinarRoomStats } from "@/types/webinar";
import { apiFetch } from "@/lib/api-fetch";


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
  welcomeMessage?: string;
  createdAt: string;
  user?: WebinarUser;
}

interface SystemMessage {
  id: string;
  type: 'system' | 'welcome' | 'info';
  message: string;
  timestamp: string;
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

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setRoomId(resolvedParams.id);
      } catch {
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

  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

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
    if (isConnected && !hasShownWelcome && userName && webinar) {
      if (webinar.welcomeMessage && webinar.welcomeMessage.trim()) {
        const welcomeMsg: SystemMessage = {
          id: `welcome-${Date.now()}`,
          type: 'welcome',
          message: webinar.welcomeMessage,
          timestamp: new Date().toISOString(),
        };

        setSystemMessages(prev => [...prev, welcomeMsg]);
        setHasShownWelcome(true);

        setTimeout(() => scrollToBottom(), 100);
      } else {
        setHasShownWelcome(true);
      }
    }
  }, [isConnected, hasShownWelcome, userName, webinar]);

  useEffect(() => {
    if (userPhone && userName) {
      setLoadingHistory(true);
      loadMessages()
        .catch(() => {
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
            break;
        }
      });
    }
  }, [events]);

  useEffect(() => {
    const fetchWebinarAndValidate = async () => {
      if (!roomId) {
        console.log('Room ID not ready yet, skipping fetch');
        return;
      }

      try {

        const webinarData = await apiFetch<WebinarData>(`/rooms/${roomId}`);

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

    if (roomId) {
      fetchWebinarAndValidate();
    }
  }, [roomId, router, toast]);

  useEffect(() => {
    if (!webinar?.roomStarted || !webinar?.startedAt) return;

    const startTime = new Date(webinar.startedAt).getTime();
    const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
    setVideoStartTime(initialElapsed);

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

      if (videoPlayerRef.current && videoPlayerRef.current.getCurrentTime) {
        const currentTime = videoPlayerRef.current.getCurrentTime();
        const timeDiff = Math.abs(currentTime - elapsed);

        if (timeDiff > 3) {
          videoPlayerRef.current.setCurrentTime(elapsed);
        }
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [webinar]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchWebinarStats = async () => {
    if (!roomId) return;
    
    try {
      const stats = await roomsApi.getWebinarStats(roomId);
      setOnlineParticipants(stats.onlineParticipants);
      setViewerCount(stats.onlineParticipants);
    } catch {
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, events, systemMessages]);

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
    if (!roomId) return;
    
    fetchWebinarStats();
    const interval = setInterval(fetchWebinarStats, 10000);

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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/rooms")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>

              <div>
                <h1 className="text-xl font-bold text-foreground">{webinar.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Ведущий: {webinar.speaker}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {webinar.roomStarted && (
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{duration}</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
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

      <div className="container mx-auto px-4 py-6">
        {!webinar.roomStarted ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
            {webinarSettings.showChat && (
              <Card className="lg:col-span-1 lg:order-1 flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Чат
                    </h2>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <div className="text-green-500">
                          <Wifi className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="text-red-500">
                          <WifiOff className="h-4 w-4" />
                        </div>
                      )}
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {onlineParticipants} онлайн
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingHistory ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin opacity-50" />
                      <p>Загрузка истории сообщений...</p>
                    </div>
                  ) : (
                    <>
                      {systemMessages.map((sysMsg) => (
                        <div 
                          key={sysMsg.id} 
                          className="bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 rounded-lg p-3 space-y-2 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2 text-primary dark:text-primary">
                            <Info className="h-4 w-4" />
                            <span className="text-xs font-semibold">Системное сообщение</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                            {sysMsg.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sysMsg.timestamp).toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}

                      {messages.length === 0 && systemMessages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Пока нет сообщений</p>
                          <p className="text-sm">Будьте первым, кто напишет!</p>
                        </div>
                      )}

                      {messages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-primary text-sm">
                              {msg.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-foreground text-sm bg-muted/50 rounded-lg px-3 py-2">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Написать сообщение..."
                      disabled={!isConnected}
                      className="disabled:opacity-50"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !isConnected}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card
              className={`flex flex-col lg:order-2 ${webinarSettings.showChat ? "lg:col-span-2" : "lg:col-span-3"}`}
            >
              <CardContent className="p-0 flex-1 relative">
                <div className="w-full h-full rounded-lg overflow-hidden relative">
                 
                  {webinar.bannerUrl ? (
                    <img 
                      src={webinar.bannerUrl} 
                      alt="Баннер вебинара" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
                  )}
                  
                 
                  <div className="absolute inset-0 bg-black/30" />
                  
                 
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center space-y-6 max-w-2xl">
                      <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center animate-pulse backdrop-blur-sm">
                        <Clock className="h-10 w-10 text-primary" />
                      </div>
                      
                      <div className="space-y-3">
                        <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                          Вебинар скоро начнется
                        </h2>
                        <p className="text-xl text-gray-200 drop-shadow-md">
                          Ожидайте запуска трансляции
                        </p>
                      </div>

                      {webinar.scheduledDate && (
                        <div className="pt-4">
                          <p className="text-sm text-gray-300 drop-shadow-md">
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
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-2 pt-4">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {webinar.description && (
                <div className="p-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    О вебинаре
                  </h3>
                  <p className="text-sm text-muted-foreground">{webinar.description}</p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
            {webinarSettings.showChat && (
              <Card className="lg:col-span-1 lg:order-1 flex flex-col">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Чат
                    </h2>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <div className="text-green-500">
                          <Wifi className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="text-red-500">
                          <WifiOff className="h-4 w-4" />
                        </div>
                      )}
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {onlineParticipants} онлайн
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingHistory ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin opacity-50" />
                      <p>Загрузка истории сообщений...</p>
                    </div>
                  ) : (
                    <>
                      {systemMessages.map((sysMsg) => (
                        <div 
                          key={sysMsg.id} 
                          className="bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 rounded-lg p-3 space-y-2 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-2 text-primary dark:text-primary">
                            <Info className="h-4 w-4" />
                            <span className="text-xs font-semibold">Системное сообщение</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                            {sysMsg.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sysMsg.timestamp).toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}

                      {messages.length === 0 && systemMessages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Пока нет сообщений</p>
                          <p className="text-sm">Будьте первым, кто напишет!</p>
                        </div>
                      )}

                      {messages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-primary text-sm">
                              {msg.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-foreground text-sm bg-muted/50 rounded-lg px-3 py-2">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Написать сообщение..."
                      disabled={!isConnected}
                      className="disabled:opacity-50"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !isConnected}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card
              className={`flex flex-col lg:order-2 ${webinarSettings.showChat ? "lg:col-span-2" : "lg:col-span-3"}`}
            >
              <CardContent className="p-0 flex-1 relative">
                
                <div className="w-full h-full rounded-lg overflow-hidden">
                  <VidstackPlayer
                    ref={videoPlayerRef}
                    src={webinar.videoUrl}
                    muted={!webinarSettings.isVolumeOn}
                    onPlayStateChange={handleVideoStateChange}
                    autoPlay={webinar.roomStarted}
                    startTime={videoStartTime}
                  />
                </div>
              </CardContent>
              {webinar.description && (
                <div className="p-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    О вебинаре
                  </h3>
                  <p className="text-sm text-muted-foreground">{webinar.description}</p>
                </div>
              )}
            </Card>
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