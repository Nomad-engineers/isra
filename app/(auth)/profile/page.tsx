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
import { apiFetch } from "@/lib/api-fetch";

interface PlanData {
  id: string;
  name: string;
  price?: string;
  participants?: number;
  rooms?: number;
  storage?: string;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  plan?: PlanData | string;
  planStatus?:
    | "active"
    | "trialing"
    | "paused"
    | "canceled"
    | "past_due"
    | "overdue"
    | "expired"
    | "inactive"
    | "active_until_period_end";
  planBillingCycle?: "month" | "year";
  planEndDate?: string;
  planCanceledAt?: string;
  isPhoneVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersMeResponse {
  user: UserData;
}

interface RoomsResponse {
  docs: ApiWebinar[];
}

interface AvatarUploadResponse {
  doc: {
    id: string;
  };
}

interface ApiWebinar {
  id: number;
  name: string;
  description: string;
  speaker: string;
  type: string;
  videoUrl: string;
  scheduledDate: string;
  roomStarted: boolean;
  startedAt: string | null;
  stoppedAt: string | null;
  showChat: boolean;
  showBanner: boolean;
  showBtn: boolean;
  isVolumeOn: boolean;
  bannerUrl: string | null;
  btnUrl: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface WebinarStats {
  total: number;
  active: number;
  scheduled: number;
  totalParticipants: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "" as string | undefined,
    avatar: "" as string | undefined,
    role: "" as string | undefined,
    plan: null as PlanData | null,
    planStatus: "" as string | undefined,
    planBillingCycle: "" as string | undefined,
    planEndDate: "" as string | undefined,
    planCanceledAt: "" as string | undefined,
    isPhoneVerified: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const changePasswordOperation = useAsyncOperation(profileApi.changePassword);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [webinars, setWebinars] = useState<ApiWebinar[]>([]);
  const [webinarStats, setWebinarStats] = useState<WebinarStats>({
    total: 0,
    active: 0,
    scheduled: 0,
    totalParticipants: 0,
  });
  const [isLoadingWebinars, setIsLoadingWebinars] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("payload-token");

        if (!token) {
          toast.error("Требуется авторизация");
          router.push("/auth/login");
          return;
        }

        const result = await apiFetch<UsersMeResponse>('/users/me', {
          headers: {
            Authorization: `JWT ${token}`,
          },
        });

        if (result && result.user) {
          const userData = result.user;
          setCurrentUserId(userData.id);

          let firstName = userData.firstName || "";
          let lastName = userData.lastName || "";

          if (userData.name && !firstName && !lastName) {
            const nameParts = userData.name.split(" ");
            firstName = nameParts[0] || "";
            lastName = nameParts.slice(1).join(" ") || "";
          }

          let planData = null;
          if (userData.plan && typeof userData.plan === "object") {
            planData = userData.plan as PlanData;
          }

          setProfile({
            firstName: firstName || "",
            lastName: lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            avatar: userData.avatar,
            role: userData.role,
            plan: planData,
            planStatus: userData.planStatus,
            planBillingCycle: userData.planBillingCycle,
            planEndDate: userData.planEndDate,
            planCanceledAt: userData.planCanceledAt,
            isPhoneVerified: userData.isPhoneVerified || false,
          });
        } else if (result && (result as any).message === "Account") {
          setProfile({
            firstName: "Тестовый",
            lastName: "Пользователь",
            email: "test@example.com",
            phone: "+79991234567",
            avatar: undefined,
            role: "client",
            plan: {
              id: "professional",
              name: "PROFESSIONAL",
              price: "24 990 ₸",
              participants: 500,
              rooms: 50,
              storage: "50ГБ",
            },
            planStatus: "active",
            planBillingCycle: "month",
            planEndDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            planCanceledAt: undefined,
            isPhoneVerified: true,
          });
        } else {
          throw new Error("No user data received");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);

        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("token"))
        ) {
          toast.error("Срок действия токена истек");
          router.push("/auth/login");
        } else {
          toast.error("Ошибка загрузки профиля");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const fetchWebinars = async () => {
    try {
      setIsLoadingWebinars(true);
      const token = localStorage.getItem("payload-token");

      if (!token) {
        console.log("No token found, skipping webinar fetch");
        return;
      }

      const result = await apiFetch<RoomsResponse>('/rooms', {
        headers: {
          Authorization: `JWT ${token}`,
        },
      });

      if (result && result.docs) {
        let userWebinars: ApiWebinar[] = [];
        if (profile.role === "admin") {
          userWebinars = result.docs;
        } else {
          const userId = currentUserId;
          userWebinars = result.docs.filter(
            (webinar: ApiWebinar) => webinar.user.id.toString() === userId
          );
        }

        setWebinars(userWebinars);

        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const stats: WebinarStats = {
          total: userWebinars.length,
          active: userWebinars.filter((w) => w.roomStarted && !w.stoppedAt)
            .length,
          scheduled: userWebinars.filter((w) => {
            if (!w.scheduledDate) return false;
            const scheduledTime = new Date(w.scheduledDate);
            return scheduledTime > now && scheduledTime <= weekFromNow;
          }).length,
          totalParticipants: 1234,
        };

        setWebinarStats(stats);
      }
    } catch (error) {
      console.error("Error fetching webinars for statistics:", error);
    } finally {
      setIsLoadingWebinars(false);
    }
  };

  useEffect(() => {
    if (currentUserId && profile.role) {
      fetchWebinars();
    }
  }, [currentUserId, profile.role]);

  const handleProfileUpdate = async (data: ProfileFormDataWithAvatar) => {
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("payload-token");

      if (!token) {
        toast.error("Требуется авторизация");
        router.push("/auth/login");
        return;
      }

      if (!currentUserId) {
        toast.error("ID пользователя не найден");
        return;
      }

      // Handle avatar upload using mentor's approach
      // Handle avatar upload using mentor's approach
      if (data.avatar) {
        try {
          const formData = new FormData();
          formData.append("file", data.avatar);

          console.log("=== AVATAR UPLOAD (MENTOR'S WAY) ===");
          console.log("File:", {
            name: data.avatar.name,
            type: data.avatar.type,
            size: data.avatar.size,
          });

          // Upload avatar using special endpoint (as mentor suggested)
          const avatarResult = await apiFetch<AvatarUploadResponse>('/user-avatar', {
            method: "POST",
            headers: {
              Authorization: `JWT ${token}`,
            },
            body: formData,
          });

          console.log("Avatar upload result:", avatarResult);

          // Extract the uploaded avatar ID
          const uploadedAvatarId = avatarResult.doc?.id;
          console.log("Uploaded avatar ID:", uploadedAvatarId);

          if (!uploadedAvatarId) {
            toast.error("Не удалось получить ID загруженного аватара");
            return;
          }

          // Now link the avatar to the user profile
          await apiFetch(`/users/${currentUserId}`, {
            method: "PATCH",
            body: JSON.stringify({
              avatar: uploadedAvatarId,
            }),
          });

          // Refetch user data to get the updated avatar
          const userResult = await apiFetch<UsersMeResponse>('/users/me', {
            headers: {
              Authorization: `JWT ${token}`,
            },
          });

          console.log("Refetched user data:", userResult);

          // Extract avatar URL from refetched data
          let avatarUrl = profile.avatar;
          if (userResult.user && userResult.user.avatar) {
            const avatarData = userResult.user.avatar as any;
            if (typeof avatarData === "object" && avatarData.url) {
              avatarUrl = avatarData.url;
            } else if (typeof avatarData === "string") {
              avatarUrl = avatarData;
            }
          }

          console.log("New avatar URL extracted:", avatarUrl);

          // Update profile state with new avatar
          setProfile((prev) => {
            const updated = {
              ...prev,
              avatar: avatarUrl,
            };
            console.log("Updating profile state with new avatar:", updated);
            return updated;
          });

          console.log("Avatar updated successfully, new URL:", avatarUrl);
          toast.success("Аватар успешно обновлен");
        } catch (uploadError) {
          console.error("Avatar upload error:", uploadError);
          toast.error("Не удалось загрузить аватар");
          return;
        }
      }

      // Check if other profile fields actually changed
      const hasProfileChanges =
        data.firstName.trim() !== profile.firstName ||
        data.lastName.trim() !== profile.lastName ||
        data.email.trim() !== profile.email ||
        (data.phone?.replace(/\D/g, "") || "") !==
          (profile.phone?.replace(/\D/g, "") || "");

      // Only update profile fields if they actually changed
      if (hasProfileChanges) {
        const updateData: Record<string, any> = {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
        };

        if (data.phone) {
          updateData.phone = data.phone.replace(/\D/g, "");
        }

        console.log("=== PROFILE UPDATE REQUEST ===");
        console.log("Update payload:", updateData);

        // Make PATCH request to update user profile data
        await apiFetch(`/users/${currentUserId}`, {
          method: "PATCH",
          body: JSON.stringify(updateData),
        });

        console.log("Profile update successful");

        // Update local state with new user data
        setProfile((prev) => ({
          ...prev,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
        }));
      } else {
        console.log(
          "No profile field changes detected, skipping profile update"
        );
      }

      toast.success("Профиль успешно обновлен");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка обновления данных"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    await changePasswordOperation.execute(data);
  };

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
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
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

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
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

          <TabsContent value="statistics" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5" />
                Статистика
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Всего вебинаров"
                  value={
                    isLoadingWebinars ? "..." : webinarStats.total.toString()
                  }
                  description="За все время"
                  icon={Video}
                />
                <StatsCard
                  title="Активных"
                  value={
                    isLoadingWebinars ? "..." : webinarStats.active.toString()
                  }
                  description="Сейчас идут"
                  icon={Video}
                />
                <StatsCard
                  title="Запланированных"
                  value={
                    isLoadingWebinars
                      ? "..."
                      : webinarStats.scheduled.toString()
                  }
                  description="На этой неделе"
                  icon={Video}
                />
                <StatsCard
                  title="Участников"
                  value={
                    isLoadingWebinars
                      ? "..."
                      : webinarStats.totalParticipants.toLocaleString()
                  }
                  description="Всего участников"
                  icon={User}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tariff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Текущий тариф
                  </div>
                  <Badge variant="default">
                    {profile.plan?.name || "Бесплатный"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Статус</span>
                    <span className="font-medium text-foreground">
                      {profile.planStatus === "active"
                        ? "Активен"
                        : profile.planStatus === "trialing"
                          ? "На испытательном сроке"
                          : profile.planStatus === "paused"
                            ? "Приостановлен"
                            : profile.planStatus === "canceled"
                              ? "Отменен"
                              : profile.planStatus === "past_due"
                                ? "Просрочен"
                                : profile.planStatus === "expired"
                                  ? "Истекший"
                                  : profile.planStatus === "inactive"
                                    ? "Неактивен"
                                    : profile.planStatus || "Не указан"}
                    </span>
                  </div>
                  {profile.planEndDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Следующее списание</span>
                      <span className="font-medium text-foreground">
                        {new Date(profile.planEndDate).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Участников на вебинаре
                    </span>
                    <span className="font-medium text-foreground">
                      {profile.plan?.participants
                        ? `До ${profile.plan.participants}`
                        : "Не ограничено"}
                    </span>
                  </div>
                  {profile.plan?.rooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Комнат</span>
                      <span className="font-medium text-foreground">
                        До {profile.plan.rooms}
                      </span>
                    </div>
                  )}
                  {profile.plan?.storage && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Хранилище</span>
                      <span className="font-medium text-foreground">
                        {profile.plan.storage}
                      </span>
                    </div>
                  )}
                  {profile.planBillingCycle && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Период billing</span>
                      <span className="font-medium text-foreground">
                        {profile.planBillingCycle === "month"
                          ? "Месячная"
                          : "Годовая"}
                      </span>
                    </div>
                  )}
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

      <div className="lg:w-80">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Быстрые действия</CardTitle>
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

                <Link href="/reports">
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
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Управление аккаунтом</CardTitle>
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
