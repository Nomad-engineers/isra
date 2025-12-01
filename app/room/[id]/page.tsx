'use client'

import { useState, useEffect, use, useRef } from 'react'
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
  Loader2,
  MessageSquare,
  Settings,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react'
import { VidstackPlayer } from '@/components/video/vidstack-player'
import { WebinarSettingsModal } from '@/components/webinars/webinar-settings-modal'
import { WebinarBanner } from '@/components/webinars/webinar-banner'

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
  showChat?: boolean
  startedAt?: string
  createdAt: string
  user?: WebinarUser // Owner of the room
  bannerSettings?: {
    show: boolean
    text: string
    button: string
    buttonUrl: string
  }
}


export default function WebinarRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Unwrap params Promise
  const { id: roomId } = use(params)

  const [webinar, setWebinar] = useState<WebinarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [userName, setUserName] = useState('Гость')
  const [userPhone, setUserPhone] = useState('')
  const [viewerCount, setViewerCount] = useState(0)
  const [duration, setDuration] = useState('00:00:00')
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [webinarSettings, setWebinarSettings] = useState({
    showChat: true,
    isMuted: false,
    bannerSettings: {
      show: false,
      text: '',
      button: '',
      buttonUrl: '',
    }
  })

  // Chat WebSocket hook
  const {
    messages,
    events,
    isConnected,
    sendMessage,
    sendEvent,
    loadMessages,
    error: chatError,
  } = useChatWebSocket({
    roomId,
    userIdentifier: userPhone,
    userName,
    autoConnect: !!userPhone && !!userName,
  })

  // Load chat history immediately when user data is available
  useEffect(() => {
    if (userPhone && userName) {
      setLoadingHistory(true)
      loadMessages()
        .then(() => {
          console.log('Chat history loaded successfully')
        })
        .catch((error) => {
          console.error('Failed to load chat history:', error)
        })
        .finally(() => {
          setLoadingHistory(false)
        })
    }
  }, [userPhone, userName, loadMessages])

  // Log chat errors to console only (no user-facing errors for connection issues)
  useEffect(() => {
    if (chatError) {
      console.error('Chat error:', chatError)
    }
  }, [chatError])

