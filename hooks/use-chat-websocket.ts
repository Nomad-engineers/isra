import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatWebSocketManager, ChatWebSocketConfig, ConnectionStatus, WebSocketMessage } from '@/lib/chat-websocket'

export interface UseChatWebSocketOptions {
  roomId: string
  userIdentifier: string
  userName: string
  autoConnect?: boolean
  reconnectOnReconnect?: boolean
}

export interface UseChatWebSocketReturn {
  messages: WebSocketMessage['data'][]
  connectionStatus: ConnectionStatus
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
  error: Error | null
}

export function useChatWebSocket({
  roomId,
  userIdentifier,
  userName,
  autoConnect = true,
  reconnectOnReconnect = true,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const [messages, setMessages] = useState<WebSocketMessage['data'][]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<Error | null>(null)

  const managerRef = useRef<ChatWebSocketManager | null>(null)
  const prevConfigRef = useRef<{ roomId: string; userIdentifier: string; userName: string }>({
    roomId: '',
    userIdentifier: '',
    userName: '',
  })

  // Инициализация менеджера
  const initManager = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.destroy()
    }

    managerRef.current = new ChatWebSocketManager({
      roomId,
      userIdentifier,
      userName,
      onMessage: (message) => {
        setMessages((prev) => [...prev, message])
      },
      onStatusChange: (status) => {
        setConnectionStatus(status)
        if (status === 'error') {
          setError(new Error('WebSocket connection error'))
        } else {
          setError(null)
        }
      },
    })
  }, [roomId, userIdentifier, userName])

  // Подключение
  const connect = useCallback(async () => {
    if (!managerRef.current) {
      initManager()
    }

    if (managerRef.current) {
      await managerRef.current.connect()
    }
  }, [initManager])

  // Отключение
  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect()
    }
  }, [])

  // Отправка сообщения
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://144.76.109.45:8089'
    const token = localStorage.getItem('payload-token')

    // Подготовка заголовков
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Добавление заголовка авторизации если пользователь авторизован в системе
    if (token) {
      headers['Authorization'] = `JWT ${token}`
    }

    // Определяем email для отправки
    let emailToSend: string
    if (userIdentifier.includes('@')) {
      emailToSend = userIdentifier
    } else {
      emailToSend = `${userIdentifier}@chat.local`
    }

    try {
      const response = await fetch(`${chatApiUrl}/chat/${roomId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: emailToSend,
          username: userName,
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      return response.json()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message')
      setError(error)
      throw error
    }
  }, [roomId, userIdentifier, userName])

  // Очистка сообщений
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Проверка, изменилась ли конфигурация
  const hasConfigChanged = useCallback(() => {
    return (
      prevConfigRef.current.roomId !== roomId ||
      prevConfigRef.current.userIdentifier !== userIdentifier ||
      prevConfigRef.current.userName !== userName
    )
  }, [roomId, userIdentifier, userName])

  // Эффект для инициализации и управления соединением
  useEffect(() => {
    // Если конфигурация изменилась, пересоздаем менеджер
    if (hasConfigChanged()) {
      // Сохраняем текущую конфигурацию
      prevConfigRef.current = { roomId, userIdentifier, userName }

      // Уничтожаем старый менеджер
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }

      // Создаем новый менеджер если есть все необходимые данные
      if (roomId && userIdentifier && userName && autoConnect) {
        initManager()
        connect()
      }
    }
  }, [roomId, userIdentifier, userName, hasConfigChanged, initManager, connect, autoConnect])

  // Эффект для автоматического подключения
  useEffect(() => {
    if (autoConnect && roomId && userIdentifier && userName && !managerRef.current) {
      initManager()
      connect()
    }
  }, [autoConnect, roomId, userIdentifier, userName, initManager, connect])

  // Эффект для очистки при размонтировании
  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
  }, [])

  // Обработка потери соединения и восстановления
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (reconnectOnReconnect && document.visibilityState === 'visible' && connectionStatus === 'disconnected') {
        connect()
      }
    }

    const handleOnline = () => {
      if (reconnectOnReconnect && connectionStatus === 'disconnected') {
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [connectionStatus, reconnectOnReconnect, connect])

  return {
    messages,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    error,
  }
}