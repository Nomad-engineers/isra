import { ReportData } from '@/api/reports/types'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users, MessageCircle, Shield } from 'lucide-react'

interface WebinarReportHeaderProps {
  webinar: ReportData
  onRefresh: () => void
  loading: boolean
}

export function WebinarReportHeader({ webinar, onRefresh, loading }: WebinarReportHeaderProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Активен', variant: 'default' as const },
      completed: { label: 'Завершен', variant: 'secondary' as const },
      scheduled: { label: 'Запланирован', variant: 'outline' as const },
      cancelled: { label: 'Отменен', variant: 'destructive' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        config.variant === 'default' ? 'bg-green-100 text-green-800' :
        config.variant === 'secondary' ? 'bg-gray-100 text-gray-800' :
        config.variant === 'outline' ? 'bg-blue-100 text-blue-800' :
        'bg-red-100 text-red-800'
      }`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{webinar.title}</h1>
          {getStatusBadge(webinar.status)}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {webinar.speaker && (
            <span>Спикер: <span className="font-medium text-foreground">{webinar.speaker}</span></span>
          )}
          <span>Дата: <span className="font-medium text-foreground">
            {new Date(webinar.date).toLocaleDateString('ru-RU')}
          </span></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>
    </div>
  )
}