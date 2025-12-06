import { ReportData } from '@/api/reports/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, User, Video, Users } from 'lucide-react'

interface WebinarInfoCardProps {
  webinar: ReportData
}

export function WebinarInfoCard({ webinar }: WebinarInfoCardProps) {
  const formatDuration = (duration?: number) => {
    if (!duration) return 'Неизвестно'
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    }
    return `${minutes}м`
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'Неизвестно'
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Информация о вебинаре
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Status */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Статус</div>
            <Badge variant={webinar.status === 'active' ? 'default' : 'secondary'}>
              {webinar.status === 'active' ? 'Активен' :
               webinar.status === 'completed' ? 'Завершен' :
               webinar.status === 'scheduled' ? 'Запланирован' : 'Отменен'}
            </Badge>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              Зрители
            </div>
            <div className="text-2xl font-bold">{webinar.participants}</div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Длительность
            </div>
            <div className="text-lg font-semibold">
              {formatDuration(webinar.duration)}
            </div>
          </div>

          {/* Speaker */}
          {webinar.speaker && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Спикер
              </div>
              <div className="text-sm font-medium">{webinar.speaker}</div>
            </div>
          )}
        </div>

        {/* Description */}
        {webinar.description && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2">Описание</div>
            <p className="text-sm">{webinar.description}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Расписание
          </div>
          <div className="grid gap-2 sm:grid-cols-3 text-xs">
            <div>
              <span className="text-muted-foreground">Запланировано: </span>
              <span className="font-medium">
                {formatDateTime(webinar.scheduledDate)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Начало: </span>
              <span className="font-medium">
                {formatDateTime(webinar.startedAt)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Окончание: </span>
              <span className="font-medium">
                {formatDateTime(webinar.stoppedAt)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}