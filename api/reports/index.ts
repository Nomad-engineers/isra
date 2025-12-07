import {
  ReportData,
  ReportsParams,
  ReportsResponse,
  ReportStats,
  ApiWebinar,
  UserStats,
  WebinarReport,
  WebinarReportParams,
  WebinarViewer,
  WebinarChatMessage,
  WebinarModerator,
  UniqueViewer,
  ViewerChartDataPoint,
  ConversionStats,
  DeviceStats,
  GeoStats,
  EngagementMetrics,
  RetentionAnalytics
} from './types'

// Mock data for testing UI
const mockWebinars: ApiWebinar[] = [
  {
    id: 1,
    name: "Введение в машинное обучение",
    description: "Базовый курс по основам машинного обучения и нейронных сетей для начинающих",
    speaker: "Доктор Иван Петров",
    type: "live",
    videoUrl: "https://example.com/video1.mp4",
    scheduledDate: "2024-12-01T10:00:00.000Z",
    roomStarted: true,
    startedAt: "2024-12-01T10:02:00.000Z",
    stoppedAt: "2024-12-01T11:30:00.000Z",
    showChat: true,
    showBanner: true,
    showBtn: true,
    isVolumeOn: true,
    bannerUrl: "https://example.com/banner1.jpg",
    btnUrl: "https://example.com/button1",
    logo: "https://example.com/logo1.png",
    createdAt: "2024-11-25T09:00:00.000Z",
    updatedAt: "2024-12-01T11:30:00.000Z",
    user: {
      id: 1,
      firstName: "Иван",
      lastName: "Петров",
      email: "ivan.petrov@example.com",
      role: "speaker"
    }
  },
  {
    id: 2,
    name: "Продвинутая разработка на React",
    description: "Изучаем продвинутые концепции React: Hooks, Context, Performance Optimization",
    speaker: "Мария Сидорова",
    type: "auto",
    videoUrl: "https://example.com/video2.mp4",
    scheduledDate: "2024-12-05T14:00:00.000Z",
    roomStarted: true,
    startedAt: "2024-12-05T14:01:00.000Z",
    stoppedAt: null,
    showChat: true,
    showBanner: false,
    showBtn: true,
    isVolumeOn: true,
    bannerUrl: null,
    btnUrl: "https://example.com/button2",
    logo: "https://example.com/logo2.png",
    createdAt: "2024-11-28T16:00:00.000Z",
    updatedAt: "2024-12-05T14:01:00.000Z",
    user: {
      id: 2,
      firstName: "Мария",
      lastName: "Сидорова",
      email: "maria.sidorova@example.com",
      role: "speaker"
    }
  },
  {
    id: 3,
    name: "Основы финансовой грамотности",
    description: "Как управлять личными финансами, инвестиции и сбережения для начинающих",
    speaker: "Алексей Николаев",
    type: "live",
    videoUrl: "https://example.com/video3.mp4",
    scheduledDate: "2024-12-10T16:00:00.000Z",
    roomStarted: false,
    startedAt: null,
    stoppedAt: null,
    showChat: true,
    showBanner: true,
    showBtn: true,
    isVolumeOn: true,
    bannerUrl: "https://example.com/banner3.jpg",
    btnUrl: "https://example.com/button3",
    logo: "https://example.com/logo3.png",
    createdAt: "2024-12-01T11:00:00.000Z",
    updatedAt: "2024-12-01T11:00:00.000Z",
    user: {
      id: 3,
      firstName: "Алексей",
      lastName: "Николаев",
      email: "alexey.nikolaev@example.com",
      role: "speaker"
    }
  },
  {
    id: 4,
    name: "Digital Marketing в 2024",
    description: "Современные стратегии digital маркетинга: SEO, SMM, контент-маркетинг",
    speaker: "Елена Козлова",
    type: "auto",
    videoUrl: "https://example.com/video4.mp4",
    scheduledDate: "2024-11-28T12:00:00.000Z",
    roomStarted: true,
    startedAt: "2024-11-28T12:00:00.000Z",
    stoppedAt: "2024-11-28T13:15:00.000Z",
    showChat: true,
    showBanner: true,
    showBtn: true,
    isVolumeOn: true,
    bannerUrl: "https://example.com/banner4.jpg",
    btnUrl: "https://example.com/button4",
    logo: "https://example.com/logo4.png",
    createdAt: "2024-11-20T10:00:00.000Z",
    updatedAt: "2024-11-28T13:15:00.000Z",
    user: {
      id: 4,
      firstName: "Елена",
      lastName: "Козлова",
      email: "elena.kozlova@example.com",
      role: "speaker"
    }
  },
  {
    id: 5,
    name: "Python для анализа данных",
    description: "Практический курс по использованию Python, Pandas, NumPy для анализа данных",
    speaker: "Дмитрий Волков",
    type: "live",
    videoUrl: "https://example.com/video5.mp4",
    scheduledDate: "2024-11-25T18:00:00.000Z",
    roomStarted: true,
    startedAt: "2024-11-25T18:05:00.000Z",
    stoppedAt: "2024-11-25T20:00:00.000Z",
    showChat: true,
    showBanner: true,
    showBtn: true,
    isVolumeOn: true,
    bannerUrl: "https://example.com/banner5.jpg",
    btnUrl: "https://example.com/button5",
    logo: "https://example.com/logo5.png",
    createdAt: "2024-11-15T14:00:00.000Z",
    updatedAt: "2024-11-25T20:00:00.000Z",
    user: {
      id: 5,
      firstName: "Дмитрий",
      lastName: "Волков",
      email: "dmitry.volkov@example.com",
      role: "speaker"
    }
  }
]

