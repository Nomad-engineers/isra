"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function RoomAuthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { id: roomId } = use(params);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    // Валидация телефона (простая)
    if (phone.length < 10) {
      toast({
        title: "Ошибка",
        description: "Введите корректный номер телефона",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Сохраняем в localStorage
      localStorage.setItem("user_name", name.trim());
      localStorage.setItem("user_phone", phone.trim());

      toast({
        title: "Успешно!",
        description: "Добро пожаловать в чат вебинара",
      });

      // Перенаправляем в комнату
      router.push(`/room/${roomId}`);

    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось войти",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark flex items-center justify-center p-4">
      <Card className="card-glass max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-isra-cyan/20 rounded-full">
              <MessageSquare className="h-8 w-8 text-isra-cyan" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Вход в чат</CardTitle>
          <p className="text-gray-400">Введите ваши данные для участия в вебинаре</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Ваше имя</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Телефон</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                disabled={loading}
                type="tel"
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти в чат"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/rooms")}
              className="text-gray-400 hover:text-white w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к списку
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}