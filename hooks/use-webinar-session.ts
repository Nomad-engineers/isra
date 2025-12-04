import { useState, useEffect } from "react";

interface WebinarSessionData {
  firstName: string;
  lastName: string;
  userId: number;
  email: string;
  verified: boolean;
  timestamp: number;
}

interface WebinarSessions {
  [key: string]: WebinarSessionData;
}

export function useWebinarSession(webinarId: string) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Проверка доступа при монтировании
  useEffect(() => {
    checkWebinarAccess();
  }, [webinarId]);

  const checkWebinarAccess = () => {
    try {
      const sessionsData = sessionStorage.getItem("webinar_sessions");
      if (!sessionsData) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      const sessions: WebinarSessions = JSON.parse(sessionsData);
      const sessionKey = `webinar_${webinarId}`;
      const session = sessions[sessionKey];

      // Проверяем наличие сессии и её валидность
      if (session && session.verified) {
        // Опционально: проверка времени сессии (например, 24 часа)
        const sessionAge = Date.now() - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 часа

        if (sessionAge < maxAge) {
          setHasAccess(true);
        } else {
          // Сессия истекла
          removeWebinarSession(webinarId);
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error checking webinar access:", error);
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  const saveWebinarSession = (userData: {
    firstName: string;
    lastName: string;
    userId: number;
    email: string;
  }) => {
    try {
      const sessionsData = sessionStorage.getItem("webinar_sessions");
      const sessions: WebinarSessions = sessionsData
        ? JSON.parse(sessionsData)
        : {};

      const sessionKey = `webinar_${webinarId}`;
      sessions[sessionKey] = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        userId: userData.userId,
        email: userData.email,
        verified: true,
        timestamp: Date.now(),
      };

      sessionStorage.setItem("webinar_sessions", JSON.stringify(sessions));

      // Также сохраняем в localStorage для совместимости
      localStorage.setItem(
        "user_name",
        `${userData.firstName} ${userData.lastName}`
      );
      localStorage.setItem("user_email", userData.email);
      localStorage.setItem("user_id", userData.userId.toString());

      setHasAccess(true);
    } catch (error) {
      console.error("Error saving webinar session:", error);
    }
  };

  const removeWebinarSession = (id: string) => {
    try {
      const sessionsData = sessionStorage.getItem("webinar_sessions");
      if (!sessionsData) return;

      const sessions: WebinarSessions = JSON.parse(sessionsData);
      const sessionKey = `webinar_${id}`;
      delete sessions[sessionKey];

      sessionStorage.setItem("webinar_sessions", JSON.stringify(sessions));
      if (id === webinarId) {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error removing webinar session:", error);
    }
  };

  const getSessionData = (): WebinarSessionData | null => {
    try {
      const sessionsData = sessionStorage.getItem("webinar_sessions");
      if (!sessionsData) return null;

      const sessions: WebinarSessions = JSON.parse(sessionsData);
      const sessionKey = `webinar_${webinarId}`;
      return sessions[sessionKey] || null;
    } catch (error) {
      console.error("Error getting session data:", error);
      return null;
    }
  };

  const clearAllSessions = () => {
    try {
      sessionStorage.removeItem("webinar_sessions");
      setHasAccess(false);
    } catch (error) {
      console.error("Error clearing sessions:", error);
    }
  };

  return {
    hasAccess,
    isChecking,
    saveWebinarSession,
    removeWebinarSession,
    getSessionData,
    clearAllSessions,
    recheckAccess: checkWebinarAccess,
  };
}
