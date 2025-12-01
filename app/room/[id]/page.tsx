'use client'

import { useState, useEffect, use, useRef, useImperativeHandle, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useChatWebSocket } from '@/hooks/use-chat-websocket'
import { SendEventRequest } from '@/lib/chat-websocket'
import {
  ArrowLeft,
  Send,
  Users,
  Clock,
  Loader2,
  MessageSquare,
  Eye,
  Settings,
  Wifi,
  WifiOff,
  Play,
  Square,
} from 'lucide-react'
import { VidstackPlayer, VidstackPlayerRef } from '@/components/video/vidstack-player'

interface WebinarUser {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
}

interface WebinarData {
  id: string
  name: string
  description: string
  speaker: string
  type: string
  videoUrl: string
  scheduledDate: string
  roomStarted: boolean
  showChat: boolean
  createdAt: string
  user?: WebinarUser // Owner of the room
}


export default function WebinarRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()

  // Unwrap params Promise
  const { id: roomId } = use(params)

  const [webinar, setWebinar] = useState<WebinarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [userName, setUserName] = useState('Гость')
  const [userPhone, setUserPhone] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [duration, setDuration] = useState('00:00:00')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [webinarStarted, setWebinarStarted] = useState(false)
  const videoPlayerRef = useRef<VidstackPlayerRef>(null)

  // Chat WebSocket hook
  const {
    messages,
    events,
    connectionStatus,
    isConnected,
    sendMessage,
    sendEvent,
    error: chatError,
  } = useChatWebSocket({
    roomId,
    userIdentifier: userPhone,
    userName,
    autoConnect: !!userPhone && !!userName,
  })

  // Show chat errors in toast
  useEffect(() => {
    if (chatError) {
      toast({
        title: 'Ошибка чата',
        description: chatError.message,
        variant: 'destructive',
      })
    }
  }, [chatError, toast])

