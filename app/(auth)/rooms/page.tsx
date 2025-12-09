'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WebinarCard } from '@/components/webinars/webinar-card'
import { StatsCard } from '@/components/common/stats-card'
import { PageLoader } from '@/components/ui/loaders'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import { RefreshCw, Search, Calendar, FileText, Video, Loader2 } from 'lucide-react'
import { CreateWebinarModal } from '@/components/webinars/create-webinar-modal'
import { useTokenAuth } from '@/hooks/use-token-auth'
import { EditWebinarModal } from '@/components/webinars/edit-webinar-modal'
import { roomsApi } from '@/api/rooms'
import { Webinar } from '@/types/webinar'

interface UserData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  phone?: string
  avatar?: string
  role: string // "admin" or "client"
  createdAt: string
  updatedAt: string
}

interface ApiWebinar {
  id: number
  name: string
  description: string
  speaker: string
  type: string
  videoUrl: string
  scheduledDate: string
  roomStarted: boolean
  startedAt: string | null
  stoppedAt: string | null
  showChat: boolean
  showBanner: boolean
  showBtn: boolean
  isVolumeOn: boolean
  bannerUrl: string | null
  btnUrl: string | null
  logo: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export default function RoomsPage() {
  const router = useRouter()

  // Оба нужны — не удаляем!
  const { toast } = useToast()
  const { getToken, checkAuth, refreshToken: refreshAuthToken } = useTokenAuth()

  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null)

  // Check if user is admin
  const isAdmin = userData?.role === 'admin'

