import { BaseEntity, ListParams } from '@/types/common'

export interface ApiWebinar {
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

export interface ReportData extends BaseEntity {
  id: string
  title: string
  type: 'webinar' | 'user'
  date: string
  status: 'active' | 'completed' | 'scheduled' | 'cancelled'
  participants: number
  duration?: number
  speaker?: string
  description?: string
  scheduledDate?: string
  startedAt?: string | null
  stoppedAt?: string | null
  createdAt: string
  updatedAt: string
}

// ===== CONVERSION & ANALYTICS DATA =====

export interface ConversionStats {
  // Основные конверсии
  buttonClicks: number
  buttonClicksPercent: number
  bannerClicks: number
  bannerClicksPercent: number
  orderPageVisits: number
  orderPagePercent: number
  
  // Дополнительные метрики
  registrations: number
  registrationsPercent: number
  purchases: number
  purchasesPercent: number
  totalRevenue: number
  
  // UTM статистика
  utmSources: UtmSource[]
}

export interface UtmSource {
  source: string
  medium: string
  campaign: string
  visitors: number
  conversions: number
  conversionRate: number
}

// ===== CHART DATA (Retention/Engagement) =====

export interface ViewerChartDataPoint {
  time: string         // Время в формате "HH:mm" (относительно начала вебинара)
  absoluteTime: string // Абсолютное время "19:45"
  timestamp: number    // Unix timestamp
  
  // Основные данные удержания
  onlineCount: number    // Сколько людей онлайн в этот момент
  joinedCount: number    // Сколько зашло в этот интервал
  leftCount: number      // Сколько вышло в этот интервал
  
  // Накопительные данные  
  totalJoined: number    // Всего зашло к этому моменту
  totalLeft: number      // Всего вышло к этому моменту
  peakOnline: number     // Пиковое значение онлайн до этого момента
  
  // Процент удержания
  retentionPercent: number  // % от пикового значения
}

export interface ChartFilter {
  device: 'all' | 'desktop' | 'mobile'
  utmFilter: string[]
  granularity: 'optimal' | '1min' | '2min' | '5min'
}

// Аналитика удержания
export interface RetentionAnalytics {
  // Критические точки
  dropOffPoints: DropOffPoint[]   // Где чаще всего уходят
  returnPoints: ReturnPoint[]      // Где чаще возвращаются
  
  // Общая статистика
  averageWatchTime: number         // Среднее время просмотра в секундах
  medianWatchTime: number          // Медианное время
  retentionAt25Percent: number     // % зрителей на 25% вебинара
  retentionAt50Percent: number     // % на 50%
  retentionAt75Percent: number     // % на 75%
  retentionAtEnd: number           // % досмотревших до конца
  
  // Паттерны поведения
  commonExitTimes: string[]        // Частые времена выхода
  commonReturnTimes: string[]      // Частые времена возврата
}

export interface DropOffPoint {
  time: string           // Время (относительное)
  absoluteTime: string   // Абсолютное время
  leftCount: number      // Сколько ушло
  percentOfTotal: number // % от общего числа зрителей
  possibleReason?: string // Возможная причина (заглушка для будущего)
  videoMomentPreview?: string // URL превью момента видео (заглушка)
}

export interface ReturnPoint {
  time: string
  absoluteTime: string
  returnedCount: number
  percentOfTotal: number
}

// ===== UNIQUE VIEWERS DATA =====

export interface UniqueViewer {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  country?: string
  device: 'desktop' | 'mobile' | 'tablet'
  browser: string
  browserVersion?: string
  os: string
  deviceModel?: string  // iPhone, Samsung Galaxy и т.д.
  ip: string
  
  // Время на вебинаре (как в bizon365: "На вебинаре с 19:00 до 19:41")
  webinarJoinTime: string    // Первый вход "19:00"
  webinarLeaveTime: string   // Последний выход "19:41"
  wasStreamStarted: boolean  // Трансляция запустилась для него
  
  // Аналитика поведения
  firstVisit: string     // ISO timestamp первого входа
  lastVisit: string      // ISO timestamp последнего выхода
  totalSessions: number  // Количество сессий (сколько раз заходил)
  totalWatchTime: number // Общее время просмотра в секундах
  averageSessionTime: number
  
  // Интервалы присутствия (ключевая фича!)
  presenceIntervals: PresenceInterval[]
  
  // Действия
  clickedButton: boolean
  clickedBanner: boolean
  visitedOrderPage: boolean
  sentMessages: number
  
