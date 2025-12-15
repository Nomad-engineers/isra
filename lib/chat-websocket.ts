import { Centrifuge, Subscription as CentrifugeSubscription } from 'centrifuge'

// WebSocket сообщение от сервера
export interface WebSocketMessage {
  type: 'newMessage' | string
  data: {
    id: string
    webinarId: string
    participantId: string
    username: string
    message: string
    createdAt: string
  }
}

// Токены для подключения к чату
export interface ChatTokens {
  connectionToken: string
  subscriptionToken: string
}

// Статус соединения
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Конфигурация WebSocket менеджера
export interface ChatWebSocketConfig {
  roomId: string
  userIdentifier: string
  userName: string
  centrifugoUrl?: string
  chatApiUrl?: string
  onMessage?: (message: WebSocketMessage['data']) => void
  onStatusChange?: (status: ConnectionStatus) => void
  onEvent?: (event: SendEventRequest) => void
}

// Запрос на отправку ивента
export interface SendEventRequest {
  type: string
  data: Record<string, unknown>
}

// Ответ от сервера при отправке ивента
export interface SendEventResponse {
  type: string
  data: Record<string, unknown>
}

// События WebSocket
export interface ChatWebSocketEvents {
  message: (message: WebSocketMessage['data']) => void
  statusChange: (status: ConnectionStatus) => void
  error: (error: Error) => void
  event: (event: SendEventRequest) => void
}

export class ChatWebSocketManager {
  private centrifuge: Centrifuge | null = null
  private subscription: CentrifugeSubscription | null = null
  private config: ChatWebSocketConfig
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isDestroyed = false

  constructor(config: ChatWebSocketConfig) {
    this.config = {
      centrifugoUrl: process.env.NEXT_PUBLIC_CENTRIFUGO_WS_URL || 'ws://144.76.109.45:8001/connection/websocket',
      chatApiUrl: process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://144.76.109.45:8089',
      ...config,
    }
  }

  // Получение токенов для подключения
  private async getTokens(): Promise<ChatTokens> {
    const { chatApiUrl, roomId, userIdentifier } = this.config

    // Send phone number directly as email field
    const response = await fetch(`${chatApiUrl}/webinars/${roomId}/token?email=${encodeURIComponent(userIdentifier)}`)

    if (!response.ok) {
      throw new Error(`Failed to get chat tokens: ${response.status}`)
    }

    return response.json()
  }

  // Уведомление о смене статуса
  private notifyStatusChange(status: ConnectionStatus): void {
    if (this.config.onStatusChange) {
      this.config.onStatusChange(status)
    }
  }