  // Convert API webinar to internal format
  const convertApiWebinar = (apiWebinar: ApiWebinar): Webinar => {
    let status: 'active' | 'scheduled' | 'ended' | 'draft' | 'cancelled' = 'scheduled'

    if (apiWebinar.roomStarted && !apiWebinar.stoppedAt) {
      status = 'active'
    } else if (apiWebinar.stoppedAt) {
      status = 'ended'
    } else if (apiWebinar.scheduledDate) {
      status = 'scheduled'
    } else {
      status = 'draft'
    }

    // Определяем тип вебинара на основе API данных
    const webinarType: 'live' | 'auto' = apiWebinar.type === 'auto' ? 'auto' : 'live'

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
      type: webinarType,
      hostId: apiWebinar.user.id.toString(),
      active: apiWebinar.roomStarted,
      startedAt: apiWebinar.startedAt || undefined,
      endedAt: apiWebinar.stoppedAt || undefined,
      // Add owner info for display
      ownerEmail: apiWebinar.user.email,
      ownerName: `${apiWebinar.user.firstName} ${apiWebinar.user.lastName}`.trim(),
    }
  }

  // Fetch webinars from API
  const fetchWebinars = async (retryCount = 0) => {
    try {
      setLoading(true)
      // First try to get token from useTokenAuth hook, fallback to localStorage
      let token = getToken()

      if (!token) {
        token = localStorage.getItem('payload-token')
      }

      if (!token) {
        toast({
          title: 'Требуется авторизация',
          description: 'Авторизуйтесь, чтобы продолжить',
          variant: 'destructive',
        })
        router.push('/auth/login')
        return
      }

      const response = await fetch('https://isracms.vercel.app/api/rooms/my', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
      })

      // If token is expired, try to refresh it (only once)
      if (!response.ok && response.status === 401 && retryCount === 0) {
        try {
          const refreshResponse = await fetch('http://localhost:3000/api/users/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken: localStorage.getItem('refresh-token'),
            }),
          })

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            if (refreshData.token) {
              localStorage.setItem('payload-token', refreshData.token)
              // Retry the original request with the new token
              return fetchWebinars(retryCount + 1)
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch webinars: ${response.status}`)
      }

      const result = await response.json()

      if (result && result.docs) {
        const convertedWebinars: Webinar[] = result.docs.map(convertApiWebinar)

        // Since we're using /api/rooms/my, we get only user's own webinars
        // No need for additional filtering based on user role
        setWebinars(convertedWebinars)
      }
    } catch (error) {
      console.error('Webinars fetch error:', error)
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить список вебинаров',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async (retryCount = 0) => {
      try {
        // First try to get token from useTokenAuth hook, fallback to localStorage
        let token = getToken()

        if (!token) {
          token = localStorage.getItem('payload-token')
        }

        if (!token) {
          toast({
            title: 'Требуется авторизация',
            description: 'Авторизуйтесь, чтобы продолжить',
            variant: 'destructive',
          })
          router.push('/auth/login')
          return
        }

        const response = await fetch('https://isracms.vercel.app/api/users/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
        })

        // If token is expired, try to refresh it (only once)
        if (!response.ok && response.status === 401 && retryCount === 0) {
          try {
            const refreshResponse = await fetch('http://localhost:3000/api/users/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refreshToken: localStorage.getItem('refresh-token'),
              }),
            })

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()
              if (refreshData.token) {
                localStorage.setItem('payload-token', refreshData.token)
                // Retry the original request with the new token
                return fetchUserData(retryCount + 1)
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
          }
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.errors?.[0]?.message || `Failed to fetch user data: ${response.status}`)
        }

        const result = await response.json()

        if (result && result.user) {
          setUserData(result.user as UserData)
        } else {
          throw new Error('No user data received')
        }
      } catch (error) {
        console.error('User data fetch error:', error)

        if (
          error instanceof Error &&
          (error.message.includes('401') ||
            error.message.includes('Unauthorized') ||
            error.message.includes('token') ||
            error.message.includes('No user data received'))
        ) {
          toast({
            title: 'Срок действия токена истек',
            description: 'Авторизуйтесь снова',
            variant: 'destructive',
          })
          router.push('/auth/login')
        } else {
          toast({
            title: 'Ошибка загрузки данных',
            description: 'Не удалось получить данные профиля',
            variant: 'destructive',
          })
        }
      } finally {
        setUserLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  // Fetch webinars after user data is loaded
  useEffect(() => {
    if (!userLoading && userData) {
      fetchWebinars()
    }
  }, [userLoading, userData])

  // Calculate stats from real data
  const stats = {
    total: webinars.length,
    active: webinars.filter((w) => w.status === 'active').length,
    scheduled: webinars.filter((w) => w.status === 'scheduled').length,
    drafts: webinars.filter((w) => w.status === 'draft').length,
  }

  const filteredWebinars = webinars.filter(
    (webinar: Webinar) =>
      webinar.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      webinar.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (isAdmin && webinar.ownerEmail?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (isAdmin && webinar.ownerName?.toLowerCase().includes(debouncedSearch.toLowerCase()))
  )

  const handleRefresh = () => {
    fetchWebinars()
  }

  const handleOpen = (id: string) => {
    console.log('Open webinar:', id)
    router.push(`/room/${id}`)
  }

  const handleEdit = (id: string) => {
    const webinar = webinars.find((w) => w.id === id)
    if (webinar) {
      // Check if user has permission to edit
      const isOwner = webinar.hostId?.toString() === userData?.id?.toString()

      if (!isAdmin && !isOwner) {
        toast({
          title: 'Доступ запрещен',
          description: 'Вы можете редактировать только свои вебинары',
          variant: 'destructive',
        })
        return
      }
      setEditingWebinar(webinar)
    }
  }

  const handleDelete = async (id: string) => {
    const webinar = webinars.find((w) => w.id === id)

    // Check if user has permission to delete
    const isOwner = webinar?.hostId?.toString() === userData?.id?.toString()

    if (!isAdmin && !isOwner) {
      toast({
        title: 'Доступ запрещен',
        description: 'Вы можете удалять только свои вебинары',
        variant: 'destructive',
      })
      return
    }

    try {
      const token = getToken()

      const response = await fetch(`https://isracms.vercel.app/api/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete webinar')
      }

      toast({
        title: 'Успешно удалено',
        description: 'Вебинар был успешно удален',
      })

      // Refresh webinars list
      fetchWebinars()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Ошибка удаления',
        description: 'Не удалось удалить вебинар',
        variant: 'destructive',
      })
    }
  }

  const handleCopyLink = async (id: string) => {
    const webinar = webinars.find((w) => w.id === id)
    if (webinar) {
      const linkToCopy = webinar.streamUrl || `${window.location.origin}/room/${webinar.id}`

      try {
        await navigator.clipboard.writeText(linkToCopy)
        toast({
          title: 'Ссылка скопирована',
          description: 'Ссылка на вебинар успешно скопирована.',
        })
      } catch (error) {
        toast({
          title: 'Ошибка копирования',
          description: 'Не удалось скопировать ссылку. Попробуйте еще раз.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleStartWebinar = async (id: string) => {
    const webinar = webinars.find((w) => w.id === id)

    // Check if user has permission to start
    const isOwner = webinar?.hostId?.toString() === userData?.id?.toString()

    if (!isAdmin && !isOwner) {
      toast({
        title: 'Доступ запрещен',
        description: 'Вы можете запускать только свои вебинары',
        variant: 'destructive',
      })
      return
    }

    if (webinar?.roomStarted) {
      toast({
        title: 'Вебинар уже запущен',
        description: 'Этот вебинар уже запущен',
        variant: 'destructive',
      })
      return
    }

    try {
      // Use the roomsApi start method which integrates the curl command
      const result = await roomsApi.start(id)
      console.log('Webinar started successfully:', result)

      toast({
        title: 'Вебинар запущен',
        description: 'Вебинар успешно запущен. Перенаправление...',
      })

      // Refresh webinars list
      fetchWebinars()

      // Redirect to webinar room after a short delay
      setTimeout(() => {
        router.push(`/room/${id}`)
      }, 1000)

    } catch (error) {
      console.error('Start webinar error:', error)
      toast({
        title: 'Ошибка запуска',
        description:
          error instanceof Error
            ? error.message
            : 'Не удалось запустить вебинар',
        variant: 'destructive',
      })
    }
  }

  const handleWebinarCreated = () => {
    // Refresh webinars list when a new one is created
    fetchWebinars()
  }

  const handleWebinarUpdated = () => {
    // Refresh webinars list when one is updated
    fetchWebinars()
    setEditingWebinar(null)
  }

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!userData) return 'Пользователь'

    if (userData.firstName) {
      return userData.firstName
    }

    if (userData.name) {
      const nameParts = userData.name.split(' ')
      return nameParts[0] || userData.name
    }

    const emailName = userData.email.split('@')[0]
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }

  // Show loading state while fetching user data
  if (userLoading || loading) {
    return <PageLoader />
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-4xl font-bold tracking-tight text-foreground'>
              Добро пожаловать, 👋 {getUserDisplayName()}!
            </h1>
          </div>
          <p className='text-gray-400 text-lg mt-1'>
            {isAdmin ? 'Управляйте всеми вебинарами в системе' : 'Управляйте своими вебинарами и настройками'}
          </p>
          {userData?.email && <p className='text-gray-500 text-sm mt-1'>{userData.email}</p>}
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <div className='relative flex-1 sm:flex-initial'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10' />
            <Input
              placeholder={isAdmin ? 'Поиск по названию, владельцу...' : 'Поиск вебинаров...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 bg-card/50 backdrop-blur-md border-border text-foreground placeholder:text-muted-foreground focus:bg-card/80 focus:border-primary/50 transition-all'
            />
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={loading}
            className='bg-card/50 backdrop-blur-md border-border text-foreground hover:bg-card/80 hover:border-primary/50 transition-all'
          >
            {loading ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : <RefreshCw className='h-4 w-4 mr-2' />}
            Обновить
          </Button>
          <CreateWebinarModal
            buttonText='Создать'
            buttonSize='sm'
            buttonClassName='gradient-primary hover:opacity-90 transition-opacity'
            showIcon={true}
            onSuccess={handleWebinarCreated}
          />
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Main content */}
        <div className='flex-1'>
          {/* Webinars grid */}
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
            {filteredWebinars.map((webinar) => {
              // Check if current user is the owner of this webinar
              const isOwner = webinar.hostId?.toString() === userData?.id?.toString()
              // User can edit/delete if they are admin OR owner
              const canModify = isAdmin || isOwner

              return (
                <div key={webinar.id} className='relative'>
                  <WebinarCard
                    webinar={webinar}
                    onView={() => handleOpen(webinar.id)}
                    onEdit={canModify ? () => handleEdit(webinar.id) : undefined}
                    onDelete={canModify ? () => handleDelete(webinar.id) : undefined}
                    onCopyLink={() => handleCopyLink(webinar.id)}
                    onStartWebinar={canModify ? () => handleStartWebinar(webinar.id) : undefined}
                  />
                  {/* Owner badge for admin view */}
                  {isAdmin && !isOwner && <div className='absolute top-2 right-2 z-10'></div>}
                </div>
              )
            })}
          </div>

          {filteredWebinars.length === 0 && !loading && (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Video className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-medium mb-2'>Вебинары не найдены</h3>
                <p className='text-muted-foreground text-center mb-4'>
                  {searchTerm
                    ? 'Попробуйте изменить поисковый запрос'
                    : isAdmin
                      ? 'В системе пока нет вебинаров'
                      : 'У вас пока нет вебинаров. Создайте свой первый вебинар!'}
                </p>
                <CreateWebinarModal
                  buttonText='Создать вебинар'
                  buttonClassName='gradient-primary hover:opacity-90 transition-opacity'
                  showIcon={true}
                  onSuccess={handleWebinarCreated}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar with stats */}
        <div className='w-full lg:w-80 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>{isAdmin ? 'Статистика всех вебинаров' : 'Статистика'}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <StatsCard title={isAdmin ? 'Всего в системе' : 'Всего вебинаров'} value={stats.total} icon={Video} />
              <StatsCard title='Активных' value={stats.active} icon={Video} />
              <StatsCard title='Запланированных' value={stats.scheduled} icon={Calendar} />
              <StatsCard title='Черновиков' value={stats.drafts} icon={FileText} />
            </CardContent>
          </Card>

          {!isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <CreateWebinarModal
                  buttonText='Новый вебинар'
                  buttonSize='sm'
                  buttonClassName='w-full gradient-primary hover:opacity-90 transition-opacity'
                  showIcon={true}
                  onSuccess={handleWebinarCreated}
                />

                <Button variant='outline' className='w-full' size='sm'>
                  <FileText className='h-4 w-4 mr-2' />
                  Отчеты
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Webinar Modal */}
      {editingWebinar && (
        <EditWebinarModal
          webinar={editingWebinar}
          open={!!editingWebinar}
          onOpenChange={(open) => {
            if (!open) {
              setEditingWebinar(null)
              handleWebinarUpdated()
            }
          }}
        />
      )}
    </div>
  )
}
