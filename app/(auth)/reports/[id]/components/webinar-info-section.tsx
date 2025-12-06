import { ReportData, EngagementMetrics, ConversionStats } from '@/api/reports/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Clock,
  Users,
  Eye,
  Monitor,
  UserCheck,
  PlayCircle,
  TrendingUp,
  Zap,
  Timer,
  Signal,
  Award,
  Target,
  MessageCircle,
  MousePointer,
  Sparkles,
  Globe,
  Smartphone,
  ArrowUpRight,
} from 'lucide-react'
import { getStatusColor, getStatusLabel, formatDuration } from '@/lib/report-calculations'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ConversionsStats } from './conversions-stats'

interface WebinarInfoSectionProps {
  webinar: ReportData
  engagement?: EngagementMetrics
  conversions?: ConversionStats
  totalViewers?: number
}

// Demo engagement data
const demoEngagement: EngagementMetrics = {
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

export function WebinarInfoSection({
  webinar,
  engagement = demoEngagement,
  conversions,
  totalViewers = 164,
}: WebinarInfoSectionProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}ч ${minutes}м`
    return `${minutes}м`
  }

  const mainStats = [
    {
      icon: Users,
      label: 'Всего заходили',
      value: totalViewers.toLocaleString(),
      subValue: 'зрителей',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
      borderColor: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Пик зрителей',
      value: engagement.peakViewers.toString(),
      subValue: `в ${engagement.peakTime}`,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
      borderColor: 'border-green-100 dark:border-green-900/30',
    },
    {
      icon: Timer,
      label: 'Среднее время',
      value: formatTime(engagement.averageWatchTime),
      subValue: 'просмотра',
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
      borderColor: 'border-violet-100 dark:border-violet-900/30',
    },
    {
      icon: Clock,
      label: 'Длительность',
      value: formatDuration(webinar.duration),
      subValue: 'вебинара',
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
      borderColor: 'border-orange-100 dark:border-orange-900/30',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <Card className="overflow-hidden border shadow-xl bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-violet-950 dark:to-slate-900 dark:border-0">
        <CardContent className="p-0">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
            </div>
            
            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4">
                  {/* Status & Type Badges */}
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(webinar.status)} shadow-lg`}>
                      {getStatusLabel(webinar.status)}
                    </Badge>
                    <Badge variant="outline" className="bg-violet-100 border-violet-200 text-violet-700 dark:bg-white/10 dark:border-white/20 dark:text-white">
                      <PlayCircle className="h-3 w-3 mr-1" />
                      {webinar.type === 'webinar' ? 'Вебинар' : 'Автовебинар'}
                    </Badge>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight max-w-2xl">
                    {webinar.title}
                  </h1>
                  
                  {/* Description */}
                  {webinar.description && (
                    <p className="text-muted-foreground max-w-xl text-lg">
                      {webinar.description}
                    </p>
                  )}
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-foreground/80">
                    <div className="flex items-center gap-2 bg-violet-100 dark:bg-white/10 px-3 py-1.5 rounded-full">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(webinar.date), 'd MMMM yyyy', { locale: ru })}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-violet-100 dark:bg-white/10 px-3 py-1.5 rounded-full">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(webinar.date), 'HH:mm')}</span>
                    </div>
                    {webinar.speaker && (
                      <div className="flex items-center gap-2 bg-violet-100 dark:bg-white/10 px-3 py-1.5 rounded-full">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="bg-violet-500 text-white text-xs">
                            {webinar.speaker.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{webinar.speaker}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Side Stats */}
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <div className="text-5xl font-bold text-violet-700 dark:text-white">{totalViewers}</div>
                    <div className="text-violet-600/70 dark:text-white/60 text-sm">уникальных зрителей</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <Card key={index} className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.subValue}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Retention Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Удержание зрителей
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Досмотрели до конца</span>
                <span className="font-semibold text-green-600">{engagement.retentionRate}%</span>
              </div>
              <Progress value={engagement.retentionRate} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ушли раньше</span>
                <span className="font-semibold text-amber-600">{engagement.dropoffRate}%</span>
              </div>
              <Progress value={engagement.dropoffRate} className="h-2 [&>div]:bg-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Chat Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <MessageCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              Активность в чате
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <div className="text-3xl font-bold text-violet-600">{engagement.chatParticipationRate}%</div>
                <div className="text-xs text-muted-foreground mt-1">писали в чат</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-xl">
                <div className="text-3xl font-bold text-violet-600">{engagement.messagesPerViewer}</div>
                <div className="text-xs text-muted-foreground mt-1">сообщений в среднем</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
              Оценка вебинара
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-violet-100 dark:text-violet-900/30"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="6"
                    strokeDasharray={`${engagement.engagementRate * 2.2} 220`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-violet-600">{engagement.engagementRate}%</span>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg">Отличный результат!</div>
                <p className="text-sm text-muted-foreground">
                  Высокая вовлеченность аудитории
                </p>
                <div className="flex items-center gap-1 mt-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">+12% к среднему</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversions Section */}
      <ConversionsStats stats={conversions} totalViewers={totalViewers} />

      {/* Webinar Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Детали вебинара
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Webinar ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">ID вебинара</label>
              <div className="font-mono text-sm bg-muted p-3 rounded-lg break-all">
                {webinar.id}
              </div>
            </div>
            
            {/* Created At */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Создан</label>
              <div className="text-sm p-3 bg-muted rounded-lg">
                {format(new Date(webinar.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </div>
            </div>
            
            {/* Updated At */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Обновлен</label>
              <div className="text-sm p-3 bg-muted rounded-lg">
                {format(new Date(webinar.updatedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}