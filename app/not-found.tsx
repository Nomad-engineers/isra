'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Search, AlertCircle } from 'lucide-react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-isra-purple-main/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-isra-cyan/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-isra-pink/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        <Card className="card-glass border-isra/20 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center space-y-8">
            {/* 404 Number */}
            <div className="relative">
              <div
                className="text-7xl md:text-9xl font-bold text-gradient-accent animate-fade-in-up"
                style={{
                  animation: 'fadeInUp 0.8s ease-out',
                }}
              >
                404
              </div>
              <div
                className="absolute inset-0 text-7xl md:text-9xl font-bold text-isra-purple-main/20 blur-xl"
                style={{
                  animation: 'fadeInUp 0.8s ease-out',
                }}
              >
                404
              </div>
            </div>

            {/* Icon and status */}
            <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="w-16 h-16 bg-isra-purple-main/20 rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-8 h-8 text-isra-purple-main" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-isra-purple-main/20 rounded-full animate-ping" />
              </div>
            </div>

            {/* Error message */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Страница не найдена
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Похоже, вы зашли не туда 😕
              </p>
              <p className="text-sm md:text-base text-muted-foreground/80 max-w-md mx-auto">
                Страница, которую вы ищете, возможно, была удалена, переименована или временно недоступна.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="gradient-primary shadow-lg shadow-isra-primary/25">
                <Link href="/rooms" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Вернуться на главную
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="border-isra/30 text-white hover:bg-isra-medium/50 hover:border-isra-primary hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Search className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </div>

            {/* Additional help text */}
            <div className="text-xs text-muted-foreground/60 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              Если вы считаете, что это ошибка, пожалуйста, свяжитесь с нашей службой поддержки.
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground/60 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/rooms" className="hover:text-isra-cyan transition-colors duration-200">
            Главная
          </Link>
          <span>•</span>
          <Link href="/support" className="hover:text-isra-cyan transition-colors duration-200">
            Поддержка
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-isra-cyan transition-colors duration-200">
            Помощь
          </Link>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}