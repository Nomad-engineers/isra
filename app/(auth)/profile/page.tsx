"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/common/stats-card";
import { ProfileForm } from "@/components/forms/profile-form";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { profileApi } from "@/api/profile";
import { ProfileFormDataWithAvatar } from "@/lib/validations";
import {
  User,
  Lock,
  CreditCard,
  BarChart3,
  Video,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "" as string | undefined,
    avatar: "" as string | undefined,
  });
  const [isLoading, setIsLoading] = useState(true);

  const changePasswordOperation = useAsyncOperation(profileApi.changePassword);

  // State for managing current user data and authentication
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('payload-token');

        if (!token) {
          toast.error("Требуется авторизация");
          router.push('/auth/login');
          return;
        }

        // Fetch user data using direct API call (same pattern as login)
        const response = await fetch('https://isracms.vercel.app/api/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || 'Failed to fetch user data');
        }

        const result = await response.json();

        if (result && result.user) {
          const userData = result.user as UserData;
          setCurrentUserId(userData.id); // Store user ID for updates

          // Extract first and last name from name field if available, or use dedicated fields
          let firstName = userData.firstName || '';
          let lastName = userData.lastName || '';

          if (userData.name && !firstName && !lastName) {
            // If name is provided as "First Last", split it
            const nameParts = userData.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          setProfile({
            firstName: firstName || 'Имя',
            lastName: lastName || 'Фамилия',
            email: userData.email || '',
            phone: userData.phone || '',
            avatar: userData.avatar,
          });
        } else if (result && result.message === "Account") {
          // Handle mock token case - show mock data
          setProfile({
            firstName: 'Тестовый',
            lastName: 'Пользователь',
            email: 'test@example.com',
            phone: '+79991234567',
            avatar: undefined,
          });
        } else {
          throw new Error('No user data received');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);

        // Check if it's an authentication error
        if (error instanceof Error &&
            (error.message.includes('401') || error.message.includes('Unauthorized') ||
             error.message.includes('token'))) {
          toast.error("Срок действия токена истек");
          router.push('/auth/login');
        } else {
          toast.error("Ошибка загрузки профиля");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleProfileUpdate = async (data: ProfileFormDataWithAvatar) => {
    setIsUpdating(true);

    try {
      const token = localStorage.getItem('payload-token');

      if (!token) {
        toast.error("Требуется авторизация");
        router.push('/auth/login');
        return;
      }

      if (!currentUserId) {
        toast.error("ID пользователя не найден");
        return;
      }

      // Prepare update data
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ? data.phone.replace(/\D/g, '') : data.phone,
      };

      // Handle avatar upload if present
      if (data.avatar) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("avatar", data.avatar);
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);
        formData.append("email", data.email);
        if (data.phone) {
          formData.append("phone", data.phone.replace(/\D/g, ''));
        }

        // Upload avatar first
        const avatarResponse = await fetch('https://isracms.vercel.app/api/upload/avatar', {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `JWT ${token}`,
          },
          body: formData,
        });

        if (avatarResponse.ok) {
          const avatarResult = await avatarResponse.json();
          (updateData as { avatar?: string }).avatar = avatarResult.url;
        } else {
          // If avatar upload fails, continue without it
          console.warn("Avatar upload failed, continuing without avatar");
        }
      }

      // Make PATCH request to update user
      const response = await fetch(`https://isracms.vercel.app/api/users/${currentUserId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update profile');
      }

      // Update local state with new user data
      setProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        avatar: (updateData as { avatar?: string }).avatar || profile.avatar,
      });

      toast.success("Данные успешно обновлены");

    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Ошибка обновления данных");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    await changePasswordOperation.execute(data);
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Основной контент с табами */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Профиль
          </h1>
          <p className="text-gray-400">
            Управление вашей учетной записью и настройками
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="tariff" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Тариф
            </TabsTrigger>
          </TabsList>

          {/* Таб: Профиль */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Профиль пользователя
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  initialData={profile}
                  onSubmit={handleProfileUpdate}
                  loading={isUpdating}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Таб: Статистика */}
          <TabsContent value="statistics" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5" />
                Статистика
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Всего вебинаров"
                  value="24"
                  description="За все время"
                  icon={Video}
                />
                <StatsCard
                  title="Активных"
                  value="3"
                  description="Сейчас идут"
                  icon={Video}
                />
                <StatsCard
                  title="Запланированных"
                  value="5"
                  description="На этой неделе"
                  icon={Video}
                />
                <StatsCard
                  title="Участников"
                  value="1,234"
                  description="Всего участников"
                  icon={User}
                />
              </div>
            </div>
          </TabsContent>

          {/* Таб: Тариф */}
          <TabsContent value="tariff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Текущий тариф
                  </div>
                  <Badge variant="default">PRO</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Статус</span>
                    <span className="font-medium text-white">Активен</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Следующее списание</span>
                    <span className="font-medium text-white">
                      15 декабря 2024
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Участников на вебинаре
                    </span>
                    <span className="font-medium text-white">До 100</span>
                  </div>
                  <div className="pt-4">
                    <Link href="/tariffs">
                      <Button variant="outline" className="w-full">
                        Управление тарифом
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Правый сайдбар с быстрыми действиями и настройками */}
      <div className="lg:w-80">
        <div className="space-y-6">
          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/rooms">
                  <Button className="w-full flex items-center gap-3 h-auto p-4 justify-start">
                    <Video className="h-5 w-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">Мои комнаты</div>
                      <div className="text-sm text-muted-foreground">
                        Управление вебинарами
                      </div>
                    </div>
                  </Button>
                </Link>

                <div className="h-2"></div>

                <Button
                  variant="outline"
                  className="w-full flex items-center gap-3 h-auto p-4 justify-start"
                >
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Отчеты</div>
                    <div className="text-sm text-muted-foreground">
                      Аналитика и статистика
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Управление аккаунтом */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Управление аккаунтом</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Изменить пароль
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Изменение пароля</DialogTitle>
                  </DialogHeader>
                  <ChangePasswordForm
                    onSubmit={handlePasswordChange}
                    loading={changePasswordOperation.loading}
                  />
                </DialogContent>
              </Dialog>

              <Link href="/tariffs">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Управление тарифом
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
