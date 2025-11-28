"use client";

import { ReactNode } from "react";
import { Navigation } from "./navigation";

interface AppLayoutProps {
  children: ReactNode;
  userName?: string;
  userAvatar?: string;
}

export function AppLayout({ children, userName, userAvatar }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-isra-dark dark text-white">
      <Navigation userName={userName} userAvatar={userAvatar} />
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
