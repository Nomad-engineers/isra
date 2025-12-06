import { ReportData, ReportStats } from '@/api/reports/types'

export function calculateReportStats(data: ReportData[]): ReportStats {
  const totalWebinars = data.length
  const activeWebinars = data.filter(item => item.status === 'active').length
  const scheduledWebinars = data.filter(item => item.status === 'scheduled').length
  const totalParticipants = data.reduce((sum, item) => sum + item.participants, 0)
  const webinarsWithDuration = data.filter(item => item.duration)
  const averageDuration = webinarsWithDuration.length > 0
    ? webinarsWithDuration.reduce((sum, item) => sum + (item.duration || 0), 0) / webinarsWithDuration.length
    : 0

  // Calculate simulated user statistics
  const activeUsers = calculateActiveUsers(data)
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

function calculateActiveUsers(data: ReportData[]): number {
  // Simulate active users calculation based on webinars
  const uniqueSpeakers = new Set(data.map(item => item.speaker).filter(Boolean))
  const simulatedUsers = uniqueSpeakers.size + Math.floor(data.length * 0.8)
  return simulatedUsers
}

export function getPeriodStats(data: ReportData[], period: 'today' | 'week' | 'month' | 'year'): {
  count: number
  participants: number
  active: number
} {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(0)
  }

  const periodData = data.filter(item => new Date(item.date) >= startDate)

  return {
    count: periodData.length,
    participants: periodData.reduce((sum, item) => sum + item.participants, 0),
    active: periodData.filter(item => item.status === 'active').length
  }
}

export function formatDuration(milliseconds: number | undefined): string {
  if (!milliseconds) return '0м'

  const minutes = Math.floor(milliseconds / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${remainingMinutes}м`
  }
  return `${minutes}м`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-500 text-white border-green-500',
    completed: 'bg-slate-700 text-white border-slate-700',
    scheduled: 'bg-amber-500 text-white border-amber-500',
    cancelled: 'bg-red-500 text-white border-red-500'
  }
  return colors[status] || 'bg-slate-500 text-white'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Активен',
    completed: 'Завершен',
    scheduled: 'Запланирован',
    cancelled: 'Отменен'
  }
  return labels[status] || status
}