// Mock viewers data
const mockViewers: WebinarViewer[] = [
  {
    id: "1",
    name: "Александр Иванов",
    email: "alex.ivanov@example.com",
    joinedAt: "2024-12-01T10:02:00.000Z",
    leftAt: "2024-12-01T11:30:00.000Z",
    totalWatchTime: 5280,
    isOnline: false
  },
  {
    id: "2",
    name: "Мария Петрова",
    email: "maria.petrova@example.com",
    joinedAt: "2024-12-01T10:05:00.000Z",
    leftAt: null,
    totalWatchTime: 4800,
    isOnline: true
  },
  {
    id: "3",
    name: "Дмитрий Сидоров",
    email: "dmitry.sidorov@example.com",
    joinedAt: "2024-12-01T10:10:00.000Z",
    leftAt: "2024-12-01T11:15:00.000Z",
    totalWatchTime: 3900,
    isOnline: false
  },
  {
    id: "4",
    name: "Елена Козлова",
    email: "elena.kozlova@example.com",
    joinedAt: "2024-12-01T10:08:00.000Z",
    leftAt: null,
    totalWatchTime: 4200,
    isOnline: true
  }
]

// Mock chat data
const mockChat: WebinarChatMessage[] = [
  {
    id: "1",
    userId: "2",
    userName: "Мария Петрова",
    message: "Отличный вебинар! Очень интересная тема.",
    timestamp: "2024-12-01T10:15:00.000Z",
    isModerator: false
  },
  {
    id: "2",
    userId: "mod1",
    userName: "Модератор",
    message: "Спасибо за ваш вопрос! Сейчас мы разберем этот пример.",
    timestamp: "2024-12-01T10:18:00.000Z",
    isModerator: true
  },
  {
    id: "3",
    userId: "3",
    userName: "Дмитрий Сидоров",
    message: "Можно ли получить презентацию вебинара?",
    timestamp: "2024-12-01T10:25:00.000Z",
    isModerator: false
  },
  {
    id: "4",
    userId: "4",
    userName: "Елена Козлова",
    message: "Подскажите, пожалуйста, где можно найти дополнительные материалы?",
    timestamp: "2024-12-01T10:30:00.000Z",
    isModerator: false
  }
]

// Mock moderators data
const mockModerators: WebinarModerator[] = [
  {
    id: "mod1",
    name: "Иван Модераторов",
    email: "ivan.moderator@example.com",
    role: "moderator",
    joinedAt: "2024-12-01T10:00:00.000Z",
    permissions: ["chat_moderation", "user_management", "content_control"]
  },
  {
    id: "mod2",
    name: "Анна Помощник",
    email: "anna.helper@example.com",
    role: "assistant",
    joinedAt: "2024-12-01T10:01:00.000Z",
    permissions: ["chat_moderation", "technical_support"]
  }
]

export class ReportsApi {
  async getReports(params: ReportsParams = {}): Promise<ReportsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      // Use mock data instead of API call
      const webinars = mockWebinars

