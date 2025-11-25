'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/common/stats-card'
import { PageLoader } from '@/components/ui/loaders'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import { RefreshCw, Search, Calendar, FileText, Upload, DoorOpen } from 'lucide-react'
import { CreateWebinarModal } from '@/components/webinars/create-webinar-modal'
import { EditWebinarModal } from '@/components/webinars/edit-webinar-modal'
import { Webinar } from '@/types/webinar'
import { useRooms } from '@/hooks/use-rooms'
import { RoomCard } from '@/components/rooms/room-card'
import { toast } from '@/components/ui/use-toast'

interface UserData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  phone?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export default function RoomsPage() {
  const router = useRouter()
  const { toast: shadcnToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null)

  // Fetch rooms using the API when user data is available
  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms,
    deleteRoom,
  } = useRooms({
    userId: userData?.id,
    autoFetch: !!userData?.id,
  })

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('payload-token')

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

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.errors?.[0]?.message || 'Failed to fetch user data')
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
          (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('token'))
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
  }, [router])

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      room.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const handleRefresh = () => {
    setLoading(true)
    refetchRooms() // Fetch fresh rooms data
    setTimeout(() => setLoading(false), 1000)
  }

  const handleWebinarCreated = () => {
    // Refresh rooms list after successful webinar creation
    refetchRooms()
  }

  // Room handlers
  const handleOpenRoom = (id: string) => {
    console.log('Open room:', id)
    // Navigate to room page or open room modal
    router.push(`/room/${id}`)
  }

  const handleEditRoom = (id: string) => {
    console.log('Edit room:', id)
    // TODO: Implement room editing functionality
    shadcnToast({
      title: 'Информация',
      description: 'Редактирование комнат скоро будет доступно',
    })
  }

  const handleDeleteRoom = async (id: string) => {
    // Find the room to get its name for the confirmation dialog
    const roomToDelete = rooms.find((room) => room.id === id)
    const roomName = roomToDelete?.name || 'эту комнату'

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить комнату "${roomName}"? Это действие нельзя будет отменить.`
    )

    if (!confirmed) {
      return
    }

    const success = await deleteRoom(id)

    if (success) {
      shadcnToast({
        title: 'Успешно',
        description: `Комната "${roomName}" была удалена`,
      })
    } else {
      shadcnToast({
        title: 'Ошибка',
        description: 'Не удалось удалить комнату. Попробуйте еще раз.',
        variant: 'destructive',
      })
    }
  }

  const handleCopyRoomLink = async (id: string) => {
    const roomLink = `${window.location.origin}/room/${id}`
    try {
      await navigator.clipboard.writeText(roomLink)
      shadcnToast({
        title: 'Ссылка скопирована',
        description: 'Ссылка на комнату успешно скопирована.',
      })
    } catch (error) {
      shadcnToast({
        title: 'Ошибка копирования',
        description: 'Не удалось скопировать ссылку. Попробуйте еще раз.',
        variant: 'destructive',
      })
    }
  }

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!userData) return 'Пользователь'

    // Try firstName first, then name, then fall back to email
    if (userData.firstName) {
      return userData.firstName
    }

    if (userData.name) {
      // If name is "First Last", use first name only
      const nameParts = userData.name.split(' ')
      return nameParts[0] || userData.name
    }

    // Extract name from email if no name fields available
    const emailName = userData.email.split('@')[0]
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }

  // Show loading state while fetching user data or rooms
  if (userLoading || roomsLoading) {
    return <PageLoader />
  }

  // Show error state if rooms fetch failed
  if (roomsError) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <p className='text-destructive text-center mb-4'>Не удалось загрузить комнаты: {roomsError}</p>
            <Button onClick={refetchRooms} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-4xl font-bold tracking-tight text-white'>Добро пожаловать, {getUserDisplayName()}! 👋</h1>
          <p className='text-gray-400 text-lg'>Управляйте своими комнатами и настройками</p>
          {userData?.email && <p className='text-gray-500 text-sm mt-1'>{userData.email}</p>}
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <div className='relative flex-1 sm:flex-initial'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10' />
            <Input
              placeholder='Поиск комнат...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 bg-white/5 backdrop-blur-md border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-white/20 transition-all'
            />
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            className='bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all'
          >
            <Upload className='h-4 w-4 mr-2' />
            Импорт
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            className='bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
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
          {/* Rooms grid */}
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onView={() => handleOpenRoom(room.id)}
                onEdit={() => handleEditRoom(room.id)}
                onDelete={() => handleDeleteRoom(room.id)}
                onCopyLink={() => handleCopyRoomLink(room.id)}
              />
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <DoorOpen className='h-12 w-12 text-muted-foreground mb-4' />
                <h3 className='text-lg font-medium mb-2'>Комнаты не найдены</h3>
                <p className='text-muted-foreground text-center mb-4'>
                  {searchTerm
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'У вас пока нет комнат. Создайте свою первую комнату!'}
                </p>
                <CreateWebinarModal
                  buttonText='Создать комнату'
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
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <StatsCard title='Всего комнат' value={rooms.length} icon={DoorOpen} />
              <StatsCard
                title='Активных'
                value={rooms.length} // All rooms are considered active for now
                icon={DoorOpen}
              />
              <StatsCard
                title='Создано сегодня'
                value={
                  rooms.filter((room) => {
                    const today = new Date().toDateString()
                    const roomDate = new Date(room.createdAt).toDateString()
                    return today === roomDate
                  }).length
                }
                icon={Calendar}
              />
              <StatsCard
                title='Обновлено'
                value={
                  rooms.filter((room) => new Date(room.updatedAt).toDateString() === new Date().toDateString()).length
                }
                icon={FileText}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <CreateWebinarModal
                buttonText='Новая комната'
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
            }
          }}
        />
      )}
    </div>
  )
}
