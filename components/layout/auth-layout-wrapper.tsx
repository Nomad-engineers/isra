"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  avatar?: string | { url: string }; // Добавлена поддержка объекта
  createdAt: string;
  updatedAt: string;
}

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
}

export function AuthLayoutWrapper({ children }: AuthLayoutWrapperProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("payload-token");

        if (!token) {
          // For layout, we don't redirect immediately, just set loading to false
          setIsLoading(false);
          return;
        }

        // Fetch user data using direct API call (same pattern as login and profile)


        const result = await apiFetch<{
          user?: UserData
          message?: string
        }>('/users/me', {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }).catch(() => {
          // Return null on error to allow graceful handling
          return null
        })


        if (!result) {
          throw new Error('Failed to fetch user data')
        }

        if (result && result.user) {
          setUserData(result.user as UserData);
        } else if (result && result.message === "Account") {
          // Handle mock token case - show mock data
          setUserData({
            id: "mock-id",
            email: "test@example.com",
            firstName: "Тестовый",
            lastName: "Пользователь",
            name: "Тестовый Пользователь",
            phone: "+7 (999) 123-45-67",
            avatar: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          throw new Error("No user data received");
        }
      } catch (error) {
        console.error("User data fetch error in layout:", error);

        // Check if it's an authentication error
        if (
          error instanceof Error &&
          (error.message.includes("401") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("token"))
        ) {
          toast.error("Срок действия токена истек");
          // Don't redirect here - let the middleware handle it
        } else {
          // For layout errors, we just log and continue without showing user data
          console.error("Layout user data fetch failed:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!userData) return "Пользователь";

    // Try firstName first, then name, then fall back to email
    if (userData.firstName) {
      return userData.firstName;
    }

    if (userData.name) {
      // If name is "First Last", use first name only
      const nameParts = userData.name.split(" ");
      return nameParts[0] || userData.name;
    }

    // Extract name from email if no name fields available
    const emailName = userData.email.split("@")[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  // Get full name for display in navigation
  const getFullUserName = () => {
    if (!userData) return "Пользователь";

    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }

    if (userData.name) {
      return userData.name;
    }

    if (userData.firstName) {
      return userData.firstName;
    }

    // Fall back to email
    return userData.email;
  };

  // Извлекаем URL аватара (добавлена новая функция)
  const getAvatarUrl = () => {
    if (!userData?.avatar) return undefined;

    // Если аватар - строка, возвращаем как есть
    if (typeof userData.avatar === "string") {
      return userData.avatar;
    }

    // Если аватар - объект с url, извлекаем url
    if (typeof userData.avatar === "object" && userData.avatar.url) {
      return userData.avatar.url;
    }

    return undefined;
  };

  // While loading, show layout with default user name
  if (isLoading) {
    return <AppLayout userName="Загрузка...">{children}</AppLayout>;
  }

  return (
    <AppLayout userName={getFullUserName()} userAvatar={getAvatarUrl()}>
      {children}
    </AppLayout>
  );
}