  // UTM данные
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface PresenceInterval {
  // Относительное время от начала вебинара
  startRelative: string   // "+00:00:04" - 4 секунды от начала
  endRelative: string     // "+01:05:04" - 1 час 5 минут 4 секунды
  
  // Абсолютное время
  startAbsolute: string   // "19:00:04"
  endAbsolute: string     // "20:05:04"
  
  duration: number        // Длительность в секундах
  durationFormatted: string // "1ч 5м" или "41м 30с"
  
  // Для будущего: что происходило в этот момент на видео
  videoMomentStart?: string  // URL или timestamp момента видео
  videoMomentEnd?: string
}

// ===== DEVICE & GEO STATS =====

export interface DeviceStats {
  desktop: number
  mobile: number
  tablet: number
  desktopPercent: number
  mobilePercent: number
  tabletPercent: number
}

export interface GeoStats {
  countries: GeoLocation[]
  cities: GeoLocation[]
}

export interface GeoLocation {
  name: string
  code?: string
  visitors: number
  percent: number
}

// ===== ENGAGEMENT METRICS =====

export interface EngagementMetrics {
  // Время просмотра
  averageWatchTime: number       // Среднее время в секундах
  medianWatchTime: number        // Медианное время
  totalWatchTime: number         // Общее время всех зрителей
  
  // Вовлеченность
  engagementRate: number         // % активных зрителей
  retentionRate: number          // % досмотревших до конца
  dropoffRate: number            // % ушедших раньше
  
  // Чат активность
  chatParticipationRate: number  // % написавших в чат
  messagesPerViewer: number      // Среднее сообщений на зрителя
  
  // Пиковые показатели
  peakViewers: number            // Максимум зрителей
  peakTime: string               // Время пика
  
  // Качество
  averageConnectionQuality: number  // % качества связи
  bufferingEvents: number           // Количество буферизаций
}

export interface ReportStats {
  totalWebinars: number
  activeWebinars: number
  scheduledWebinars: number
  totalParticipants: number
  activeUsers: number
  averageParticipation: number
  averageDuration: number
}

export interface ReportsParams extends ListParams {
  dataType?: 'webinars' | 'users' | 'both'
  status?: string
  dateFrom?: string
  dateTo?: string
  participantMin?: number
  participantMax?: number
  search?: string
}

export interface ReportsResponse {
  data: ReportData[]
  total: number
  page: number
  limit: number
  totalPages: number
  stats: ReportStats
}

export interface ExportOptions {
  includeDetails: boolean
  dateFrom: string
  dateTo: string
  fields: string[]
  dataType: 'webinars' | 'users' | 'both'
}

export interface UserStats {
  id: string
  name: string
  email: string
  role: string
  webinarsCount: number
  totalParticipationTime: number
  lastActive: string
  status: 'active' | 'inactive'
}

export interface WebinarViewer {
  id: string
  name: string
  email: string
  joinedAt: string
  leftAt: string | null
  totalWatchTime: number
  isOnline: boolean
}

export interface WebinarChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: string
  isModerator: boolean
}

export interface WebinarModerator {
  id: string
  name: string
  email: string
  role: string
  joinedAt: string
  permissions: string[]
}

export interface WebinarReport {
  webinar: ReportData
  
  // Зрители
  viewers: {
    total: number
    currentlyOnline: number
    fromPartners: number
    list: WebinarViewer[]
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
  }
  
  // Уникальные зрители
  uniqueViewers: {
    total: number
    list: UniqueViewer[]
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
  }
  
  // Чат
  chat: {
    messages: WebinarChatMessage[]
    totalMessages: number
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
  }
  
  // Модераторы
  moderators: WebinarModerator[]
  
  // Аналитика графика удержания
  chartData: ViewerChartDataPoint[]
  
  // Аналитика удержания (retention)
  retentionAnalytics: RetentionAnalytics
  
  // Конверсии
  conversions: ConversionStats
  
  // Статистика устройств
  deviceStats: DeviceStats
  
  // Гео статистика
  geoStats: GeoStats
  
  // Метрики вовлеченности
  engagement: EngagementMetrics
}

export interface WebinarReportParams {
  id: string
  viewersPage?: number
  viewersLimit?: number
  viewersSearch?: string
  uniqueViewersPage?: number
  uniqueViewersLimit?: number
  uniqueViewersSearch?: string
  chatPage?: number
  chatLimit?: number
  chatSearch?: string
  chartFilter?: ChartFilter
}