import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeSyncScript } from "@/components/providers/theme-sync-script";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISRA.kz - Платформа для управления вебинарами",
  description: "Современная платформа для создания и управления вебинарами с инструментами аналитики и взаимодействия",
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#7B2FF7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeSyncScript />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          defaultTheme="system"
          storageKey="isra-theme"
          attribute="class"
          enableSystem={true}
        >
          
            {children}
         
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
