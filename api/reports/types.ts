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
  viewers: {
    total: number
    currentlyOnline: number
    list: WebinarViewer[]
  }
  chat: WebinarChatMessage[]
  moderators: WebinarModerator[]
}

export interface WebinarReportParams {
  id: string
  viewersPage?: number
  viewersLimit?: number
  viewersSearch?: string
  chatPage?: number
  chatLimit?: number
}