"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Video } from "lucide-react";

interface WebinarAccessFormProps {
  webinarName?: string;
  onSubmit: (data: { firstName: string; phone: string }) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function WebinarAccessForm({
  webinarName,
  onSubmit,
  isLoading,
  error,
}: WebinarAccessFormProps) {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Валидация
    if (!firstName.trim()) {
      setValidationError("Пожалуйста, введите ваше имя");
      return;
    }

    if (!phone.trim()) {
      setValidationError("Пожалуйста, введите ваш номер телефона");
      return;
    }

    if (firstName.trim().length < 2) {
      setValidationError("Имя должно содержать минимум 2 символа");
      return;
    }

    // Проверка формата телефона (базовая)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone.trim())) {
      setValidationError("Неверный формат номера телефона");
      return;
    }

    if (phone.trim().replace(/\D/g, "").length < 10) {
      setValidationError("Номер телефона должен содержать минимум 10 цифр");
      return;
    }

    await onSubmit({
      firstName: firstName.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark flex items-center justify-center p-4">
      <Card className="card-glass w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-isra-primary/20 rounded-full flex items-center justify-center">
            <Video className="h-8 w-8 text-isra-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Вход в вебинар
          </CardTitle>
          {webinarName && (
            <p className="text-gray-300 text-sm">{webinarName}</p>
          )}
          <p className="text-gray-400 text-sm">
            Пожалуйста, представьтесь для входа в вебинар
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">
                Имя <span className="text-red-400">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Введите ваше имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-isra-primary focus:ring-isra-primary"
                autoComplete="given-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">
                Номер телефона <span className="text-red-400">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (XXX) XXX-XX-XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-isra-primary focus:ring-isra-primary"
                autoComplete="tel"
              />
            </div>

            {(validationError || error) && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">
                  {validationError || error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                "Войти в вебинар"
              )}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Входя в вебинар, вы соглашаетесь с условиями использования
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
