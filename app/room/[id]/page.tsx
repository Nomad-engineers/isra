"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Centrifuge } from "centrifuge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import {
  ArrowLeft,
  Send,
  Users,
  Clock,
  Loader2,
  MessageSquare,
  Eye,
  Settings,
  Wifi,
  WifiOff,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface WebinarData {
  id: string;
  name: string;
  description: string;
  speaker: string;
  type: string;
  videoUrl: string;
  scheduledDate: string;
  roomStarted: boolean;
  showChat: boolean;
  createdAt: string;
}

interface ChatTokens {
  connectionToken: string;
  subscriptionToken: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  createdAt: string;
  webinarId: string;
  userId?: string;
}

// Функция для получения токенов чата
async function getChatTokens(
  roomId: string,
  userIdentifier: string
): Promise<ChatTokens> {
  const chatApiUrl =
    process.env.NEXT_PUBLIC_CHAT_API_URL || "http://144.76.109.45:8089";

  let emailToSend: string;
  if (userIdentifier.includes("@")) {
    emailToSend = userIdentifier;
  } else {
    emailToSend = `${userIdentifier}@chat.local`;
  }

  const response = await fetch(
    `${chatApiUrl}/webinars/${roomId}/token?email=${encodeURIComponent(emailToSend)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get chat tokens: ${response.status}`);
  }

  return response.json();
}

// Функция для отправки сообщения через API
async function sendMessageToChat(
  roomId: string,
  userIdentifier: string,
  userName: string,
  message: string
): Promise<ChatMessage> {
  const chatApiUrl =
    process.env.NEXT_PUBLIC_CHAT_API_URL || "http://144.76.109.45:8089";
  const token = localStorage.getItem("payload-token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `JWT ${token}`;
  }

  let emailToSend: string;
  if (userIdentifier.includes("@")) {
    emailToSend = userIdentifier;
  } else {
    emailToSend = `${userIdentifier}@chat.local`;
  }

  const response = await fetch(`${chatApiUrl}/chat/${roomId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: emailToSend,
      username: userName,
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.status}`);
  }

  return response.json();
}