      // Transform webinars to report data
      const reportData: ReportData[] = webinars.map(webinar => ({
        id: webinar.id.toString(),
        title: webinar.name,
        type: 'webinar',
        date: webinar.scheduledDate || webinar.createdAt,
        status: webinar.roomStarted && !webinar.stoppedAt
          ? 'active'
          : webinar.stoppedAt
            ? 'completed'
            : new Date(webinar.scheduledDate) > new Date()
              ? 'scheduled'
              : 'cancelled',
        participants: Math.floor(Math.random() * 450) + 50, // Simulated participant count (50-500)
        duration: webinar.startedAt && webinar.stoppedAt
          ? new Date(webinar.stoppedAt).getTime() - new Date(webinar.startedAt).getTime()
          : undefined,
        speaker: webinar.speaker,
        description: webinar.description,
        scheduledDate: webinar.scheduledDate,
        startedAt: webinar.startedAt,
        stoppedAt: webinar.stoppedAt,
        createdAt: webinar.createdAt,
        updatedAt: webinar.updatedAt
      }))

      // Apply filters
      let filteredData = reportData

      if (params.dataType && params.dataType !== 'both') {
        filteredData = filteredData.filter(item =>
          (params.dataType === 'webinars' && item.type === 'webinar') ||
          (params.dataType === 'users' && item.type === 'user')
        )
      }

      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status)
      }

      if (params.dateFrom) {
        filteredData = filteredData.filter(item =>
          new Date(item.date) >= new Date(params.dateFrom!)
        )
      }

      if (params.dateTo) {
        filteredData = filteredData.filter(item =>
          new Date(item.date) <= new Date(params.dateTo!)
        )
      }

      if (params.participantMin) {
        filteredData = filteredData.filter(item =>
          item.participants >= params.participantMin!
        )
      }

      if (params.participantMax) {
        filteredData = filteredData.filter(item =>
          item.participants <= params.participantMax!
        )
      }

      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filteredData = filteredData.filter(item =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.speaker?.toLowerCase().includes(searchLower)
        )
      }

      // Calculate stats
      const stats = this.calculateStats(filteredData)

      // Apply pagination
      const page = params.page || 1
      const limit = params.limit || 10
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedData = filteredData.slice(startIndex, endIndex)

      return {
        data: paginatedData,
        total: filteredData.length,
        page,
        limit,
        totalPages: Math.ceil(filteredData.length / limit),
        stats
      }

    } catch (error) {
      console.error('Reports API error:', error)
      throw error
    }
  }

  async getReportStats(params: ReportsParams = {}): Promise<ReportStats> {
    const response = await this.getReports(params)
    return response.stats
  }

  async exportReports(params: ReportsParams): Promise<ReportData[]> {
    // Get all data without pagination for export
    const response = await this.getReports({ ...params, limit: 10000 })
    return response.data
  }

  async getWebinarReport(params: WebinarReportParams): Promise<WebinarReport> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // Find webinar by ID
      const webinar = mockWebinars.find(w => w.id.toString() === params.id)
      if (!webinar) {
        throw new Error(`Webinar with ID ${params.id} not found`)
      }

      // Transform webinar to ReportData format
      const reportData: ReportData = {
        id: webinar.id.toString(),
        title: webinar.name,
        type: 'webinar',
        date: webinar.scheduledDate || webinar.createdAt,
        status: webinar.roomStarted && !webinar.stoppedAt
          ? 'active'
          : webinar.stoppedAt
            ? 'completed'
            : new Date(webinar.scheduledDate) > new Date()
              ? 'scheduled'
              : 'cancelled',
        participants: 164, // Use realistic number
        duration: webinar.startedAt && webinar.stoppedAt
          ? new Date(webinar.stoppedAt).getTime() - new Date(webinar.startedAt).getTime()
          : 7200000, // 2 hours default
        speaker: webinar.speaker,
        description: webinar.description,
        scheduledDate: webinar.scheduledDate,
        startedAt: webinar.startedAt,
        stoppedAt: webinar.stoppedAt,
        createdAt: webinar.createdAt,
        updatedAt: webinar.updatedAt
      }

      // Filter viewers if search is provided
      let filteredViewers = mockViewers
      if (params.viewersSearch) {
        const search = params.viewersSearch.toLowerCase()
        filteredViewers = mockViewers.filter(viewer =>
          viewer.name.toLowerCase().includes(search) ||
          viewer.email.toLowerCase().includes(search)
        )
      }

      // Apply pagination to viewers
      const viewersPage = params.viewersPage || 1
      const viewersLimit = params.viewersLimit || 50
      const viewersStart = (viewersPage - 1) * viewersLimit
      const paginatedViewers = filteredViewers.slice(viewersStart, viewersStart + viewersLimit)

      // Apply pagination to chat
      const chatPage = params.chatPage || 1
      const chatLimit = params.chatLimit || 50
      const chatStart = (chatPage - 1) * chatLimit
      const paginatedChat = mockChat.slice(chatStart, chatStart + chatLimit)

      const currentlyOnline = mockViewers.filter(v => v.isOnline).length

      // Generate chart data
      const chartData = this.generateChartData()

      // Generate mock engagement metrics
      const engagement: EngagementMetrics = {
        averageWatchTime: 2640,
        medianWatchTime: 2400,
        totalWatchTime: 432960,
        engagementRate: 78.5,
        retentionRate: 72.3,
        dropoffRate: 27.7,
        chatParticipationRate: 45.2,
        messagesPerViewer: 3.4,
        peakViewers: 164,
        peakTime: '19:45',
        averageConnectionQuality: 92,
        bufferingEvents: 12,
      }

      // Generate mock conversion stats
      const conversions: ConversionStats = {
        buttonClicks: 12,
        buttonClicksPercent: 7.3,
        bannerClicks: 24,
        bannerClicksPercent: 14.6,
        orderPageVisits: 8,
        orderPagePercent: 4.9,
        registrations: 45,
        registrationsPercent: 27.4,
        purchases: 6,
        purchasesPercent: 3.7,
        totalRevenue: 89400,
        utmSources: [
          { source: 'telegram', medium: 'social', campaign: 'webinar_dec', visitors: 85, conversions: 12, conversionRate: 14.1 },
          { source: 'instagram', medium: 'social', campaign: 'stories', visitors: 42, conversions: 5, conversionRate: 11.9 },
          { source: 'direct', medium: 'none', campaign: 'none', visitors: 37, conversions: 3, conversionRate: 8.1 },
        ]
      }

      // Generate device stats
      const deviceStats: DeviceStats = {
        desktop: 67,
        mobile: 89,
        tablet: 8,
        desktopPercent: 40.9,
        mobilePercent: 54.3,
        tabletPercent: 4.8,
      }

      // Generate geo stats
      const geoStats: GeoStats = {
        countries: [
          { name: 'Казахстан', code: 'KZ', visitors: 142, percent: 86.6 },
          { name: 'Россия', code: 'RU', visitors: 15, percent: 9.1 },
          { name: 'Узбекистан', code: 'UZ', visitors: 7, percent: 4.3 },
        ],
        cities: [
          { name: 'Алматы', visitors: 45, percent: 27.4 },
          { name: 'Астана', visitors: 38, percent: 23.2 },
          { name: 'Қызылорда', visitors: 28, percent: 17.1 },
          { name: 'Шымкент', visitors: 19, percent: 11.6 },
        ],
      }

      // Generate retention analytics
      const retentionAnalytics = this.generateRetentionAnalytics()

      return {
        webinar: reportData,
        viewers: {
          total: 164,
          currentlyOnline,
          fromPartners: 0,
          list: paginatedViewers,
          pagination: {
            page: viewersPage,
            limit: viewersLimit,
            totalPages: Math.ceil(164 / viewersLimit)
          }
        },
        uniqueViewers: {
          total: 164,
          list: [],
          pagination: {
            page: 1,
            limit: 50,
            totalPages: 4
          }
        },
        chat: {
          messages: paginatedChat,
          totalMessages: 847,
          pagination: {
            page: chatPage,
            limit: chatLimit,
            totalPages: Math.ceil(847 / chatLimit)
          }
        },
        moderators: mockModerators,
        chartData,
        retentionAnalytics,
        conversions,
        deviceStats,
        geoStats,
        engagement
      }

    } catch (error) {
      console.error('Webinar report API error:', error)
      throw error
    }
  }

  private generateChartData(): ViewerChartDataPoint[] {
    const data: ViewerChartDataPoint[] = []
    const webinarDurationMinutes = 120 // 2 часа
    
    let onlineCount = 0
    let totalJoined = 0
    let totalLeft = 0
    let peakOnline = 0
    
    for (let minute = 0; minute <= webinarDurationMinutes; minute += 1) {
      const hours = Math.floor(minute / 60)
      const mins = minute % 60
      const relativeTime = `+${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      const absoluteHour = 19 + hours
      const absoluteTime = `${String(absoluteHour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
      
      // Реалистичная симуляция входов/выходов
      let joinedCount = 0
      let leftCount = 0
      
      // Начало - много входов
      if (minute < 5) {
        joinedCount = Math.floor(20 + Math.random() * 30)
        leftCount = Math.floor(Math.random() * 3)
      }
      // Первые 15 минут - еще заходят
      else if (minute < 15) {
        joinedCount = Math.floor(5 + Math.random() * 15)
        leftCount = Math.floor(2 + Math.random() * 5)
      }
      // 15-30 минут - стабилизация
      else if (minute < 30) {
        joinedCount = Math.floor(Math.random() * 5)
        leftCount = Math.floor(3 + Math.random() * 7)
      }
      // 30-60 минут - люди начинают уходить
      else if (minute < 60) {
        joinedCount = Math.floor(Math.random() * 3)
        leftCount = Math.floor(2 + Math.random() * 5)
        // Резкий уход на 45 минуте
        if (minute === 45) leftCount = Math.floor(10 + Math.random() * 15)
      }
      // 60-90 минут
      else if (minute < 90) {
        joinedCount = Math.floor(Math.random() * 2)
        leftCount = Math.floor(1 + Math.random() * 4)
      }
      // Последние 30 минут
      else {
        joinedCount = Math.floor(Math.random() * 2)
        leftCount = Math.floor(3 + Math.random() * 6)
        if (minute > 110) leftCount = Math.floor(5 + Math.random() * 10)
      }
      
      leftCount = Math.min(leftCount, onlineCount)
      
      totalJoined += joinedCount
      totalLeft += leftCount
      onlineCount = onlineCount + joinedCount - leftCount
      onlineCount = Math.max(0, onlineCount)
      peakOnline = Math.max(peakOnline, onlineCount)
      
      const retentionPercent = peakOnline > 0 ? Math.round((onlineCount / peakOnline) * 100) : 0
      
      data.push({
        time: relativeTime,
        absoluteTime,
        timestamp: Date.now() + minute * 60000,
        onlineCount,
        joinedCount,
        leftCount,
        totalJoined,
        totalLeft,
        peakOnline,
        retentionPercent,
      })
    }
    
    return data
  }
  
  private generateRetentionAnalytics(): RetentionAnalytics {
    return {
      dropOffPoints: [
        { time: '+00:45:00', absoluteTime: '19:45', leftCount: 18, percentOfTotal: 11, possibleReason: 'Середина вебинара - потеря интереса' },
        { time: '+01:50:00', absoluteTime: '20:50', leftCount: 12, percentOfTotal: 7.3, possibleReason: 'Перед окончанием' },
        { time: '+00:15:00', absoluteTime: '19:15', leftCount: 8, percentOfTotal: 4.9 },
      ],
      returnPoints: [
        { time: '+00:30:00', absoluteTime: '19:30', returnedCount: 5, percentOfTotal: 3.1 },
        { time: '+01:00:00', absoluteTime: '20:00', returnedCount: 3, percentOfTotal: 1.8 },
      ],
      averageWatchTime: 2640,
      medianWatchTime: 2400,
      retentionAt25Percent: 92,
      retentionAt50Percent: 78,
      retentionAt75Percent: 61,
      retentionAtEnd: 45,
      commonExitTimes: ['19:45', '20:50', '19:15'],
      commonReturnTimes: ['19:30', '20:00'],
    }
  }

  private calculateStats(data: ReportData[]): ReportStats {
    const totalWebinars = data.length
    const activeWebinars = data.filter(item => item.status === 'active').length
    const scheduledWebinars = data.filter(item => item.status === 'scheduled').length
    const totalParticipants = data.reduce((sum, item) => sum + item.participants, 0)
    const webinarsWithDuration = data.filter(item => item.duration)
    const averageDuration = webinarsWithDuration.length > 0
      ? webinarsWithDuration.reduce((sum, item) => sum + (item.duration || 0), 0) / webinarsWithDuration.length
      : 0

    // Simulated user stats since we don't have user API endpoint
    const activeUsers = Math.floor(totalWebinars * 1.5) // Simulated active users
    const averageParticipation = totalWebinars > 0 ? Math.floor(totalParticipants / totalWebinars) : 0

    return {
      totalWebinars,
      activeWebinars,
      scheduledWebinars,
      totalParticipants,
      activeUsers,
      averageParticipation,
      averageDuration
    }
  }
}

export const reportsApi = new ReportsApi()