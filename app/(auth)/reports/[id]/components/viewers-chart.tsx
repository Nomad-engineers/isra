"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Users,
  Clock,
  Zap,
  RefreshCw,
  LogIn,
  LogOut,
  AlertTriangle,
  Play,
  Eye,
} from 'lucide-react'
import { ViewerChartDataPoint, ChartFilter, RetentionAnalytics } from '@/api/reports/types'

interface ViewersChartProps {
  data: ViewerChartDataPoint[]
  retentionAnalytics?: RetentionAnalytics
  peakViewers: number
  peakTime: string
  webinarDuration?: number // в минутах
  onFilterChange?: (filter: ChartFilter) => void
  loading?: boolean
}

// Генерация реалистичных демо данных удержания
function generateRetentionDemoData(): ViewerChartDataPoint[] {
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
      // Резкий уход на 45 минуте (типичная точка потери)
      if (minute === 45) leftCount = Math.floor(10 + Math.random() * 15)
    }
    // 60-90 минут
    else if (minute < 90) {
      joinedCount = Math.floor(Math.random() * 2)
      leftCount = Math.floor(1 + Math.random() * 4)
    }
    // Последние 30 минут - уходят к концу
    else {
      joinedCount = Math.floor(Math.random() * 2)
      leftCount = Math.floor(3 + Math.random() * 6)
      // Резкий уход перед концом
      if (minute > 110) leftCount = Math.floor(5 + Math.random() * 10)
    }
    
    // Корректируем чтобы не уходило больше чем есть
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

// Демо данные аналитики удержания
const demoRetentionAnalytics: RetentionAnalytics = {
  dropOffPoints: [
    { time: '+00:45:00', absoluteTime: '19:45', leftCount: 18, percentOfTotal: 11, possibleReason: 'Середина вебинара - потеря интереса' },
    { time: '+01:50:00', absoluteTime: '20:50', leftCount: 12, percentOfTotal: 7.3, possibleReason: 'Перед окончанием' },
    { time: '+00:15:00', absoluteTime: '19:15', leftCount: 8, percentOfTotal: 4.9 },
  ],
  returnPoints: [
    { time: '+00:30:00', absoluteTime: '19:30', returnedCount: 5, percentOfTotal: 3.1 },
    { time: '+01:00:00', absoluteTime: '20:00', returnedCount: 3, percentOfTotal: 1.8 },
  ],
  averageWatchTime: 2640, // 44 минуты
  medianWatchTime: 2400,  // 40 минут
  retentionAt25Percent: 92,
  retentionAt50Percent: 78,
  retentionAt75Percent: 61,
  retentionAtEnd: 45,
  commonExitTimes: ['19:45', '20:50', '19:15'],
  commonReturnTimes: ['19:30', '20:00'],
}

