import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatWebSocketManager, ChatWebSocketConfig, ConnectionStatus, WebSocketMessage, SendEventRequest, SendEventResponse } from '@/lib/chat-websocket'

export interface UseChatWebSocketOptions {
  roomId: string
  userIdentifier: string
  userName: string
  autoConnect?: boolean
  reconnectOnReconnect?: boolean
}

export interface UseChatWebSocketReturn {
  messages: WebSocketMessage['data'][]
  events: SendEventRequest[]
  connectionStatus: ConnectionStatus
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  sendMessage: (message: string) => Promise<void>
  sendEvent: (event: SendEventRequest) => Promise<SendEventResponse>
  clearMessages: () => void
  clearEvents: () => void
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
  const [events, setEvents] = useState<SendEventRequest[]>([])
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
      onEvent: (event) => {
        setEvents((prev) => [...prev, event])
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
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized')
    }

    try {
      await managerRef.current.sendMessage(message)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message')
      setError(error)
      throw error
    }
  }, [])

  // Отправка ивента
  const sendEvent = useCallback(async (event: SendEventRequest): Promise<SendEventResponse> => {
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized')
    }

    try {
      return await managerRef.current.sendEvent(event)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send event')
      setError(error)
      throw error
    }
  }, [])

  // Очистка сообщений
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // Очистка ивентов
  const clearEvents = useCallback(() => {
    setEvents([])
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
    events,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    connect,
    disconnect,
    sendMessage,
    sendEvent,
    clearMessages,
    clearEvents,
    error,
  }
}