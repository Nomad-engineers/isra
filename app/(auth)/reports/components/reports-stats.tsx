import { StatsCard } from '@/components/common/stats-card'
import { ReportStats } from '@/api/reports/types'
import { formatDuration } from '@/lib/report-calculations'
import {
  Video,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react'

interface ReportsStatsProps {
  stats: ReportStats | null
  loading?: boolean
}

export function ReportsStats({ stats, loading = false }: ReportsStatsProps) {
  if (loading && !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted animate-pulse rounded-lg h-24"
          />
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Нет данных для отображения
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Webinar Stats */}
      <StatsCard
        title="Всего вебинаров"
        value={stats.totalWebinars.toLocaleString()}
        description="За все время"
        icon={Video}
        trend={stats.totalWebinars > 0 ? { value: 8, isUp: true } : undefined}
      />

      <StatsCard
        title="Активных"
        value={stats.activeWebinars.toLocaleString()}
        description="Сейчас идут"
        icon={Activity}
        trend={stats.activeWebinars > 0 ? { value: 5, isUp: true } : undefined}
      />

      <StatsCard
        title="Запланированных"
        value={stats.scheduledWebinars.toLocaleString()}
        description="Предстоящие"
        icon={Calendar}
      />

      {/* User Stats */}
      <StatsCard
        title="Всего участников"
        value={stats.totalParticipants.toLocaleString()}
        description="Общее количество"
        icon={Users}
      />

      <StatsCard
        title="Активные пользователи"
        value={stats.activeUsers.toLocaleString()}
        description="Уникальные участники"
        icon={TrendingUp}
        trend={{ value: 12, isUp: true }}
      />

      <StatsCard
        title="Средняя длительность"
        value={formatDuration(stats.averageDuration)}
        description="На вебинар"
        icon={Clock}
      />
    </div>
  )
}