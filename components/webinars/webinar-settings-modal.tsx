"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, MessageSquareOff, Square, Volume2 } from "lucide-react";

interface WebinarData {
  id: string
  name: string
  description?: string
  speaker: string
  type: string
  videoUrl: string
  scheduledDate: string
  roomStarted: boolean
  showChat?: boolean
  startedAt?: string
  createdAt: string
  bannerSettings?: {
    show: boolean
    text: string
    button: string
    buttonUrl: string
  }
  user?: {
    id: number
    email: string
    firstName: string
    lastName: string
    phone: string
    role: string
  }
}

interface WebinarSettingsModalProps {
  webinar: WebinarData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdate?: (settings: Partial<WebinarData>) => void;
}

export function WebinarSettingsModal({
  webinar,
  open,
  onOpenChange,
  onSettingsUpdate,
}: WebinarSettingsModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(webinar.showChat ?? true);

  
  // Update settings in database and send event to Centrifugo
  const updateSettings = async (updates: Partial<WebinarData>) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("payload-token");
      if (!token) {
        toast({
          title: "Требуется авторизация",
          description: "Авторизуйтесь для изменения настроек",
          variant: "destructive",
        });
        return;
      }

      // Update in database
      const response = await fetch(`https://isracms.vercel.app/api/rooms/${webinar.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || "Failed to update settings");
      }

      const result = await response.json();
      console.log("Settings updated successfully:", result);

      // All settings will be handled via chat API events, no Centrifugo events needed

      // Call parent callback
      onSettingsUpdate?.({ ...webinar, ...updates });

      toast({
        title: "Настройки сохранены",
        description: "Изменения применены для всех участников",
      });

    } catch (error) {
      console.error("Settings update error:", error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle stop webinar
  const handleStopWebinar = async () => {
    if (!confirm("Вы уверены, что хотите остановить вебинар? Это действие нельзя отменить.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Update in database first
      await updateSettings({
        roomStarted: false,
      });

      // Send stop event via chat API
      try {
        const token = localStorage.getItem("payload-token");
        const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://144.76.109.45:8089';

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `JWT ${token}`;
        }

        await fetch(`${chatApiUrl}/chat/${webinar.id}/events`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            type: "event",
            data: {
              roomStarted: false,
            },
          }),
        });

        console.log("Webinar stop event sent");
      } catch (eventError) {
        console.warn("Failed to send stop event to chat API:", eventError);
      }

      toast({
        title: "Вебинар остановлен",
        description: "Вебинар успешно остановлен",
      });

      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle chat toggle
  const handleToggleChat = async () => {
    const newChatState = !showChat;
    setShowChat(newChatState);

    // Update database
    await updateSettings({
      showChat: newChatState,
    });

    // Send event via chat API
    try {
      const token = localStorage.getItem("payload-token");
      const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://144.76.109.45:8089';

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `JWT ${token}`;
      }

      await fetch(`${chatApiUrl}/chat/${webinar.id}/events`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "event",
          data: {
            showChat: newChatState,
          },
        }),
      });

      console.log(`Chat toggle event sent: showChat=${newChatState}`);
    } catch (eventError) {
      console.warn("Failed to send chat toggle event:", eventError);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl p-6 gap-6 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Настройки вебинара</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Webinar Control */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Управление вебинаром</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              {webinar.roomStarted && (
                <Button
                  onClick={handleStopWebinar}
                  variant="destructive"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 min-h-[3rem]"
                >
                  <Square className="h-4 w-4" />
                  Остановить вебинар
                </Button>
              )}

              {/* Дополнительные кнопки управления */}
              <Button
                variant="outline"
                onClick={handleToggleChat}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 min-h-[3rem]"
              >
                {showChat ? (
                  <MessageSquare className="h-4 w-4" />
                ) : (
                  <MessageSquareOff className="h-4 w-4" />
                )}
                {showChat ? "Выключить чат" : "Включить чат"}
              </Button>

              <Button
                variant="outline"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 min-h-[3rem]"
              >
                <Volume2 className="h-4 w-4" />
                Управление звуком
              </Button>

              <Button
                variant="outline"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 min-h-[3rem]"
              >
                Настройки баннера
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}