// Handle webinar events for real-time updates
  useEffect(() => {
    if (events.length > 0) {
      events.forEach((event) => {
        console.log('Received event:', event.type, event.data)

        switch (event.type) {
          case 'event':
            // Handle chat API events
            if (event.data.showChat !== undefined) {
              setWebinarSettings((prev) => ({ ...prev, showChat: event.data.showChat }))
              console.log('Chat visibility updated:', event.data.showChat)
            }
            if (event.data.muted !== undefined) {
              setWebinarSettings((prev) => ({ ...prev, isMuted: event.data.muted }))
              console.log('Audio mute updated:', event.data.muted)
            }
            if (event.data.bannerSettings) {
              setWebinarSettings((prev) => ({
                ...prev,
                bannerSettings: { ...prev.bannerSettings, ...event.data.bannerSettings }
              }))
              console.log('Banner settings updated:', event.data.bannerSettings)
            }
            if (event.data.roomStarted !== undefined) {
              setWebinar((prev) => prev ? { ...prev, roomStarted: event.data.roomStarted } : null)
              console.log('Webinar room status updated:', event.data.roomStarted)
            }
            break

          default:
            // For debugging other events
            toast({
              title: `Получен ивент: ${event.type}`,
              description: JSON.stringify(event.data, null, 2),
              variant: 'default',
            })
        }
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
          setLoading(false)
          setLoadingHistory(false)
          return
        }

        const webinarData = await webinarResponse.json()
        setWebinar(webinarData)

        // Use guest auth for all users
        await handleGuestAuth()
      } catch (error) {
        console.error('Error fetching webinar:', error)
        setLoading(false)
        setLoadingHistory(false)

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
      setLoadingHistory(false)
    }

    fetchWebinarAndValidate()
  }, [roomId, router, toast])

  // Timer for duration
  useEffect(() => {
    if (!webinar?.roomStarted || !webinar?.startedAt) return

    const startTime = new Date(webinar.startedAt).getTime()
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

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, events])

  // Auto-scroll to bottom when history is loaded
  useEffect(() => {
    if (!loadingHistory) {
      scrollToBottom()
    }
  }, [loadingHistory])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !webinarSettings.showChat || !isConnected) return

    try {
      // Send message through WebSocket hook
      await sendMessage(messageText)

      // Clear input after successful send
      setMessageText('')

      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100)
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

  
  // Simulate viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => Math.max(1, prev + Math.floor(Math.random() * 3) - 1))
    }, 5000)

    setViewerCount(Math.floor(Math.random() * 50) + 10)

    return () => clearInterval(interval)
  }, [])


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
                <div className='flex items-center gap-2 text-white'>
                  <Clock className='h-4 w-4' />
                  <span className='font-mono'>{duration}</span>
                </div>
              )}

              <Button
                variant='ghost'
                size='sm'
                className='text-white'
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Webinar Banner */}
      <WebinarBanner
        show={webinarSettings.bannerSettings.show}
        text={webinarSettings.bannerSettings.text}
        buttonText={webinarSettings.bannerSettings.button}
        buttonUrl={webinarSettings.bannerSettings.buttonUrl}
      />

      {/* Main Content */}
      <div className='container mx-auto px-4 py-6'>
        {!webinar.roomStarted ? (
          // Webinar not started screen
          <div className='min-h-[calc(100vh-160px)] flex items-center justify-center'>
            <Card className='card-glass max-w-md w-full'>
              <CardContent className='pt-8 pb-6 text-center space-y-6'>
                <div className='space-y-4'>
                  <div className='mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center'>
                    <Clock className='h-8 w-8 text-yellow-400' />
                  </div>
                  <h2 className='text-2xl font-bold text-white'>Вебинар еще не начался</h2>
                  <p className='text-gray-300 leading-relaxed'>
                    Этот вебинар пока не запущен организатором. Пожалуйста, подождите немного или вернитесь позже.
                  </p>
                  <div className='space-y-2'>
                    <p className='text-sm text-gray-400'>
                      {webinar.scheduledDate ? (
                        <>Запланировано на: {new Date(webinar.scheduledDate).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</>
                      ) : (
                        <>Время начала будет объявлено позже</>
                      )}
                    </p>
                  </div>
                </div>
                <div className='space-y-3 pt-4'>
                  <Button onClick={() => router.push('/rooms')} className='gradient-primary w-full'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Вернуться к списку вебинаров
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => window.location.reload()}
                    className='w-full border-white/20 text-white hover:bg-white/10'
                  >
                    Обновить страницу
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Active webinar content
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]'>
          {/* Chat Section - LEFT SIDE */}
          {webinarSettings.showChat && (
            <Card className='card-glass lg:col-span-1 lg:order-1 flex flex-col'>
              <div className='p-4 border-b border-white/10'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-semibold text-white flex items-center gap-2'>
                    <MessageSquare className='h-5 w-5 text-isra-cyan' />
                    Чат
                  </h2>
                  <div className='flex items-center gap-2'>
                    {isConnected ? (
                      <div className='text-white'>
                        <Wifi className='h-4 w-4' />
                      </div>
                    ) : (
                      <div className='text-red-400'>
                        <WifiOff className='h-4 w-4' />
                      </div>
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

                {loadingHistory ? (
                  <div className='text-center text-gray-400 py-8'>
                    <Loader2 className='h-12 w-12 mx-auto mb-3 animate-spin opacity-50' />
                    <p>Загрузка истории сообщений...</p>
                  </div>
                ) : messages.length === 0 && events.length === 0 ? (
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

              {/* Invisible element for auto-scrolling */}
              <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className='p-4 border-t border-white/10'>
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
            className={`card-glass flex flex-col lg:order-2 ${webinarSettings.showChat ? 'lg:col-span-2' : 'lg:col-span-3'}`}
          >
            <CardContent className='p-0 flex-1 relative'>
              <div className='w-full h-full bg-black rounded-lg overflow-hidden'>
                <VidstackPlayer
                  src={webinar.videoUrl || 'https://www.youtube.com/watch?v=6fty5yB7bFo'}
                  title={webinar.name}
                  autoPlay={true}
                  muted={true}
                  controls={true}
                  aspectRatio="16/9"
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
        )}
      </div>

      {/* Webinar Settings Modal */}
      <WebinarSettingsModal
        webinar={webinar}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSettingsUpdate={(updatedWebinar) => {
          setWebinar(prev => prev ? { ...prev, ...updatedWebinar } : null);
          // Update local settings state if needed
          if (updatedWebinar.showChat !== undefined) {
            setWebinarSettings(prev => ({ ...prev, showChat: updatedWebinar.showChat! }));
          }
        }}
      />
    </div>
  )
}
