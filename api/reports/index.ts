import {
  ReportData,
  ReportsParams,
  ReportsResponse,
  ReportStats,
  ApiWebinar,
  UserStats
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