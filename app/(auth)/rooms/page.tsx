"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebinarCard } from "@/components/webinars/webinar-card";
import { StatsCard } from "@/components/common/stats-card";
import { PageLoader } from "@/components/ui/loaders";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/utils";
import {
  RefreshCw,
  Plus,
  Search,
  Calendar,
  Users,
  FileText,
  Video,
  Filter,
  Upload,
  Loader2,
} from "lucide-react";
import { CreateWebinarModal } from "@/components/webinars/create-webinar-modal";
import { EditWebinarModal } from "@/components/webinars/edit-webinar-modal";
import { Webinar } from "@/types/webinar";
import { toast } from "@/components/ui/use-toast";

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

export default function RoomsPage() {
  const router = useRouter();
  const { toast: shadcnToast } = useToast();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);

  // Convert API webinar to internal format
  const convertApiWebinar = (apiWebinar: ApiWebinar): Webinar => {
    let status: "active" | "scheduled" | "ended" | "draft" = "scheduled";

    if (apiWebinar.roomStarted && !apiWebinar.stoppedAt) {
      status = "active";
    } else if (apiWebinar.stoppedAt) {
      status = "ended";
    } else if (apiWebinar.scheduledDate) {
      status = "scheduled";
    } else {
      status = "draft";
    }

    return {
      id: apiWebinar.id.toString(),
      title: apiWebinar.name,
      description: apiWebinar.description,
      status,
      scheduledAt: apiWebinar.scheduledDate,
      streamUrl: apiWebinar.videoUrl,
      thumbnail: apiWebinar.logo || undefined,
      hostName: apiWebinar.speaker,
      currentParticipants: 0,
      maxParticipants: 100,
      tags: [apiWebinar.type],
      createdAt: apiWebinar.createdAt,
      updatedAt: apiWebinar.updatedAt,
      // Add missing required properties based on your Webinar type
      type: apiWebinar.type as any, // Cast to any to match WebinarType
      hostId: apiWebinar.user.id.toString(), // Added - using the user id from API
      active: apiWebinar.roomStarted, // Added - using roomStarted as active status
    };
  };

  // Fetch webinars from API
  const fetchWebinars = async () => {
    try {
      setLoading(true);
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

      const response = await fetch("https://isracms.vercel.app/api/rooms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch webinars");
      }

      const result = await response.json();

      if (result && result.docs) {
        const convertedWebinars = result.docs.map(convertApiWebinar);
        setWebinars(convertedWebinars);
      }
    } catch (error) {
      console.error("Webinars fetch error:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список вебинаров",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
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
          "https://isracms.vercel.app/api/users/me",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.errors?.[0]?.message || "Failed to fetch user data"
          );
        }

        const result = await response.json();

        if (result && result.user) {
          setUserData(result.user as UserData);
        } else {
          throw new Error("No user data received");
        }
      } catch (error) {
        console.error("User data fetch error:", error);

        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("token"))
        ) {
          toast({
            title: "Срок действия токена истек",
            description: "Авторизуйтесь снова",
            variant: "destructive",
          });
          router.push("/auth/login");
        } else {
          toast({
            title: "Ошибка загрузки данных",
            description: "Не удалось получить данные профиля",
            variant: "destructive",
          });
        }
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Fetch webinars after user data is loaded
  useEffect(() => {
    if (!userLoading && userData) {
      fetchWebinars();
    }
  }, [userLoading, userData]);

  // Calculate stats from real data
  const stats = {
    total: webinars.length,
    active: webinars.filter((w) => w.status === "active").length,
    scheduled: webinars.filter((w) => w.status === "scheduled").length,
    drafts: webinars.filter((w) => w.status === "draft").length,
  };

  const filteredWebinars = webinars.filter(
    (webinar) =>
      webinar.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      webinar.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleRefresh = () => {
    fetchWebinars();
  };

  const handleOpen = (id: string) => {
    console.log("Open webinar:", id);
    router.push(`/room/${id}`);
  };

  const handleEdit = (id: string) => {
    const webinar = webinars.find((w) => w.id === id);
    if (webinar) {
      setEditingWebinar(webinar);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("payload-token");

      const response = await fetch(
        `https://isracms.vercel.app/api/rooms/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete webinar");
      }

      toast({
        title: "Успешно удалено",
        description: "Вебинар был успешно удален",
      });

      // Refresh webinars list
      fetchWebinars();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить вебинар",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async (id: string) => {
    const webinar = webinars.find((w) => w.id === id);
    if (webinar) {
      const linkToCopy =
        webinar.streamUrl || `${window.location.origin}/room/${webinar.id}`;

      try {
        await navigator.clipboard.writeText(linkToCopy);
        toast({
          title: "Ссылка скопирована",
          description: "Ссылка на вебинар успешно скопирована.",
        });
      } catch (error) {
        toast({
          title: "Ошибка копирования",
          description: "Не удалось скопировать ссылку. Попробуйте еще раз.",
          variant: "destructive",
        });
      }
    }
  };

  const handleWebinarCreated = () => {
    // Refresh webinars list when a new one is created
    fetchWebinars();
  };

  const handleWebinarUpdated = () => {
    // Refresh webinars list when one is updated
    fetchWebinars();
    setEditingWebinar(null);
  };

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!userData) return "Пользователь";

    if (userData.firstName) {
      return userData.firstName;
    }

    if (userData.name) {
      const nameParts = userData.name.split(" ");
      return nameParts[0] || userData.name;
    }

    const emailName = userData.email.split("@")[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  // Show loading state while fetching user data
  if (userLoading || loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Добро пожаловать, {getUserDisplayName()}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Управляйте своими вебинарами и настройками
          </p>
          {userData?.email && (
            <p className="text-gray-500 text-sm mt-1">{userData.email}</p>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <Input
              placeholder="Поиск вебинаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 backdrop-blur-md border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-white/20 transition-all"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Обновить
          </Button>
          <CreateWebinarModal
            buttonText="Создать"
            buttonSize="sm"
            buttonClassName="gradient-primary hover:opacity-90 transition-opacity"
            showIcon={true}
            onSuccess={handleWebinarCreated}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Webinars grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {filteredWebinars.map((webinar) => (
              <WebinarCard
                key={webinar.id}
                webinar={webinar}
                onView={() => handleOpen(webinar.id)}
                onEdit={() => handleEdit(webinar.id)}
                onDelete={() => handleDelete(webinar.id)}
                onCopyLink={() => handleCopyLink(webinar.id)}
              />
            ))}
          </div>

          {filteredWebinars.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Вебинары не найдены
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm
                    ? "Попробуйте изменить поисковый запрос"
                    : "У вас пока нет вебинаров. Создайте свой первый вебинар!"}
                </p>
                <CreateWebinarModal
                  buttonText="Создать вебинар"
                  buttonClassName="gradient-primary hover:opacity-90 transition-opacity"
                  showIcon={true}
                  onSuccess={handleWebinarCreated}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with stats */}
        <div className="w-full lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatsCard
                title="Всего вебинаров"
                value={stats.total}
                icon={Video}
              />
              <StatsCard title="Активных" value={stats.active} icon={Video} />
              <StatsCard
                title="Запланированных"
                value={stats.scheduled}
                icon={Calendar}
              />
              <StatsCard
                title="Черновиков"
                value={stats.drafts}
                icon={FileText}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CreateWebinarModal
                buttonText="Новый вебинар"
                buttonSize="sm"
                buttonClassName="w-full gradient-primary hover:opacity-90 transition-opacity"
                showIcon={true}
                onSuccess={handleWebinarCreated}
              />

              <Button variant="outline" className="w-full" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Отчеты
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Webinar Modal */}
      {editingWebinar && (
        <EditWebinarModal
          webinar={editingWebinar}
          open={!!editingWebinar}
          onOpenChange={(open) => {
            if (!open) {
              setEditingWebinar(null);
              // Call handleWebinarUpdated when modal closes
              handleWebinarUpdated();
            }
          }}
        />
      )}
    </div>
  );
}
