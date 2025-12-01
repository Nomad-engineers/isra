"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, MessageSquareOff, Square, Volume2, VolumeX } from "lucide-react";

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
  isVolumeOn?: boolean
  bannerUrl?: string
  showBanner?: boolean
  btnUrl?: string
  showBtn?: boolean
  startedAt?: string
  createdAt: string
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
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerButton, setBannerButton] = useState("");
  const [showBtn, setShowBtn] = useState(false);

  
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

      const apiUrl = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://isracms.vercel.app';

      // Update in database
      const response = await fetch(`${apiUrl}/api/rooms/${webinar.id}`, {
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

  // Handle audio volume toggle
  const handleToggleAudio = async () => {
    const newVolumeState = !isVolumeOn;
    setIsVolumeOn(newVolumeState);

    // Update database only (no chat API events for now)
    await updateSettings({
      isVolumeOn: newVolumeState,
    });
  };

  // Handle banner settings
  const handleUpdateBanner = async () => {
    // Update database only (no chat API events for now)
    await updateSettings({
      bannerUrl: bannerUrl.trim() || null,
      showBanner: showBanner,
      btnUrl: bannerButton.trim() || null,
      showBtn: showBtn,
    });
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
                onClick={handleToggleAudio}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 min-h-[3rem]"
              >
                {isVolumeOn ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                {isVolumeOn ? "Выключить звук" : "Включить звук"}
              </Button>

              </div>
          </div>

          {/* Banner Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Настройки баннера</h3>
            <div className="space-y-4 p-4 border rounded-lg">
              {/* Banner URL */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="bannerUrl">URL баннера</Label>
                  <Input
                    id="bannerUrl"
                    placeholder="https://example.com"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="showBanner">Показать</Label>
                  <Switch
                    id="showBanner"
                    checked={showBanner}
                    onCheckedChange={setShowBanner}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Button */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="bannerButton">URL кнопки</Label>
                  <Input
                    id="bannerButton"
                    placeholder="https://example.com"
                    value={bannerButton}
                    onChange={(e) => setBannerButton(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="showBtn">Показать</Label>
                  <Switch
                    id="showBtn"
                    checked={showBtn}
                    onCheckedChange={setShowBtn}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateBanner}
                disabled={isSubmitting}
                className="w-full"
              >
                Применить баннер
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}