"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserCircle, Phone, Lock } from "lucide-react";

interface WebinarAccessModalProps {
  roomId: string;
  open: boolean;
  onAuthenticated: (name: string, phone: string) => void;
}

export function WebinarAccessModal({
  roomId,
  open,
  onAuthenticated,
}: WebinarAccessModalProps) {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyGuestAuth = async (
    guestName: string,
    guestPhone: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://isracms.vercel.app/api/rooms/${roomId}/verify-guest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: guestName,
            phone: guestPhone,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Verification failed");
      }

      const data = await response.json();
      return data.verified === true;
    } catch (error) {
      console.error("Error verifying guest:", error);
      throw error;
    }
  };

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

    setLoading(true);

    try {
      // Проверяем гостя через API
      const isVerified = await verifyGuestAuth(name.trim(), phone.trim());

      if (!isVerified) {
        toast({
          title: "Ошибка аутентификации",
          description:
            "Не удалось подтвердить ваши данные. Проверьте имя и номер телефона.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Сохраняем данные в localStorage
      localStorage.setItem("user_name", name.trim());
      localStorage.setItem("user_phone", phone.trim());

      toast({
        title: "Успешно!",
        description: "Вход выполнен успешно",
        variant: "default",
      });

      // Вызываем callback с данными пользователя
      onAuthenticated(name.trim(), phone.trim());
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Ошибка",
        description:
          error instanceof Error
            ? error.message
            : "Произошла ошибка при входе. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Убираем все нечисловые символы
    const numbers = value.replace(/\D/g, "");

    // Ограничиваем до 11 цифр
    const limited = numbers.slice(0, 11);

    // Форматируем номер
    if (limited.length === 0) return "";
    if (limited.length <= 1) return `+${limited}`;
    if (limited.length <= 4) return `+${limited[0]} (${limited.slice(1)}`;
    if (limited.length <= 7)
      return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4)}`;
    if (limited.length <= 9)
      return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(
        4,
        7
      )}-${limited.slice(7)}`;
    return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(
      4,
      7
    )}-${limited.slice(7, 9)}-${limited.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px] bg-isra-dark border-white/10"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-isra-primary/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-isra-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Вход в вебинар
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Для доступа к вебинару введите ваши данные, указанные при
            регистрации
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Имя и Фамилия
            </Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Введите ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Номер телефона
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={handlePhoneChange}
                disabled={loading}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <p className="text-xs text-gray-400">
              Введите номер телефона, указанный при регистрации
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading || !name.trim() || !phone.trim()}
              className="w-full gradient-primary"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Проверка данных...
                </>
              ) : (
                <>Войти в вебинар</>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Если у вас возникли проблемы со входом, обратитесь к организатору
              вебинара
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