  // Уведомление об ошибке (silent in production)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private notifyError(_error: Error): void {
    // Errors are handled by status change notifications
  }

  // Подключение к WebSocket
  async connect(): Promise<void> {
    if (this.isDestroyed) return
    if (this.centrifuge) return // Уже подключены

    try {
      this.notifyStatusChange('connecting')

      // Получаем токены
      const tokens = await this.getTokens()

      // Инициализируем Centrifuge клиент
      this.centrifuge = new Centrifuge(this.config.centrifugoUrl!, {
        token: tokens.connectionToken,
      })

      // Обработчики событий Centrifuge
      this.centrifuge.on('connecting', () => {
        this.notifyStatusChange('connecting')
      })

      this.centrifuge.on('connected', () => {
        this.notifyStatusChange('connected')
        this.reconnectAttempts = 0 // Сбрасываем счетчик попыток
      })

      this.centrifuge.on('disconnected', () => {
        this.notifyStatusChange('disconnected')
        this.attemptReconnect()
      })

      this.centrifuge.on('error', () => {
        this.notifyError(new Error('Centrifuge connection error'))
        this.notifyStatusChange('error')
      })

      // Создаем подписку на канал чата
      const channel = `webinar:${this.config.roomId}:chat`
      this.subscription = this.centrifuge.newSubscription(channel, {
        token: tokens.subscriptionToken,
      })

      // Обработчики событий подписки
      this.subscription.on('publication', (ctx) => {
        this.handleMessage(ctx.data)
      })

      this.subscription.on('subscribed', () => {
        // Successfully subscribed to chat channel
      })

      this.subscription.on('error', () => {
        this.notifyError(new Error('Subscription error'))
        this.notifyStatusChange('error')
      })

      // Подписываемся и подключаемся
      this.subscription.subscribe()
      this.centrifuge.connect()

    } catch (error) {
      this.notifyError(error instanceof Error ? error : new Error('Connection failed'))
      this.notifyStatusChange('error')
      this.attemptReconnect()
    }
  }

  // Обработка входящего сообщения
  private handleMessage(data: unknown): void {
    try {
      // Type guard to check if data has the expected structure
      if (
        typeof data === 'object' &&
        data !== null &&
        'type' in data &&
        'data' in data &&
        typeof data.type === 'string' &&
        typeof data.data === 'object' &&
        data.data !== null
      ) {
        // Проверяем, что это сообщение типа newMessage
        if (data.type === 'newMessage') {
          const messageData = data.data as WebSocketMessage['data']
          if (this.config.onMessage) {
            this.config.onMessage(messageData)
          }
        }
        // Обрабатываем кастомные ивенты
        else if (this.config.onEvent) {
          this.config.onEvent(data as SendEventRequest)
        }
      }
    } catch (error) {
      this.notifyError(error instanceof Error ? error : new Error('Message handling error'))
    }
  }

  // Попытка переподключения
  private attemptReconnect(): void {
    if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Экспоненциальный бэк-офф

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.disconnect()
        this.connect()
      }
    }, delay)
  }

  // Отключение
  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }

    if (this.centrifuge) {
      this.centrifuge.disconnect()
      this.centrifuge = null
    }

    this.notifyStatusChange('disconnected')
  }

  // Проверка статуса соединения
  isConnected(): boolean {
    return this.centrifuge !== null && !!this.config.userIdentifier
  }

  // Получение текущего статуса
  getStatus(): ConnectionStatus {
    if (this.isDestroyed) return 'disconnected'
    if (!this.centrifuge) return 'disconnected'

    // Centrifuge не предоставляет прямой метод получения статуса,
    // поэтому возвращаем статус на основе внутренних состояний
    return this.isConnected() ? 'connected' : 'disconnected'
  }

  // Отправка сообщения в чат
  async sendMessage(message: string): Promise<{ success: boolean; id?: string; message?: string }> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty')
    }

    const { chatApiUrl, roomId, userIdentifier, userName } = this.config
    const token = localStorage.getItem('payload-token')

    // Подготовка заголовков
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Добавление заголовка авторизации если пользователь авторизован в системе
    if (token) {
      headers['Authorization'] = `JWT ${token}`
    }

    // Send phone number directly as email field
    const response = await fetch(`${chatApiUrl}/chat/${roomId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: userIdentifier,
        username: userName,
        message: message.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`)
    }

    return response.json()
  }

  // Отправка кастомного ивента
  async sendEvent(event: SendEventRequest): Promise<SendEventResponse> {
    const { chatApiUrl, roomId } = this.config
    const token = localStorage.getItem('payload-token')

    // Подготовка заголовков
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Добавление заголовка авторизации если пользователь авторизован в системе
    if (token) {
      headers['Authorization'] = `JWT ${token}`
    }

    const response = await fetch(`${chatApiUrl}/webinars/${roomId}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error(`Failed to send event: ${response.status}`)
    }

    return response.json()
  }

  // Получение истории сообщений
  async getChatHistory(): Promise<WebSocketMessage['data'][]> {
    const { chatApiUrl, roomId } = this.config
    const token = localStorage.getItem('payload-token')

    // Подготовка заголовков
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Добавление заголовка авторизации если пользователь авторизован в системе
    if (token) {
      headers['Authorization'] = `JWT ${token}`
    }

    const response = await fetch(`${chatApiUrl}/chat/${roomId}/messages`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to load chat history: ${response.status}`)
    }

    const messages = await response.json()

    // Возвращаем сообщения в формате, совместимом с WebSocket сообщениями
    return messages.map((msg: { id: string; username: string; message: string; createdAt: string; updatedAt?: string }) => ({
      id: msg.id,
      webinarId: this.config.roomId,
      participantId: this.config.userIdentifier,
      username: msg.username,
      message: msg.message,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt || msg.createdAt,
    }))
  }

  // Обновление конфигурации
  updateConfig(newConfig: Partial<ChatWebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Уничтожение менеджера
  destroy(): void {
    this.isDestroyed = true
    this.disconnect()
    this.config.onStatusChange = undefined
    this.config.onMessage = undefined
  }
}