export default function WebinarRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const { id: roomId } = use(params);

  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [userName, setUserName] = useState("Гость");
  const [userPhone, setUserPhone] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState("00:00:00");
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");

  // WebSocket refs
  const centrifugeRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);
  const connectionAttemptRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection effect
  useEffect(() => {
    const connectToChat = async () => {
      if (!roomId || !userPhone || connectionAttemptRef.current) {
        console.log("Cannot connect to chat:", {
          roomId: !!roomId,
          userPhone: !!userPhone,
          connectionAttempt: connectionAttemptRef.current,
        });
        return;
      }

      if (
        connectionStatus === "connecting" ||
        connectionStatus === "connected"
      ) {
        console.log("Already connected or connecting");
        return;
      }

      try {
        console.log("Starting chat connection...", { roomId, userPhone });
        connectionAttemptRef.current = true;
        setConnectionStatus("connecting");

        const tokens = await getChatTokens(roomId, userPhone);
        console.log("Chat tokens received");

        const centrifugoUrl =
          process.env.NEXT_PUBLIC_CENTRIFUGO_WS_URL ||
          "ws://144.76.109.45:8001/connection/websocket";
        centrifugeRef.current = new Centrifuge(centrifugoUrl, {
          token: tokens.connectionToken,
        });

        centrifugeRef.current.on("connecting", function (ctx: any) {
          console.log("Connecting to Centrifugo...", ctx);
          setConnectionStatus("connecting");
        });

        centrifugeRef.current.on("connected", function (ctx: any) {
          console.log("Connected to Centrifugo", ctx);
          setConnectionStatus("connected");
          setIsConnected(true);
        });

        centrifugeRef.current.on("disconnected", function (ctx: any) {
          console.log("Disconnected from Centrifugo", ctx);
          setConnectionStatus("disconnected");
          setIsConnected(false);
          connectionAttemptRef.current = false;
        });

        centrifugeRef.current.on("error", function (ctx: any) {
          console.error("Centrifuge error:", ctx);
          setConnectionStatus("error");
          setIsConnected(false);
          connectionAttemptRef.current = false;
        });

        const channel = `webinar:${roomId}:chat`;
        subscriptionRef.current = centrifugeRef.current.newSubscription(
          channel,
          {
            token: tokens.subscriptionToken,
          }
        );

        subscriptionRef.current.on("publication", function (ctx: any) {
          console.log("Chat message received:", ctx.data);

          const messageData = ctx.data;
          const newMessage: ChatMessage = {
            id:
              messageData.participantId ||
              `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: messageData.username,
            message: messageData.message,
            createdAt: messageData.createdAt || new Date().toISOString(),
            webinarId: messageData.webinarId || roomId,
            userId: messageData.participantId,
          };

          setMessages((prev) => [...prev, newMessage]);
        });

        subscriptionRef.current.on("subscribed", function (ctx: any) {
          console.log("Subscribed to chat channel", ctx);
        });

        subscriptionRef.current.on("error", function (ctx: any) {
          console.error("Subscription error:", ctx);
          setConnectionStatus("error");
        });

        subscriptionRef.current.subscribe();
        centrifugeRef.current.connect();
      } catch (error) {
        console.error("Failed to connect to chat:", error);
        setConnectionStatus("error");
        setIsConnected(false);
        connectionAttemptRef.current = false;
      }
    };

    connectToChat();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (centrifugeRef.current) {
        centrifugeRef.current.disconnect();
        centrifugeRef.current = null;
      }
      connectionAttemptRef.current = false;
    };
  }, [roomId, userPhone, connectionStatus]);

  // Check auth and load user data
  useEffect(() => {
    const token = localStorage.getItem("payload-token");
    const storedName = localStorage.getItem("user_name");
    const storedPhone = localStorage.getItem("user_phone");

    if (token) {
      const fetchUserData = async () => {
        try {
          const userResponse = await fetch(
            "https://isracms.vercel.app/api/users/me",
            {
              headers: {
                Authorization: `JWT ${token}`,
              },
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            const displayName =
              userData.user.firstName ||
              userData.user.name ||
              userData.user.email.split("@")[0];
            setUserName(displayName);
            setUserPhone(userData.user.email);

            localStorage.setItem("user_name", displayName);
            localStorage.setItem("user_phone", userData.user.email);
          } else {
            localStorage.removeItem("payload-token");
            checkLocalStorageAuth();
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          checkLocalStorageAuth();
        }
      };

      fetchUserData();
    } else {
      checkLocalStorageAuth();
    }

    function checkLocalStorageAuth() {
      if (!storedName || !storedPhone) {
        router.push(`/room/${roomId}/auth`);
        return;
      }

      setUserName(storedName);
      setUserPhone(storedPhone);
    }
  }, [roomId, router]);

  // Fetch webinar data
  useEffect(() => {
    const fetchWebinar = async () => {
      const storedName = localStorage.getItem("user_name");
      const storedPhone = localStorage.getItem("user_phone");

      if (!storedName || !storedPhone) {
        return;
      }

      try {
        const response = await fetch(
          `https://isracms.vercel.app/api/rooms/${roomId}`
        );

        if (!response.ok) {
          console.warn("Failed to fetch webinar, using mock data");
          const mockData: WebinarData = {
            id: roomId,
            name: "Тестовый вебинар",
            description: "Это тестовый вебинар для демонстрации чата",
            speaker: "Спикер",
            type: "webinar",
            videoUrl: "https://www.youtube.com/watch?v=gIVbICtADU4",
            scheduledDate: new Date().toISOString(),
            roomStarted: true,
            showChat: true,
            createdAt: new Date().toISOString(),
          };
          setWebinar(mockData);
        } else {
          const data = await response.json();
          setWebinar(data);
        }
      } catch (error) {
        console.error("Error fetching webinar:", error);
        const mockData: WebinarData = {
          id: roomId,
          name: "Тестовый вебинар",
          description: "Это тестовый вебинар для демонстрации чата",
          speaker: "Спикер",
          type: "webinar",
          videoUrl: "https://www.youtube.com/watch?v=gIVbICtADU4",
          scheduledDate: new Date().toISOString(),
          roomStarted: true,
          showChat: true,
          createdAt: new Date().toISOString(),
        };
        setWebinar(mockData);

        toast({
          title: "Используются тестовые данные",
          description:
            "Не удалось загрузить данные вебинара, используется демо-версия",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [roomId, toast]);

  // Timer for duration
  useEffect(() => {
    if (!webinar?.roomStarted) return;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;

      setDuration(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [webinar]);

  // Simulate viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) =>
        Math.max(1, prev + Math.floor(Math.random() * 3) - 1)
      );
    }, 5000);

    setViewerCount(Math.floor(Math.random() * 50) + 10);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !webinar?.showChat || !isConnected) return;

    try {
      await sendMessageToChat(roomId, userPhone, userName, messageText);
      setMessageText("");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-isra-primary mx-auto" />
          <p className="text-white text-lg">Загрузка вебинара...</p>
        </div>
      </div>
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
      {/* Header */}
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
                <>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    LIVE
                  </Badge>

                  <div className="flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{duration}</span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-white">
                <Eye className="h-4 w-4" />
                <span>{viewerCount}</span>
              </div>

              <Button variant="ghost" size="sm" className="text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}

      <div className="container mx-auto px-4 py-6">
        <div className="relative flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
          {/* Video Section */}
          <div
            className={`flex-1 transition-all duration-300 ${isChatOpen && webinar.showChat ? "mr-0" : "mr-0"}`}
          >
            <Card className="card-glass h-full flex flex-col">
              <CardContent className="p-0 flex-1 relative">
                <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
                  <MediaPlayer
                    src={
                      webinar.videoUrl ||
                      "https://www.youtube.com/watch?v=gIVbICtADU4"
                    }
                    className="w-full h-full"
                  >
                    <MediaProvider />
                    <DefaultVideoLayout icons={defaultLayoutIcons} />
                  </MediaPlayer>
                </div>
              </CardContent>

              {/* Video Info */}
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

          {/* Chat Section */}
          {webinar.showChat && (
            <div
              className={`relative transition-all duration-300 ${isChatOpen ? "w-96" : "w-12"}`}
            >
              {/* Toggle Button */}
              <Button
                onClick={() => setIsChatOpen(!isChatOpen)}
                variant="ghost"
                size="sm"
                className="absolute -left-10 top-1/2 -translate-y-1/2 bg-isra-dark/80 hover:bg-isra-dark text-white rounded-full p-2 z-10 border border-white/10"
              >
                {isChatOpen ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>

              {/* Chat Panel */}
              <Card
                className={`card-glass h-full flex flex-col transition-opacity duration-300 ${isChatOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-isra-cyan" />
                      Чат
                    </h2>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          <Wifi className="h-3 w-3 mr-1" />
                          Онлайн
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                          <WifiOff className="h-3 w-3 mr-1" />
                          Офлайн
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-white">
                        <Users className="h-3 w-3 mr-1" />
                        {viewerCount}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Пока нет сообщений</p>
                      <p className="text-sm">Будьте первым, кто напишет!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-isra-cyan text-sm">
                              {msg.username}
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
                          <p className="text-white text-sm bg-white/5 rounded-lg px-3 py-2">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  {!isConnected && (
                    <div className="mb-2 text-sm text-red-400 text-center">
                      Соединение потеряно. Пытаемся подключиться...
                    </div>
                  )}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
