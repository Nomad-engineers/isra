'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { useTokenAuth } from '@/hooks/use-token-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { GenericImagePicker } from '@/components/ui/generic-image-picker'
import { apiFetch } from '@/lib/api-fetch'

// Form schema with validation for webinars
const webinarFormSchema = z.object({
  title: z.string().min(1, 'Название вебинара обязательно'),
  hostName: z.string().min(1, 'Имя ведущего обязательно'),
  datetime: z.string().optional(),
  description: z.string().optional(),
  link: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Некорректный URL' }
    ),
  showBanner: z.boolean(),
  showBtn: z.boolean(),
  showChat: z.boolean(),
  isVolumeOn: z.boolean(),
})

type WebinarFormData = z.infer<typeof webinarFormSchema>

// Form schema with validation for rooms
const roomFormSchema = z.object({
  name: z.string().min(1, 'Название комнаты обязательно'),
  speaker: z.string().min(1, 'Имя ведущего обязательно'),
  description: z.string().optional(),
  scheduledDate: z.string().optional(),
  videoUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Некорректный URL' }
    ),
  bannerUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Некорректный URL' }
    ),
  btnUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Некорректный URL' }
    ),
  logoUrl: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Некорректный URL' }
    ),
  showBanner: z.boolean(),
  showBtn: z.boolean(),
  showChat: z.boolean(),
  isVolumeOn: z.boolean(),
  type: z.enum(['live', 'auto']),
})

type RoomFormData = z.infer<typeof roomFormSchema>

interface WebinarData {
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

interface RoomData {
  id: string
  name: string
  description?: string | null
  speaker: string
  type: 'live' | 'auto'
  videoUrl?: string | null
  bannerUrl?: string | null
  btnUrl?: string | null
  logoUrl?: string | null
  showBanner?: boolean | null
  showBtn?: boolean | null
  showChat?: boolean | null
  isVolumeOn?: boolean | null
  scheduledDate?: string | null
  roomStarted?: boolean | null
  startedAt?: string | null
  stoppedAt?: string | null
  logo?: string | null | number
  user: number | {
    id: number
    firstName?: string | null
    lastName?: string | null
    email: string
    role: string
  }
  createdAt: string
  updatedAt: string
}

export default function EditRoomPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { getToken } = useTokenAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('room')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [webinarData, setWebinarData] = useState<WebinarData | null>(null)
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const roomId = params.id as string

  // Memoize stable functions to prevent unnecessary re-renders
  const stableToast = useMemo(() => toast, [toast])
  const stableGetToken = useMemo(() => getToken, [getToken])

  // Utility function to get token with caching
  const getCurrentToken = useCallback(() => {
    if (token) return token
    const storedToken = localStorage.getItem('payload-token')
    if (storedToken) {
      setToken(storedToken)
      return storedToken
    }
    return null
  }, [token])

  // Token refresh utility
  const refreshToken = useCallback(async () => {
    try {
      const refreshData = await apiFetch('/users/refresh-token', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: localStorage.getItem('refresh-token'),
        }),
      })

