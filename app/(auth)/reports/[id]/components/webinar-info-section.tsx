import { ReportData } from '@/api/reports/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  Users,
  Eye,
  Monitor,
  UserCheck,
  PlayCircle,
  BarChart3
} from 'lucide-react'
import { getStatusColor, getStatusLabel, formatDuration } from '@/lib/report-calculations'
import { format } from 'date-fns'

interface WebinarInfoSectionProps {
  webinar: ReportData
}

export function WebinarInfoSection({ webinar }: WebinarInfoSectionProps) {
  const stats = [
    {
      icon: Users,
      label: 'Всего участников',
      value: webinar.participants.toLocaleString(),
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: UserCheck,
      label: 'Сейчас онлайн',
      value: '142', // Mock data
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Eye,
      label: 'Пиковых просмотров',
      value: '89', // Mock data
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: Clock,
      label: 'Длительность',
      value: formatDuration(webinar.duration),
      color: 'text-orange-600 bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок вебинара */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{webinar.title}</CardTitle>
              </div>
              {webinar.description && (
                <p className="text-muted-foreground">{webinar.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(webinar.date), 'dd MMMM yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(webinar.date), 'HH:mm')}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(webinar.status)}>
              {getStatusLabel(webinar.status)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Информация о спикере */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Информация о вебинаре
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Спикер</div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {webinar.speaker?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{webinar.speaker || 'Не указан'}</div>
                    <div className="text-sm text-muted-foreground">Основной спикер</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Тип мероприятия</div>
                <Badge variant="outline">
                  {webinar.type === 'webinar' ? 'Вебинар' : 'Пользователь'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">ID вебинара</div>
                <div className="font-mono text-sm bg-muted p-2 rounded">{webinar.id}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Качество связи</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">85%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}