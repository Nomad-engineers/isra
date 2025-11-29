"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Send,
  Users,
  Clock,
  Loader2,
  MessageSquare,
  Eye,
  Settings,
  Maximize2,
} from "lucide-react";

// Этот компонент должен быть в: app/room/[id]/page.tsx

interface Message {
  id: string;
  userName: string;
  text: string;
  timestamp: Date;
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
  showChat: boolean;
  createdAt: string;
}

export default function WebinarRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // Unwrap params Promise
  const { id: webinarId } = use(params);

  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [userName, setUserName] = useState("Гость");
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState("00:00:00");

  // Fetch webinar data
  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        const token = localStorage.getItem("payload-token");

        if (!token) {
          toast({
            title: "Требуется авторизация",
            description: "Авторизуйтесь, чтобы продолжить",
            variant: "destructive",
          });
          router.push("/auth/login");
          return;
        }

        const response = await fetch(
          `https://isracms.vercel.app/api/rooms/${webinarId}`,
          {
            headers: {
              Authorization: `JWT ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch webinar");
        }

        const data = await response.json();
        setWebinar(data);

        // Get user data for name
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
          setUserName(
            userData.user.firstName ||
              userData.user.name ||
              userData.user.email.split("@")[0]
          );
        }
      } catch (error) {
        console.error("Error fetching webinar:", error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные вебинара",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [webinarId, router, toast]);

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

  const handleSendMessage = () => {
    if (!messageText.trim() || !webinar?.showChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userName,
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
          {/* Chat Section - LEFT SIDE */}
          {webinar.showChat && (
            <Card className="card-glass lg:col-span-1 lg:order-1 flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-isra-cyan" />
                    Чат
                  </h2>
                  <Badge variant="outline" className="text-white">
                    <Users className="h-3 w-3 mr-1" />
                    {viewerCount}
                  </Badge>
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
                  messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-isra-cyan text-sm">
                          {msg.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-white text-sm bg-white/5 rounded-lg px-3 py-2">
                        {msg.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Написать сообщение..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="gradient-primary"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Video Section - RIGHT SIDE */}
          <Card
            className={`card-glass flex flex-col lg:order-2 ${webinar.showChat ? "lg:col-span-2" : "lg:col-span-3"}`}
          >
            <CardContent className="p-0 flex-1 relative">
              <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
                {webinar.videoUrl ? (
                  <iframe
                    src={webinar.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/gIVbICtADU4?autoplay=1"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Webinar Video"
                  />
                )}

                {/* Fullscreen Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white z-10"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
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
      </div>
    </div>
  );
}