      if (refreshData.token) {
        localStorage.setItem('payload-token', refreshData.token)
        setToken(refreshData.token)
        return refreshData.token
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
    return null
  }, [])

  // Helper function to upload file
  const uploadFile = async (file: File, type: 'logo' | 'banner'): Promise<string | null> => {
    try {
      const currentToken = getCurrentToken()
      if (!currentToken) {
        throw new Error('No authorization token')
      }

      const formData = new FormData()
      formData.append('file', file)

      const uploadEndpoint = type === 'logo'
        ? '/api/upload/room-logo'
        : '/api/upload/room-banner'

      const result = await apiFetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${currentToken}`,
        },
        body: formData,
      })

      return result.url
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error)
      throw error
    }
  }

  // Initialize webinar form
  const webinarForm = useForm<WebinarFormData>({
    resolver: zodResolver(webinarFormSchema),
    defaultValues: {
      title: '',
      hostName: '',
      datetime: '',
      description: '',
      link: '',
      showBanner: false,
      showBtn: false,
      showChat: true,
      isVolumeOn: true,
    },
  })

  // Initialize room form
  const roomForm = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: '',
      speaker: '',
      description: '',
      scheduledDate: '',
      videoUrl: '',
      bannerUrl: '',
      btnUrl: '',
      logoUrl: '',
      showBanner: false,
      showBtn: false,
      showChat: true,
      isVolumeOn: true,
      type: 'live',
    },
  })

  // Fetch user data - optimized to run only once
  useEffect(() => {
    if (isAuthenticating || userData) return // Prevent multiple authentication attempts

    const fetchUserData = async () => {
      setIsAuthenticating(true)
      try {
        let currentToken = getCurrentToken()

        if (!currentToken) {
          currentToken = await refreshToken()
        }

        if (!currentToken) {
          stableToast({
            title: 'Требуется авторизация',
            description: 'Авторизуйтесь, чтобы продолжить',
            variant: 'destructive',
          })
          router.push('/auth/login')
          return
        }

        const result = await apiFetch('/users/me', {
          headers: {
            Authorization: `JWT ${currentToken}`,
          },
        })

        if (result && result.user) {
          setUserData(result.user)
        }
      } catch (error) {
        console.error('User data fetch error:', error)
        stableToast({
          title: 'Ошибка загрузки данных',
          description: 'Не удалось получить данные профиля',
          variant: 'destructive',
        })
      } finally {
        setIsAuthenticating(false)
      }
    }

    fetchUserData()
  }, [router, userData, isAuthenticating, getCurrentToken, refreshToken, stableToast])

  // Fetch room/webinar data - optimized with better dependency management
  useEffect(() => {
    if (!userData || !roomId) return // Only fetch when we have userData and roomId

    const fetchRoomData = async () => {
      try {
        let currentToken = getCurrentToken()

        if (!currentToken) {
          currentToken = await refreshToken()
        }

        if (!currentToken) {
          stableToast({
            title: 'Требуется авторизация',
            description: 'Авторизуйтесь, чтобы продолжить',
            variant: 'destructive',
          })
          router.push('/auth/login')
          return
        }

        const result = await apiFetch(`/rooms/${roomId}`, {
          headers: {
            Authorization: `JWT ${currentToken}`,
          },
        })

        processRoomData(result)
      } catch (error) {
        console.error('Room fetch error:', error)
        stableToast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить данные комнаты',
          variant: 'destructive',
        })
        router.push('/rooms')
      } finally {
        setIsLoading(false)
      }
    }

    const processRoomData = (result: any) => {
      // Handle both old format (result.doc) and new format (result directly)
      const data = result.doc || result
      if (data) {
        setRoomData(data)

        // Only set default tab on initial load
        if (isInitialLoad) {
          // Default to room tab, but switch to webinar if it's clearly a webinar type
          if (data.type === 'auto' && data.scheduledDate) {
            setActiveTab('webinar')
          } else {
            setActiveTab('room')
          }
          setIsInitialLoad(false)
        }

        // Check permissions
        const isAdmin = userData?.role === 'admin'
        const userId = typeof data.user === 'object' ? data.user?.id : data.user
        const isOwner = userId?.toString() === userData?.id?.toString()

        if (!isAdmin && !isOwner) {
          stableToast({
            title: 'Доступ запрещен',
            description: 'Вы можете редактировать только свои комнаты',
            variant: 'destructive',
          })
          router.push('/rooms')
          return
        }

        // Set webinar form values only if they haven't been modified by user
        if (!webinarForm.formState.isDirty) {
          webinarForm.reset({
            title: data.name || '',
            hostName: data.speaker || '',
            datetime: data.scheduledDate || '',
            description: data.description || '',
            link: data.videoUrl || '',
            showBanner: data.showBanner ?? false,
            showBtn: data.showBtn ?? false,
            showChat: data.showChat ?? true,
            isVolumeOn: data.isVolumeOn ?? true,
          })
        }

        // Set room form values only if they haven't been modified by user
        if (!roomForm.formState.isDirty) {
          roomForm.reset({
            name: data.name || '',
            speaker: data.speaker || '',
            description: data.description || '',
            scheduledDate: data.scheduledDate || '',
            videoUrl: data.videoUrl || '',
            bannerUrl: data.bannerUrl || '',
            btnUrl: data.btnUrl || '',
            logoUrl: data.logoUrl || '',
            showBanner: data.showBanner ?? false,
            showBtn: data.showBtn ?? false,
            showChat: data.showChat ?? true,
            isVolumeOn: data.isVolumeOn ?? true,
            type: data.type || 'live',
          })
        }
      }
    }

    fetchRoomData()
  }, [userData, roomId, getCurrentToken, refreshToken, stableToast, router, isInitialLoad, webinarForm, roomForm])

  // Handle webinar form submission
  const onWebinarSubmit = async (data: WebinarFormData) => {
    if (isSubmitting) return // Prevent multiple simultaneous submissions

    setIsSubmitting(true)

    try {
      const currentToken = getCurrentToken()

      if (!currentToken) {
        stableToast({
          title: 'Требуется авторизация',
          description: 'Авторизуйтесь, чтобы продолжить',
          variant: 'destructive',
        })
        return
      }

      // Prepare the update payload
      const updatePayload = {
        name: data.title,
        speaker: data.hostName,
        description: data.description || '',
        videoUrl: data.link || '',
        scheduledDate: data.datetime ? new Date(data.datetime).toISOString() : null,
        showBanner: data.showBanner,
        showBtn: data.showBtn,
        showChat: data.showChat,
        isVolumeOn: data.isVolumeOn,
      }

      console.log('Updating webinar:', roomId, updatePayload)

      await apiFetch(`/rooms/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      })

      console.log('Update successful')

      stableToast({
        title: 'Успешно обновлено',
        description: 'Вебинар был успешно обновлен',
      })

      // Redirect back to rooms page
      router.push('/rooms')
    } catch (error) {
      console.error('Update error:', error)
      stableToast({
        title: 'Ошибка обновления',
        description:
          error instanceof Error
            ? error.message
            : 'Не удалось обновить вебинар',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle room form submission
  const onRoomSubmit = async (data: RoomFormData) => {
    if (isSubmitting) return // Prevent multiple simultaneous submissions

    setIsSubmitting(true)

    try {
      const currentToken = getCurrentToken()

      if (!currentToken) {
        stableToast({
          title: 'Требуется авторизация',
          description: 'Авторизуйтесь, чтобы продолжить',
          variant: 'destructive',
        })
        return
      }

      // Upload files if any
      let logoUrl = data.logoUrl || ''
      let bannerUrl = data.bannerUrl || ''

      try {
        if (logoFile) {
          const uploadedLogoUrl = await uploadFile(logoFile, 'logo')
          logoUrl = uploadedLogoUrl || ''
        }
        if (bannerFile) {
          const uploadedBannerUrl = await uploadFile(bannerFile, 'banner')
          bannerUrl = uploadedBannerUrl || ''
        }
      } catch (uploadError) {
        stableToast({
          title: 'Ошибка загрузки файлов',
          description:
            uploadError instanceof Error
              ? uploadError.message
              : 'Не удалось загрузить изображения',
          variant: 'destructive',
        })
        return
      }

      // Prepare the update payload
      const updatePayload = {
        name: data.name,
        speaker: data.speaker,
        description: data.description || '',
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : null,
        videoUrl: data.videoUrl || '',
        bannerUrl: bannerUrl,
        btnUrl: data.btnUrl || '',
        logoUrl: logoUrl,
        showBanner: data.showBanner,
        showBtn: data.showBtn,
        showChat: data.showChat,
        isVolumeOn: data.isVolumeOn,
        type: data.type,
      }

      console.log('Updating room:', roomId, updatePayload)

      await apiFetch(`/rooms/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      })

      console.log('Update successful')

      stableToast({
        title: 'Успешно обновлено',
        description: 'Комната была успешно обновлена',
      })

      // Redirect back to rooms page
      router.push('/rooms')
    } catch (error) {
      console.error('Update error:', error)
      stableToast({
        title: 'Ошибка обновления',
        description:
          error instanceof Error
            ? error.message
            : 'Не удалось обновить комнату',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='mb-6'>
        <Link href='/rooms' className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Назад к комнатам
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Редактировать</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='room'>Изменить комнату</TabsTrigger>
              <TabsTrigger value='webinar'>Изменить вебинар</TabsTrigger>
            </TabsList>

            {/* Room Edit Tab */}
            <TabsContent value='room' className='mt-6'>
              <Form {...roomForm}>
                <form onSubmit={roomForm.handleSubmit(onRoomSubmit)} className='space-y-6'>
                  {/* Name field - required */}
                  <FormField
                    control={roomForm.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название комнаты *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Введите название комнаты'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Speaker field - required */}
                  <FormField
                    control={roomForm.control}
                    name='speaker'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ведущий *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Введите имя ведущего'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Scheduled date field - optional */}
                  <FormField
                    control={roomForm.control}
                    name='scheduledDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Время проведения</FormLabel>
                        <DateTimePicker
                          value={field.value ? new Date(field.value) : null}
                          onChange={(date) =>
                            field.onChange(date?.toISOString() || '')
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type field */}
                  <FormField
                    control={roomForm.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип комнаты</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            disabled={isSubmitting}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <option value='live'>Прямой эфир</option>
                            <option value='auto'>Автоматический</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Video URL field */}
                  <FormField
                    control={roomForm.control}
                    name='videoUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ссылка на видео</FormLabel>
                        <FormControl>
                          <Input
                            type='url'
                            placeholder='https://example.com/video-link'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Button URL field */}
                  <FormField
                    control={roomForm.control}
                    name='btnUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ссылка на кнопку</FormLabel>
                        <FormControl>
                          <Input
                            type='url'
                            placeholder='https://example.com/button-link'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Logo and Banner Image Pickers in one row */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <GenericImagePicker
                      label='Логотип'
                      description='Загрузите логотип для комнаты'
                      currentImage={roomData?.logoUrl || undefined}
                      onImageSelect={(file) => {
                        setLogoFile(file)
                        if (!file) {
                          roomForm.setValue('logoUrl', '')
                        }
                      }}
                      onUrlChange={(url) => roomForm.setValue('logoUrl', url)}
                      aspectRatio='square'
                      className='w-full'
                    />

                    <GenericImagePicker
                      label='Добавить баннер'
                      description='Загрузите баннер для комнаты'
                      currentImage={roomData?.bannerUrl || undefined}
                      onImageSelect={(file) => {
                        setBannerFile(file)
                        if (!file) {
                          roomForm.setValue('bannerUrl', '')
                        }
                      }}
                      onUrlChange={(url) => roomForm.setValue('bannerUrl', url)}
                      aspectRatio='banner'
                      className='w-full'
                    />
                  </div>

                  {/* Description field */}
                  <FormField
                    control={roomForm.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Введите описание комнаты'
                            rows={4}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Toggle Switches Section */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Настройки отображения</h3>

                    {/* Show Banner Toggle */}
                    <FormField
                      control={roomForm.control}
                      name='showBanner'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Показать баннер</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Отображать баннер в комнате
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Show Button Toggle */}
                    <FormField
                      control={roomForm.control}
                      name='showBtn'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Показать кнопку</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Отображать кнопку действия в комнате
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Show Chat Toggle */}
                    <FormField
                      control={roomForm.control}
                      name='showChat'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Показать чат</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Включить чат для участников
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Volume On Toggle */}
                    <FormField
                      control={roomForm.control}
                      name='isVolumeOn'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Звук включен</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Включить звук по умолчанию
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>



                  <div className='flex justify-end gap-3 pt-4'>
                    <Link href='/rooms'>
                      <Button type='button' variant='secondary' disabled={isSubmitting}>
                        Отмена
                      </Button>
                    </Link>
                    <Button type='submit' disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className='mr-2 h-4 w-4' />
                          Сохранить комнату
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Webinar Edit Tab */}
            <TabsContent value='webinar' className='mt-6'>
              <Form {...webinarForm}>
                <form onSubmit={webinarForm.handleSubmit(onWebinarSubmit)} className='space-y-6'>

                  {/* Toggle Switches Section */}
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Настройки отображения</h3>

                    {/* Show Banner Toggle */}
                    <FormField
                      control={webinarForm.control}
                      name='showBanner'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Показать баннер</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Отображать баннер в вебинаре
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Show Button Toggle */}
                    <FormField
                      control={webinarForm.control}
                      name='showBtn'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Показать кнопку</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Отображать кнопку действия в вебинаре
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Show Chat Toggle */}
                    <FormField
                      control={webinarForm.control}
                      name='showChat'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Показать чат</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Включить чат для участников
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Volume On Toggle */}
                    <FormField
                      control={webinarForm.control}
                      name='isVolumeOn'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel className='text-base'>Звук включен</FormLabel>
                            <p className='text-sm text-muted-foreground'>
                              Включить звук по умолчанию
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='flex justify-end gap-3 pt-4'>
                    <Link href='/rooms'>
                      <Button type='button' variant='secondary' disabled={isSubmitting}>
                        Отмена
                      </Button>
                    </Link>
                    <Button type='submit' disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className='mr-2 h-4 w-4' />
                          Сохранить вебинар
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}