export function ViewersChart({
  data: propData,
  retentionAnalytics: propRetentionAnalytics,
  peakViewers,
  peakTime,
  webinarDuration = 120,
  onFilterChange,
  loading = false,
}: ViewersChartProps) {
  const [device, setDevice] = useState<'all' | 'desktop' | 'mobile'>('all')
  const [granularity, setGranularity] = useState<'optimal' | '1min' | '2min' | '5min'>('optimal')
  const [hoveredPoint, setHoveredPoint] = useState<ViewerChartDataPoint | null>(null)
  const [showDropOffs, setShowDropOffs] = useState(true)
  
  // Use demo data if no real data provided
  const chartData = useMemo(() => {
    if (propData && propData.length > 0) return propData
    return generateRetentionDemoData()
  }, [propData])
  
  const retentionAnalytics = propRetentionAnalytics || demoRetentionAnalytics
  
  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return { peak: 0, average: 0, currentOnline: 0, totalJoined: 0 }
    
    const peak = Math.max(...chartData.map(d => d.onlineCount))
    const average = Math.round(chartData.reduce((acc, d) => acc + d.onlineCount, 0) / chartData.length)
    const currentOnline = chartData[chartData.length - 1]?.onlineCount || 0
    const totalJoined = chartData[chartData.length - 1]?.totalJoined || 0
    
    return { peak, average, currentOnline, totalJoined }
  }, [chartData])
  
  const handleFilterChange = (type: 'device' | 'granularity', value: string) => {
    if (type === 'device') {
      setDevice(value as 'all' | 'desktop' | 'mobile')
    } else {
      setGranularity(value as 'optimal' | '1min' | '2min' | '5min')
    }
    
    onFilterChange?.({
      device: type === 'device' ? (value as 'all' | 'desktop' | 'mobile') : device,
      utmFilter: [],
      granularity: type === 'granularity' ? (value as 'optimal' | '1min' | '2min' | '5min') : granularity,
    })
  }

  // Retention chart component
  const RetentionChart = () => {
    const maxOnline = stats.peak
    const chartHeight = 300
    
    // Sample data for display (every Nth point based on granularity)
    const step = granularity === '1min' ? 1 : granularity === '2min' ? 2 : granularity === '5min' ? 5 : 2
    const displayData = chartData.filter((_, i) => i % step === 0)
    
    return (
      <div className="relative h-[350px] w-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 w-12 flex flex-col justify-between text-xs text-muted-foreground pr-2 text-right">
          <span>{maxOnline}</span>
          <span>{Math.round(maxOnline * 0.75)}</span>
          <span>{Math.round(maxOnline * 0.5)}</span>
          <span>{Math.round(maxOnline * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="absolute left-14 right-4 top-0 bottom-10 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-900/30 rounded-lg border overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-dashed border-slate-200 dark:border-slate-800" />
            ))}
          </div>
          
          {/* Retention percentage zones */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="flex-1 bg-red-500/5" /> {/* 75-100% - отличное удержание */}
            <div className="flex-1 bg-yellow-500/5" /> {/* 50-75% */}
            <div className="flex-1 bg-orange-500/5" /> {/* 25-50% */}
            <div className="flex-1 bg-red-500/10" /> {/* 0-25% - критично */}
          </div>
          
          {/* Bars */}
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end">
            {displayData.map((point, idx) => {
              const height = maxOnline > 0 ? (point.onlineCount / maxOnline) * 100 : 0
              const isDropOff = retentionAnalytics.dropOffPoints.some(d => d.absoluteTime === point.absoluteTime)
              const isHovered = hoveredPoint?.time === point.time
              
              return (
                <div
                  key={idx}
                  className="flex-1 relative group cursor-pointer"
                  style={{ height: '100%' }}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Main bar - online count */}
                  <div
                    className={`absolute bottom-0 left-[1px] right-[1px] rounded-t-sm transition-all duration-150 ${
                      isDropOff && showDropOffs
                        ? 'bg-gradient-to-t from-red-500 to-red-400'
                        : isHovered
                        ? 'bg-gradient-to-t from-violet-600 to-violet-500'
                        : 'bg-gradient-to-t from-violet-500 to-violet-400'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  
                  {/* Joined indicator (green top) */}
                  {point.joinedCount > 0 && (
                    <div
                      className="absolute left-[1px] right-[1px] bg-green-500 rounded-t-sm opacity-70"
                      style={{ 
                        bottom: `${height}%`,
                        height: `${Math.min((point.joinedCount / maxOnline) * 100, 5)}%`
                      }}
                    />
                  )}
                  
                  {/* Left indicator (red dot) */}
                  {point.leftCount > 3 && showDropOffs && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  )}
                  
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border min-w-[180px]">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{point.absoluteTime}</span>
                          <span className="text-xs text-muted-foreground">({point.time})</span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Eye className="h-3.5 w-3.5 text-violet-500" />
                              Онлайн:
                            </span>
                            <span className="font-bold text-violet-600">{point.onlineCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <LogIn className="h-3.5 w-3.5 text-green-500" />
                              Зашли:
                            </span>
                            <span className="font-medium text-green-600">+{point.joinedCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <LogOut className="h-3.5 w-3.5 text-red-500" />
                              Вышли:
                            </span>
                            <span className="font-medium text-red-600">-{point.leftCount}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t">
                            <span className="text-muted-foreground">Удержание:</span>
                            <Badge variant={point.retentionPercent > 70 ? 'default' : point.retentionPercent > 40 ? 'secondary' : 'destructive'}>
                              {point.retentionPercent}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Peak line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500/60 pointer-events-none"
            style={{ top: '0%' }}
          >
            <span className="absolute right-2 -bottom-5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
              Пик: {stats.peak}
            </span>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute left-14 right-4 bottom-0 h-10 flex justify-between items-center text-xs text-muted-foreground">
          {displayData.filter((_, i) => i % Math.ceil(displayData.length / 8) === 0).map((point, idx) => (
            <div key={idx} className="text-center">
              <div>{point.absoluteTime}</div>
              <div className="text-[10px] opacity-70">{point.time}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Chart Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">График удержания зрителей</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Онлайн зрители, входы и выходы в реальном времени
                </p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={device} onValueChange={(v) => handleFilterChange('device', v)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Все устройства
                    </div>
                  </SelectItem>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Компьютер
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Мобильные
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={granularity} onValueChange={(v) => handleFilterChange('granularity', v)}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimal">Оптимально</SelectItem>
                  <SelectItem value="1min">1 минута</SelectItem>
                  <SelectItem value="2min">2 минуты</SelectItem>
                  <SelectItem value="5min">5 минут</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={showDropOffs ? "default" : "outline"}
                size="sm"
                className="h-9"
                onClick={() => setShowDropOffs(!showDropOffs)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Точки выхода
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => onFilterChange?.({ device, utmFilter: [], granularity })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Построить
              </Button>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
              <div className="p-2 bg-violet-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-violet-700 dark:text-violet-400">{stats.totalJoined}</div>
                <div className="text-xs text-violet-600 dark:text-violet-500">Всего заходили</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-100 dark:border-green-900/30">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.peak}</div>
                <div className="text-xs text-green-600 dark:text-green-500">Пик онлайн</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{peakTime}</div>
                <div className="text-xs text-blue-600 dark:text-blue-500">Время пика</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{retentionAnalytics.retentionAtEnd}%</div>
                <div className="text-xs text-amber-600 dark:text-amber-500">Досмотрели до конца</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center h-[350px]">
              <div className="text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Загрузка графика...</p>
              </div>
            </div>
          ) : (
            <RetentionChart />
          )}
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-violet-500" />
              <span className="text-sm text-muted-foreground">Онлайн</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span className="text-sm text-muted-foreground">Вошли</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Точки выхода</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-emerald-500" />
              <span className="text-sm text-muted-foreground">Пик</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retention Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Drop-off Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Точки выхода зрителей
              <Badge variant="destructive" className="ml-auto">{retentionAnalytics.dropOffPoints.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {retentionAnalytics.dropOffPoints.map((point, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/30">
                <div className="text-center min-w-[60px]">
                  <div className="font-bold text-red-700 dark:text-red-400">{point.absoluteTime}</div>
                  <div className="text-xs text-red-600 dark:text-red-500">{point.time}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{point.leftCount} чел.</span>
                    <Badge variant="secondary" className="text-xs">{point.percentOfTotal}%</Badge>
                  </div>
                  {point.possibleReason && (
                    <p className="text-xs text-muted-foreground mt-1">{point.possibleReason}</p>
                  )}
                </div>
                {/* Заглушка для превью видео */}
                <Button variant="ghost" size="sm" className="opacity-50" disabled title="Скоро: просмотр момента видео">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Retention Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Удержание по времени
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>25% вебинара</span>
                  <span className="font-semibold text-green-600">{retentionAnalytics.retentionAt25Percent}%</span>
                </div>
                <Progress value={retentionAnalytics.retentionAt25Percent} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>50% вебинара</span>
                  <span className="font-semibold text-blue-600">{retentionAnalytics.retentionAt50Percent}%</span>
                </div>
                <Progress value={retentionAnalytics.retentionAt50Percent} className="h-2 [&>div]:bg-blue-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>75% вебинара</span>
                  <span className="font-semibold text-amber-600">{retentionAnalytics.retentionAt75Percent}%</span>
                </div>
                <Progress value={retentionAnalytics.retentionAt75Percent} className="h-2 [&>div]:bg-amber-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>До конца</span>
                  <span className="font-semibold text-violet-600">{retentionAnalytics.retentionAtEnd}%</span>
                </div>
                <Progress value={retentionAnalytics.retentionAtEnd} className="h-2 [&>div]:bg-violet-500" />
              </div>
            </div>
            
            <div className="pt-3 border-t grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.floor(retentionAnalytics.averageWatchTime / 60)}м
                </div>
                <div className="text-xs text-muted-foreground">Среднее время</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.floor(retentionAnalytics.medianWatchTime / 60)}м
                </div>
                <div className="text-xs text-muted-foreground">Медианное время</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
