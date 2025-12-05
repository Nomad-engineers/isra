"use client";
import { useState } from "react";
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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyGuestAuth = async (
    guestName: string,
    guestPhone: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://isracms.vercel.app/api/rooms/${roomId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch room data");
      }

      const roomData = await response.json();

      if (roomData.guests && Array.isArray(roomData.guests)) {
        const guestFound = roomData.guests.some((guest: any) => {
          const nameMatch =
            guest.name?.toLowerCase() === guestName.toLowerCase();
          const phoneMatch = guest.phone?.replace(/\D/g, "") === guestPhone;
          return nameMatch && phoneMatch;
        });
        return guestFound;
      }

      console.warn("Guest list not found, allowing access");
      return true;
    } catch (error) {
      console.error("Error verifying guest:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!name.trim() || !phone.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, "");

      console.log("Аутентификация гостя:", {
        name: name.trim(),
        phone: cleanPhone,
        formattedPhone: phone,
      });

      const isVerified = await verifyGuestAuth(name.trim(), cleanPhone);

      if (!isVerified) {
        setError(
          "Не удалось подтвердить ваши данные. Проверьте имя и номер телефона."
        );
        setLoading(false);
        return;
      }

      onAuthenticated(name.trim(), cleanPhone);

      try {
        sessionStorage.setItem(
          `webinar_auth_${roomId}`,
          JSON.stringify({
            name: name.trim(),
            phone: cleanPhone,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.error("Failed to save auth data:", e);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Произошла ошибка при проверке данных. Попробуйте снова.");
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);

    if (limited.length === 0) return "";
    if (limited.length <= 1) return `+${limited}`;
    if (limited.length <= 4) return `+${limited[0]} (${limited.slice(1)}`;
    if (limited.length <= 7)
      return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4)}`;
    if (limited.length <= 9)
      return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7)}`;
    return `+${limited[0]} (${limited.slice(1, 4)}) ${limited.slice(4, 7)}-${limited.slice(7, 9)}-${limited.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && name.trim() && phone.trim()) {
      handleSubmit();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gray-800 rounded-full">
            <Lock className="w-8 h-8 text-gray-300" />
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Вход в вебинар
          </h2>
          <p className="text-center text-gray-400 mb-8 text-sm">
            Для доступа к вебинару введите ваши данные, указанные при
            регистрации
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя и Фамилия
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent disabled:opacity-50 transition"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Номер телефона
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Введите номер телефона, указанный при регистрации
              </p>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  placeholder="+7 (999) 999-99-99"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent disabled:opacity-50 transition"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !name.trim() || !phone.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Проверка данных...
                </>
              ) : (
                <>Войти в вебинар</>
              )}
            </button>
          </div>

          <p className="mt-6 text-xs text-center text-gray-500">
            Если у вас возникли проблемы со входом, обратитесь к организатору
            вебинара
          </p>
        </div>
      </div>
    </div>
  );
}
