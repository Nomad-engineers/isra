"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { SendEventRequest } from "@/lib/chat-websocket";
import { useWebinarSession } from "@/hooks/use-webinar-session";
import { WebinarAccessForm } from "@/components/webinars/webinar-access-form";

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
  Volume2,
  VolumeX,
  Shield,
} from "lucide-react";
import { VidstackPlayer } from "@/components/video/vidstack-player";
import { WebinarSettingsModal } from "@/components/webinars/webinar-settings-modal";
import { WebinarBanner } from "@/components/webinars/webinar-banner";

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

  const { id: roomId } = use(params);

  const { hasAccess, isChecking, saveWebinarSession, getSessionData } =
    useWebinarSession(roomId);

  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [userName, setUserName] = useState("Гость");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState("00:00:00");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [webinarStarted, setWebinarStarted] = useState(false);
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

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
    error: chatError,
  } = useChatWebSocket({
    roomId,
    userIdentifier: userEmail,
    userName,
    autoConnect: !!userEmail && !!userName,
  });

  useEffect(() => {
    const sessionData = getSessionData();
    if (sessionData && sessionData.verified) {
      setUserName(`${sessionData.firstName} ${sessionData.lastName}`);
      setUserEmail(sessionData.email);
      // Role will be fetched from user data
    }
  }, [roomId]);

  useEffect(() => {
    if (userEmail && userName) {
      setLoadingHistory(true);
      loadMessages()
        .then(() => {
          console.log("Chat history loaded successfully");
        })
        .catch((error) => {
          console.error("Failed to load chat history:", error);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [userEmail, userName, loadMessages]);

  useEffect(() => {
    if (chatError) {
      console.error("Chat error:", chatError);
    }
  }, [chatError]);

  useEffect(() => {
    if (!webinar?.roomStarted || !webinar?.startedAt) return;

    const startTime = new Date(webinar.startedAt).getTime();
    const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
    setVideoStartTime(initialElapsed);

    if (videoPlayerRef.current && videoPlayerRef.current.setCurrentTime) {
      videoPlayerRef.current.setCurrentTime(initialElapsed);
    }

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
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [webinar?.roomStarted, webinar?.startedAt]);

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
            isVolumeOn: true,
            createdAt: new Date().toISOString(),
          };
          setWebinar(mockData);
          setLoading(false);
          setLoadingHistory(false);
          return;
        }

        const webinarData = await webinarResponse.json();
        setWebinar(webinarData);

        // Инициализируем состояние звука из данных вебинара
        const volumeState = webinarData.isVolumeOn ?? true;
        setWebinarSettings((prev) => ({
          ...prev,
          isVolumeOn: volumeState,
        }));
        setIsMuted(!volumeState);
        setAudioInitialized(true);

        await handleGuestAuth();
      } catch (error) {
        console.error("Error fetching webinar:", error);
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
      const sessionData = getSessionData();

      if (sessionData && sessionData.verified) {
        setUserName(`${sessionData.firstName} ${sessionData.lastName}`);
        setUserEmail(sessionData.email);
        // Fetch user role from API
        fetchUserRole(sessionData.email);
        setLoading(false);
        setLoadingHistory(false);
        return;
      }

      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_id");
      setLoading(false);
      setLoadingHistory(false);
    };

    fetchWebinarAndValidate();
  }, [roomId, router, toast, hasAccess]);

  // Слушаем события изменения звука
  useEffect(() => {
    const volumeEvent = events.find(
      (e) => e.type === "event" && e.data?.isVolumeOn !== undefined
    );

    if (volumeEvent && volumeEvent.data?.isVolumeOn !== undefined) {
      const shouldMute = !volumeEvent.data.isVolumeOn;
      setIsMuted(shouldMute);
      setWebinarSettings((prev) => ({
        ...prev,
        isVolumeOn: volumeEvent.data.isVolumeOn,
      }));
    }
  }, [events]);

  // Fetch user role from API
  const fetchUserRole = async (email: string) => {
    try {
      const response = await fetch(
        `https://isracms.vercel.app/api/users?where[email][equals]=${encodeURIComponent(email)}`
      );

      if (response.ok) {
        const userData = await response.json();
        const users = Array.isArray(userData) ? userData : userData.docs || [];

        if (users.length > 0) {
          setUserRole(users[0].role || "user");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    } catch (error) {
      console.error("Failed to send message:", error);
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
    const interval = setInterval(() => {
      setViewerCount((prev) =>
        Math.max(1, prev + Math.floor(Math.random() * 3) - 1)
      );
    }, 5000);

    setViewerCount(Math.floor(Math.random() * 50) + 10);

    return () => clearInterval(interval);
  }, []);

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
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to handle webinar state change:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить состояние вебинара",
        variant: "destructive",
      });
    }
  };

  const handleAccessFormSubmit = async (data: {
    firstName: string;
    lastName: string;
  }) => {
    setIsAuthenticating(true);
    setAuthError("");

    try {
      console.log("Поиск пользователя:", data);

      const usersResponse = await fetch(
        `https://isracms.vercel.app/api/users?where[firstName][equals]=${encodeURIComponent(data.firstName)}&where[lastName][equals]=${encodeURIComponent(data.lastName)}`
      );

      console.log("Ответ API статус:", usersResponse.status);

      if (!usersResponse.ok) {
        throw new Error("Ошибка при поиске пользователя");
      }

      const usersData = await usersResponse.json();
      console.log("Данные пользователей:", usersData);

      let users = [];
      if (Array.isArray(usersData)) {
        users = usersData;
      } else if (usersData.docs && Array.isArray(usersData.docs)) {
        users = usersData.docs;
      }

      console.log("Найдено пользователей:", users.length);

      if (users.length === 0) {
        throw new Error(
          `Пользователь с именем ${data.firstName} ${data.lastName} не найден. Проверьте правильность написания имени и фамилии.`
        );
      }

      const user = users[0];
      console.log("Выбранный пользователь:", user);

      if (!user.id) {
        throw new Error("У пользователя отсутствует ID");
      }

      if (!user.email) {
        throw new Error("У пользователя отсутствует email");
      }

      saveWebinarSession({
        firstName: user.firstName || data.firstName,
        lastName: user.lastName || data.lastName,
        userId: user.id,
        email: user.email,
      });

      setUserName(
        `${user.firstName || data.firstName} ${user.lastName || data.lastName}`
      );
      setUserEmail(user.email);
      setUserRole(user.role || "user");

      toast({
        title: "Добро пожаловать!",
        description: `${data.firstName} ${data.lastName}, вы успешно вошли в вебинар`,
      });
    } catch (error: any) {
      console.error("Authentication error:", error);
      setAuthError(
        error.message || "Не удалось войти. Проверьте введенные данные."
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Функция для определения роли пользователя из сообщения
  const getMessageUserRole = (message: any): string => {
    // Если есть информация о роли в сообщении
    if (message.userRole) {
      return message.userRole;
    }

    // Если это сообщение от владельца вебинара
    if (webinar?.user?.email === message.userEmail) {
      return "admin";
    }

    return "user";
  };

  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-isra-primary mx-auto" />
          <p className="text-white text-lg">Загрузка вебинара...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <WebinarAccessForm
        webinarName={webinar?.name}
        onSubmit={handleAccessFormSubmit}
        isLoading={isAuthenticating}
        error={authError}
      />
    );
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark flex items-center justify-center">
        <Card className="card-glass max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Вебинар не найден</h2>
            <Button
              onClick={() => router.push("/rooms")}
              className="gradient-primary"
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
    <div className="min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark">
      <div className="bg-isra-dark/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/rooms")}
                className="text-white hover:text-isra-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>

              <div>
                <h1 className="text-xl font-bold text-white">{webinar.name}</h1>
                <p className="text-sm text-gray-400">
                  Ведущий: {webinar.speaker}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {webinar.roomStarted && (
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{duration}</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-white"
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
          <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
            <Card className="card-glass max-w-md w-full">
              <CardContent className="pt-8 pb-6 text-center space-y-6">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Вебинар еще не начался
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Этот вебинар пока не запущен организатором. Пожалуйста,
                    подождите немного или вернитесь позже.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
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
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => router.push("/rooms")}
                    className="gradient-primary w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Вернуться к списку вебинаров
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Обновить страницу
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
            {webinarSettings.showChat && (
              <Card className="card-glass lg:col-span-1 lg:order-1 flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-isra-cyan" />
                      Чат
                    </h2>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <div className="text-white">
                          <Wifi className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="text-red-400">
                          <WifiOff className="h-4 w-4" />
                        </div>
                      )}
                      <Badge variant="outline" className="text-white">
                        <Users className="h-3 w-3 mr-1" />
                        {viewerCount}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingHistory ? (
                    <div className="text-center text-gray-400 py-8">
                      <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin opacity-50" />
                      <p>Загрузка истории сообщений...</p>
                    </div>
                  ) : messages.length === 0 && events.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Пока нет сообщений</p>
                      <p className="text-sm">Будьте первым, кто напишет!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const msgRole = getMessageUserRole(msg);
                        const isModerator =
                          msgRole === "admin" || msgRole === "moderator";

                        return (
                          <div key={msg.id} className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span
                                className={`font-semibold text-sm flex items-center gap-1 ${
                                  isModerator
                                    ? "text-amber-400"
                                    : "text-isra-cyan"
                                }`}
                              >
                                {isModerator && <Shield className="h-3 w-3" />}
                                {msg.username}
                                {isModerator && (
                                  <Badge
                                    variant="outline"
                                    className="ml-1 text-xs px-1 py-0 h-4 border-amber-400 text-amber-400"
                                  >
                                    МОД
                                  </Badge>
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  "ru-RU",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <p
                              className={`text-white text-sm rounded-lg px-3 py-2 ${
                                isModerator
                                  ? "bg-amber-500/10 border border-amber-500/20"
                                  : "bg-white/5"
                              }`}
                            >
                              {msg.message}
                            </p>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Написать сообщение..."
                      disabled={!isConnected}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 disabled:opacity-50"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !isConnected}
                      className="gradient-primary"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card
              className={`card-glass flex flex-col lg:order-2 ${webinarSettings.showChat ? "lg:col-span-2" : "lg:col-span-3"}`}
            >
              <CardContent className="p-0 flex-1 relative">
                <div className="w-full h-full bg-black rounded-lg overflow-hidden">
                  <VidstackPlayer
                    ref={videoPlayerRef}
                    src={
                      webinar.videoUrl ||
                      "https://www.youtube.com/watch?v=6fty5yB7bFo"
                    }
                    autoPlay={webinar.roomStarted}
                    muted={isMuted}
                    controls={false}
                    aspectRatio="16/9"
                    startTime={videoStartTime}
                    onPlayStateChange={handleVideoStateChange}
                  />
                </div>
              </CardContent>

              {webinar.description && (
                <div className="p-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    О вебинаре
                  </h3>
                  <p className="text-sm text-gray-400">{webinar.description}</p>
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
        onSettingsUpdate={(updatedWebinar) => {
          setWebinar((prev) => (prev ? { ...prev, ...updatedWebinar } : null));
          if (updatedWebinar.showChat !== undefined) {
            setWebinarSettings((prev) => ({
              ...prev,
              showChat: updatedWebinar.showChat!,
            }));
          }
          if (updatedWebinar.isVolumeOn !== undefined) {
            setWebinarSettings((prev) => ({
              ...prev,
              isVolumeOn: updatedWebinar.isVolumeOn!,
            }));
            const shouldMute = !updatedWebinar.isVolumeOn;
            setIsMuted(shouldMute);
          }
        }}
      />
    </div>
  );
}
