'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Users, BarChart3, UserCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'

const navigation = [
  { name: 'Вебинары', href: '/rooms', icon: Users },
  { name: 'Профиль', href: '/profile', icon: UserCircle },
  { name: 'Тарифы', href: '/tariffs', icon: BarChart3 },
]

interface NavigationProps {
  userName?: string
  userAvatar?: string
}

export function Navigation({ userName = 'Пользователь', userAvatar }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (): Promise<void> => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
        // Get token from localStorage
        const token = localStorage.getItem('payload-token');

      const res = await fetch(
        'https://isracms.vercel.app/api/users/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error('Logout failed')
      }

      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }

      // Clear token from cookies (will be handled by backend)
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

      // Redirect to login
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        variant: 'destructive',
        title: 'Ошибка выхода',
        description: 'Попробуйте снова.',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="bg-isra-medium/90 backdrop-blur-lg border border-isra sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                ISRA
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "text-isra-purple-main bg-transparent"
                        : "text-gray-400 hover:text-white hover:bg-isra-medium/50"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-isra hover:border-isra-primary/50 transition-colors text-white">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userAvatar} alt="Аватар" />
                    <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userName}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </Link>
                </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? 'Выход...' : 'Выйти'}</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}