// Log events for debugging (can be removed in production)
  useEffect(() => {
    if (events.length > 0) {
      console.log('Received events:', events)
      events.forEach((event) => {
        toast({
          title: `Получен ивент: ${event.type}`,
          description: JSON.stringify(event.data, null, 2),
          variant: 'default',
        })
      })
    }
  }, [events, toast])

  
  // Fetch webinar data with owner validation
  useEffect(() => {
    const fetchWebinarAndValidate = async () => {
      const token = localStorage.getItem('payload-token')

      try {
        // Get webinar data
        const webinarResponse = await fetch(`https://isracms.vercel.app/api/rooms/${roomId}`)

        if (!webinarResponse.ok) {
          console.warn('Failed to fetch webinar, using mock data')
          const mockData: WebinarData = {
            id: roomId,
            name: 'Тестовый вебинар',
            description: 'Это тестовый вебинар для демонстрации чата',
            speaker: 'Спикер',
            type: 'webinar',
            videoUrl: '',
            scheduledDate: new Date().toISOString(),
            roomStarted: true,
            showChat: true,
            createdAt: new Date().toISOString(),
          }
          setWebinar(mockData)
          setIsOwner(false)
          setLoading(false)
          return
        }

        const webinarData = await webinarResponse.json()
        setWebinar(webinarData)

        // If user has token, validate ownership
        if (token) {
          try {
            // Get current user data
            const userResponse = await fetch('https://isracms.vercel.app/api/users/me', {
              headers: {
                Authorization: `JWT ${token}`,
              },
            })

            if (userResponse.ok) {
              const userData = await userResponse.json()

              // Debug logging
              console.log('Webinar owner ID:', webinarData.user?.id, typeof webinarData.user?.id)
              console.log('Current user ID:', userData.user?.id, typeof userData.user?.id)
              console.log('Webinar data:', webinarData.user)
              console.log('User data:', userData.user)

              const isUserOwner = webinarData.user && userData.user.id.toString() === webinarData.user.id.toString()
              console.log('Is user owner?', isUserOwner)

              if (isUserOwner) {
                // User is the owner - use their actual data
                const displayName = userData.user.firstName || userData.user.name || userData.user.email.split('@')[0]
                setUserName(displayName)

                // Use phone if available, otherwise fall back to email for chat
                const userPhone = userData.user.phone || userData.user.email
                setUserPhone(userPhone)
                localStorage.setItem('user_name', displayName)
                localStorage.setItem('user_phone', userPhone)

                setIsOwner(true)
                setLoading(false)

                toast({
                  title: 'Доступ владельца',
                  description: 'Вы вошли как владелец вебинара',
                  variant: 'default',
                })
              } else {
                // User is authenticated but not owner - use guest auth
                setIsOwner(false)
                await handleGuestAuth()
              }
            } else {
              // Invalid token - use guest auth
              setIsOwner(false)
              await handleGuestAuth()
            }
          } catch (error) {
            console.error('Error validating ownership:', error)
            setIsOwner(false)
            await handleGuestAuth()
          }
        } else {
          // No token or no owner data - use guest auth
          setIsOwner(false)
          await handleGuestAuth()
        }
      } catch (error) {
        console.error('Error fetching webinar:', error)
        setLoading(false)

        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить данные вебинара',
          variant: 'destructive',
        })
      }
    }

    const handleGuestAuth = async () => {
      const storedName = localStorage.getItem('user_name')
      const storedPhone = localStorage.getItem('user_phone')

      if (!storedName || !storedPhone) {
        // Redirect to auth page
        router.push(`/room/${roomId}/auth`)
        return
      }

      // Use existing guest data
      setUserName(storedName)
      setUserPhone(storedPhone)
      setLoading(false)
    }

    fetchWebinarAndValidate()
  }, [roomId, router, toast])

  // Timer for duration
  useEffect(() => {
    if (!webinar?.roomStarted) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const hours = Math.floor(elapsed / 3600)
      const minutes = Math.floor((elapsed % 3600) / 60)
      const seconds = elapsed % 60

      setDuration(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [webinar])

  // Simulate viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => Math.max(1, prev + Math.floor(Math.random() * 3) - 1))
    }, 5000)

    setViewerCount(Math.floor(Math.random() * 50) + 10)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !webinar?.showChat || !isConnected) return

    try {
      // Send message through WebSocket hook
      await sendMessage(messageText)

      // Clear input after successful send
      setMessageText('')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Ошибка отправки',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Функция для отправки тестовых ивентов (для модераторов)
  const handleSendTestEvent = async () => {
    try {
      const testEvent: SendEventRequest = {
        type: 'moderator_action',
        data: {
          action: 'mute_user',
          userId: 'test-user-id',
          timestamp: new Date().toISOString(),
          moderator: userName,
        },
      }

      await sendEvent(testEvent)

      toast({
        title: 'Тестовый ивент отправлен',
        description: `Тип: ${testEvent.type}`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Failed to send test event:', error)
      toast({
        title: 'Ошибка отправки ивента',
        description: 'Не удалось отправить тестовый ивент',
        variant: 'destructive',
      })
    }
  }

  // Video control functions
  const handlePlayVideo = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.play()
      setIsVideoPlaying(true)
      setWebinarStarted(true)
    }
  }

  const handleStopVideo = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.stop()
      setIsVideoPlaying(false)
      setWebinarStarted(false)
    }
  }

  const handleVideoStateChange = (playing: boolean) => {
    setIsVideoPlaying(playing)
  }

  // Функция для отправки ивента начала вебинара и управления видео
  const handleStartWebinar = async () => {
    try {
      if (!webinarStarted) {
        // Start webinar and video
        await handlePlayVideo()

        const startEvent: SendEventRequest = {
          type: 'webinar_status',
          data: {
            status: 'started',
            timestamp: new Date().toISOString(),
            startedBy: userName,
          },
        }

        await sendEvent(startEvent)

        toast({
          title: 'Вебинар запущен',
          description: 'Вебинар и видео запущены',
          variant: 'default',
        })
      } else {
        // Stop webinar and video
        await handleStopVideo()

        const stopEvent: SendEventRequest = {
          type: 'webinar_status',
          data: {
            status: 'stopped',
            timestamp: new Date().toISOString(),
            stoppedBy: userName,
          },
        }

        await sendEvent(stopEvent)

        toast({
          title: 'Вебинар остановлен',
          description: 'Вебинар и видео остановлены',
          variant: 'default',
        })
      }
    } catch (error) {
      console.error('Failed to handle webinar state change:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить состояние вебинара',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-12 w-12 animate-spin text-isra-primary mx-auto' />
          <p className='text-white text-lg'>Загрузка вебинара...</p>
        </div>
      </div>
    )
  }

  if (!webinar) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark flex items-center justify-center'>
        <Card className='card-glass max-w-md'>
          <CardContent className='pt-6 text-center space-y-4'>
            <h2 className='text-2xl font-bold text-white'>Вебинар не найден</h2>
            <Button onClick={() => router.push('/rooms')} className='gradient-primary'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Вернуться к списку
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-isra-dark via-isra-medium to-isra-dark'>
      {/* Header */}
      <div className='bg-isra-dark/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => router.push('/rooms')}
                className='text-white hover:text-isra-primary'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Назад
              </Button>

              <div>
                <h1 className='text-xl font-bold text-white'>{webinar.name}</h1>
                <p className='text-sm text-gray-400'>Ведущий: {webinar.speaker}</p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              {webinar.roomStarted && (
                <>
                  <Badge className='bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'>
                    <div className='w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse' />
                    LIVE
                  </Badge>

                  <div className='flex items-center gap-2 text-white'>
                    <Clock className='h-4 w-4' />
                    <span className='font-mono'>{duration}</span>
                  </div>
                </>
              )}

              {/* Owner badge */}
              {isOwner && (
                <Badge className='bg-purple-500/20 text-purple-400 border-purple-500/50'>
                  👑 Владелец
                </Badge>
              )}

              <div className='flex items-center gap-2 text-white'>
                <Eye className='h-4 w-4' />
                <span>{viewerCount}</span>
              </div>

              {/* Owner controls */}
              {isOwner && (
                <>
                  <Button
                    variant='ghost'
                    size='sm'
                    className={`text-white ${webinarStarted ? 'bg-red-500/20 hover:bg-red-500/30' : ''}`}
                    onClick={handleStartWebinar}
                    disabled={!isConnected}
                    title={webinarStarted ? 'Остановить вебинар' : 'Запустить вебинар'}
                  >
                    {webinarStarted ? <Square className='h-4 w-4' /> : <Play className='h-4 w-4' />}
                  </Button>

                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-white'
                    onClick={handleSendTestEvent}
                    disabled={!isConnected}
                    title='Отправить тестовый ивент'
                  >
                  </Button>
                </>
              )}

              <Button variant='ghost' size='sm' className='text-white'>
                <Settings className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]'>
          {/* Chat Section - LEFT SIDE */}
          {webinar.showChat && (
            <Card className='card-glass lg:col-span-1 lg:order-1 flex flex-col'>
              <div className='p-4 border-b border-white/10'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-semibold text-white flex items-center gap-2'>
                    <MessageSquare className='h-5 w-5 text-isra-cyan' />
                    Чат
                  </h2>
                  <div className='flex items-center gap-2'>
                    {isConnected ? (
                      <Badge className='bg-green-500/20 text-green-400 border-green-500/50'>
                        <Wifi className='h-3 w-3 mr-1' />
                        Онлайн
                      </Badge>
                    ) : (
                      <Badge className='bg-red-500/20 text-red-400 border-red-500/50'>
                        <WifiOff className='h-3 w-3 mr-1' />
                        Офлайн
                      </Badge>
                    )}
                    <Badge variant='outline' className='text-white'>
                      <Users className='h-3 w-3 mr-1' />
                      {viewerCount}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                {/* Owner info */}
                {isOwner && (
                  <div className='bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4'>
                    <div className='flex items-center gap-2 text-purple-300 text-sm'>
                      <span className='font-semibold'>👑 Вы владелец вебинара</span>
                    </div>
                    <p className='text-purple-200 text-xs mt-1'>
                      У вас есть доступ к управлению вебинаром и отправке ивентов
                    </p>
                  </div>
                )}

                {messages.length === 0 && events.length === 0 ? (
                  <div className='text-center text-gray-400 py-8'>
                    <MessageSquare className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Пока нет сообщений</p>
                    <p className='text-sm'>Будьте первым, кто напишет!</p>
                  </div>
                ) : (
                  <>
                  {/* Messages */}
                  {messages.map((msg) => (
                    <div key={msg.id} className='space-y-1'>
                      <div className='flex items-baseline gap-2'>
                        <span className='font-semibold text-isra-cyan text-sm'>{msg.username}</span>
                        <span className='text-xs text-gray-500'>
                          {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className='text-white text-sm bg-white/5 rounded-lg px-3 py-2'>{msg.message}</p>
                    </div>
                  ))}

                {/* Display events */}
                {events.map((event, index) => (
                  <div key={`event-${index}`} className='space-y-1'>
                    <div className='flex items-baseline gap-2'>
                      <span className='font-semibold text-yellow-400 text-sm'>📡 Event: {event.type}</span>
                      <span className='text-xs text-gray-500'>
                        {new Date().toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className='text-yellow-200 text-xs bg-yellow-500/10 rounded-lg px-3 py-2 font-mono'>
                      {JSON.stringify(event.data, null, 2)}
                    </p>
                  </div>
                ))}
                </>
              )}
              </div>

              {/* Message Input */}
              <div className='p-4 border-t border-white/10'>
                {!isConnected && (
                  <div className='mb-2 text-sm text-red-400 text-center'>
                    Соединение потеряно. Пытаемся подключиться...
                  </div>
                )}
                <div className='flex gap-2'>
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder='Написать сообщение...'
                    disabled={!isConnected}
                    className='bg-white/5 border-white/10 text-white placeholder:text-gray-400 disabled:opacity-50'
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || !isConnected}
                    className='gradient-primary'
                  >
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Video Section - RIGHT SIDE */}
          <Card
            className={`card-glass flex flex-col lg:order-2 ${webinar.showChat ? 'lg:col-span-2' : 'lg:col-span-3'}`}
          >
            <CardContent className='p-0 flex-1 relative'>
              <div className='w-full h-full bg-black rounded-lg overflow-hidden'>
                <VidstackPlayer
                  ref={videoPlayerRef}
                  src={webinar.videoUrl || 'https://www.youtube.com/watch?v=6fty5yB7bFo'}
                  autoPlay={true}
                  muted={true}
                  controls={false}
                  showCustomControls={true}
                  aspectRatio="16/9"
                  onPlayStateChange={handleVideoStateChange}
                />
              </div>
            </CardContent>

            {/* Video Info */}
            {webinar.description && (
              <div className='p-4 border-t border-white/10'>
                <h3 className='text-sm font-semibold text-white mb-2'>О вебинаре</h3>
                <p className='text-sm text-gray-400'>{webinar.description}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
