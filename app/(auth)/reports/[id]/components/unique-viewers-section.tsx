"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Users,
  UserCheck,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MousePointer,
  MessageCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  Activity,
  TrendingUp,
  Eye,
  Zap,
  Play,
  Radio,
  Timer,
  AlertTriangle,
} from 'lucide-react'
import { UniqueViewer, DeviceStats, GeoStats } from '@/api/reports/types'

interface UniqueViewersSectionProps {
  viewers?: {
    total: number
    list: UniqueViewer[]
    pagination: {
      page: number
      limit: number
      totalPages: number
    }
  }
  deviceStats?: DeviceStats
  geoStats?: GeoStats
  params: {
    page: number
    limit: number
    search: string
  }
  onParamsChange: (params: Partial<{ page: number; limit: number; search: string }>) => void
  loading: boolean
}

// Demo data - как в bizon365
const demoViewers: UniqueViewer[] = [
  {
    id: '1',
    name: 'Ааа',
    email: 'aaa@mail.kz',
    phone: '+77751303071',
    city: 'Алматы',
    country: 'Казахстан',
    device: 'mobile',
    browser: 'Safari',
    browserVersion: '18.5',
    os: 'iOS',
    deviceModel: 'iPhone',
    ip: '178.91.16.168',
    webinarJoinTime: '19:00',
    webinarLeaveTime: '19:41',
    wasStreamStarted: true,
    firstVisit: '2025-12-04T19:00:00',
    lastVisit: '2025-12-04T19:41:00',
    totalSessions: 1,
    totalWatchTime: 2460,
    averageSessionTime: 2460,
    presenceIntervals: [
      { 
        startRelative: '+00:00:04', 
        endRelative: '+00:41:00', 
        startAbsolute: '19:00:04', 
        endAbsolute: '19:41:00',
        duration: 2456, 
        durationFormatted: '40м 56с' 
      }
    ],
    clickedButton: false,
    clickedBanner: true,
    visitedOrderPage: false,
    sentMessages: 0,
    utmSource: 'telegram',
  },
  {
    id: '2',
    name: 'Er in Binazar',
    email: 'er.inbinazar@mail.ru',
    phone: '+77777777777',
    city: 'Алматы',
    country: 'Казахстан',
    device: 'desktop',
    browser: 'Chrome',
    browserVersion: '120.0',
    os: 'Windows',
    ip: '79.137.177.47',
    webinarJoinTime: '18:51',
    webinarLeaveTime: '20:05',
    wasStreamStarted: true,
    firstVisit: '2025-12-04T18:51:00',
    lastVisit: '2025-12-04T20:05:00',
    totalSessions: 1,
    totalWatchTime: 4440,
    averageSessionTime: 4440,
    presenceIntervals: [
      { 
        startRelative: '+00:00:04', 
        endRelative: '+01:05:04', 
        startAbsolute: '18:51:04', 
        endAbsolute: '20:05:04',
        duration: 3900, 
        durationFormatted: '1ч 5м 4с' 
      }
    ],
    clickedButton: true,
    clickedBanner: true,
    visitedOrderPage: true,
    sentMessages: 45,
    utmSource: 'direct',
  },
  {
    id: '3',
    name: 'Айнур Қалдыбаева',
    email: 'ainur@gmail.com',
    phone: '+7 707 555 1234',
    city: 'Қызылорда',
    country: 'Казахстан',
    device: 'mobile',
    browser: 'Safari',
    browserVersion: '17.0',
    os: 'iOS',
    deviceModel: 'iPhone',
    ip: '162.255.198.185',
    webinarJoinTime: '19:44',
    webinarLeaveTime: '20:04',
    wasStreamStarted: true,
    firstVisit: '2025-12-04T19:44:00',
    lastVisit: '2025-12-04T20:04:00',
    totalSessions: 3,
    totalWatchTime: 720,
    averageSessionTime: 240,
    presenceIntervals: [
      { 
        startRelative: '+00:44:39', 
        endRelative: '+00:47:44', 
        startAbsolute: '19:44:39', 
        endAbsolute: '19:47:44',
        duration: 185, 
        durationFormatted: '3м 5с' 
      },
      { 
        startRelative: '+01:02:19', 
        endRelative: '+01:02:54', 
        startAbsolute: '20:02:19', 
        endAbsolute: '20:02:54',
        duration: 35, 
        durationFormatted: '35с' 
      },
      { 
        startRelative: '+01:04:19', 
        endRelative: '+01:04:44', 
        startAbsolute: '20:04:19', 
        endAbsolute: '20:04:44',
        duration: 25, 
        durationFormatted: '25с' 
      }
    ],
    clickedButton: false,
    clickedBanner: false,
    visitedOrderPage: false,
    sentMessages: 2,
    utmSource: 'instagram',
    utmMedium: 'social',
    utmCampaign: 'stories',
  },
  {
    id: '4',
    name: 'Серік Санжар',
    email: 'serik@outlook.com',
    city: 'Астана',
    country: 'Казахстан',
    device: 'tablet',
    browser: 'Firefox',
    os: 'iOS',
    deviceModel: 'iPad',
    ip: '95.56.234.12',
    webinarJoinTime: '19:15',
    webinarLeaveTime: '19:55',
    wasStreamStarted: true,
    firstVisit: '2025-12-04T19:15:00',
    lastVisit: '2025-12-04T19:55:00',
    totalSessions: 1,
    totalWatchTime: 2400,
    averageSessionTime: 2400,
    presenceIntervals: [
      { 
        startRelative: '+00:15:00', 
        endRelative: '+00:55:00', 
        startAbsolute: '19:15:00', 
        endAbsolute: '19:55:00',
        duration: 2400, 
        durationFormatted: '40м' 
      }
    ],
    clickedButton: true,
    clickedBanner: false,
    visitedOrderPage: true,
    sentMessages: 3,
    utmSource: 'direct',
  },
  {
    id: '5',
    name: 'Марат Төлеген',
    email: 'marat@mail.kz',
    phone: '+77012345678',
    city: 'Шымкент',
    country: 'Казахстан',
    device: 'mobile',
    browser: 'Chrome',
    browserVersion: '119.0',
    os: 'Android',
    deviceModel: 'Samsung Galaxy',
    ip: '95.57.123.45',
    webinarJoinTime: '19:02',
    webinarLeaveTime: '20:10',
    wasStreamStarted: true,
    firstVisit: '2025-12-04T19:02:00',
    lastVisit: '2025-12-04T20:10:00',
    totalSessions: 2,
    totalWatchTime: 3600,
    averageSessionTime: 1800,
    presenceIntervals: [
      { 
        startRelative: '+00:02:00', 
        endRelative: '+00:45:00', 
        startAbsolute: '19:02:00', 
        endAbsolute: '19:45:00',
        duration: 2580, 
        durationFormatted: '43м' 
      },
      { 
        startRelative: '+00:55:00', 
        endRelative: '+01:10:00', 
        startAbsolute: '19:55:00', 
        endAbsolute: '20:10:00',
        duration: 900, 
        durationFormatted: '15м' 
      }
    ],
    clickedButton: true,
    clickedBanner: true,
    visitedOrderPage: true,
    sentMessages: 8,
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'webinar_promo',
  },
  {
    id: '6',
    name: 'Дана Нұрланқызы',
    email: 'dana@gmail.com',
    phone: '+77771234567',
    city: 'Караганда',
    country: 'Казахстан',
    device: 'desktop',
    browser: 'Firefox',
    browserVersion: '121.0',
    os: 'Windows',
    ip: '178.89.45.67',
    webinarJoinTime: '19:00',
    webinarLeaveTime: '21:00',
    wasStreamStarted: true,
    firstVisit: '2025-12-04T19:00:00',
    lastVisit: '2025-12-04T21:00:00',
    totalSessions: 1,
    totalWatchTime: 7200,
    averageSessionTime: 7200,
    presenceIntervals: [
      { 
        startRelative: '+00:00:00', 
        endRelative: '+02:00:00', 
        startAbsolute: '19:00:00', 
        endAbsolute: '21:00:00',
        duration: 7200, 
        durationFormatted: '2ч 0м' 
      }
    ],
    clickedButton: false,
    clickedBanner: false,
    visitedOrderPage: false,
    sentMessages: 25,
    utmSource: 'email',
    utmMedium: 'newsletter',
  },
]

const demoDeviceStats: DeviceStats = {
  desktop: 67,
  mobile: 89,
  tablet: 8,
  desktopPercent: 40.9,
  mobilePercent: 54.3,
  tabletPercent: 4.8,
}

const demoGeoStats: GeoStats = {
  countries: [
    { name: 'Казахстан', code: 'KZ', visitors: 142, percent: 86.6 },
    { name: 'Россия', code: 'RU', visitors: 15, percent: 9.1 },
    { name: 'Узбекистан', code: 'UZ', visitors: 7, percent: 4.3 },
  ],
  cities: [
    { name: 'Алматы', visitors: 45, percent: 27.4 },
    { name: 'Астана', visitors: 38, percent: 23.2 },
    { name: 'Қызылорда', visitors: 28, percent: 17.1 },
    { name: 'Шымкент', visitors: 19, percent: 11.6 },
  ],
}

export function UniqueViewersSection({
  viewers: propViewers,
  deviceStats: propDeviceStats,
  geoStats: propGeoStats,
  params,
  onParamsChange,
  loading,
}: UniqueViewersSectionProps) {
  const [searchInput, setSearchInput] = useState(params.search)
  const [filterDevice, setFilterDevice] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all')
  const [expandedViewer, setExpandedViewer] = useState<string | null>(null)
  
  // Используем демо данные если список пустой или не передан
  const viewers = (propViewers?.list && propViewers.list.length > 0) ? propViewers.list : demoViewers
  const totalViewers = propViewers?.total || 164
  const deviceStats = propDeviceStats || demoDeviceStats
  const geoStats = propGeoStats || demoGeoStats
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== params.search) {
        onParamsChange({ search: searchInput })
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchInput, params.search, onParamsChange])

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    }
    return `${minutes}м`
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return Monitor
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      default: return Monitor
    }
  }

  const filteredViewers = viewers.filter(viewer => {
    if (filterDevice !== 'all' && viewer.device !== filterDevice) return false
    if (searchInput) {
      const search = searchInput.toLowerCase()
      return (
        viewer.name.toLowerCase().includes(search) ||
        viewer.email.toLowerCase().includes(search) ||
        viewer.city?.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Unique Viewers */}
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-100 dark:border-violet-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">{totalViewers}</div>
                <div className="text-sm text-violet-600 dark:text-violet-400">Уникальных зрителей</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Устройства</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-pink-500" />
                  <span>Мобильные</span>
                </div>
                <span className="font-semibold">{deviceStats.mobilePercent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-blue-500" />
                  <span>ПК</span>
                </div>
                <span className="font-semibold">{deviceStats.desktopPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Tablet className="h-4 w-4 text-green-500" />
                  <span>Планшеты</span>
                </div>
                <span className="font-semibold">{deviceStats.tabletPercent}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Топ города</span>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {geoStats.cities.slice(0, 3).map((city, index) => (
                <div key={city.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {index + 1}
                    </span>
                    <span className="truncate">{city.name}</span>
                  </div>
                  <span className="font-semibold">{city.visitors}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 dark:border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">78%</div>
                <div className="text-sm text-green-600 dark:text-green-400">Вовлеченность</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viewers List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Список зрителей</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Детальная информация о каждом уникальном зрителе
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени, email, городу..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filterDevice} onValueChange={(v: any) => setFilterDevice(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все устройства</SelectItem>
                  <SelectItem value="desktop">Компьютер</SelectItem>
                  <SelectItem value="mobile">Мобильные</SelectItem>
                  <SelectItem value="tablet">Планшеты</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="50">
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">по 20</SelectItem>
                  <SelectItem value="50">по 50</SelectItem>
                  <SelectItem value="100">по 100</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Еще фильтры
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading && viewers.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredViewers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{searchInput ? 'Зрители не найдены' : 'Данные о зрителях пока отсутствуют'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredViewers.map((viewer) => {
                const DeviceIcon = getDeviceIcon(viewer.device)
                const isExpanded = expandedViewer === viewer.id
                
                return (
                  <div
                    key={viewer.id}
                    className="border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    {/* Main Row - как в bizon365 */}
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setExpandedViewer(isExpanded ? null : viewer.id)}
                    >
                      {/* Header: Name + Phone */}
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10 border-2 border-primary/20 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold text-sm">
                            {viewer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="font-semibold">{viewer.name}</h3>
                            {viewer.phone && (
                              <span className="text-sm text-muted-foreground font-mono">{viewer.phone}</span>
                            )}
                            {/* Expand button */}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          
                          {/* Info line: На вебинаре с... до... */}
                          <div className="text-sm text-muted-foreground mt-1">
                            На вебинаре с <span className="font-medium text-foreground">{viewer.webinarJoinTime || '19:00'}</span> до <span className="font-medium text-foreground">{viewer.webinarLeaveTime || '20:00'}</span>
                            <span className="ml-2">ip: {viewer.ip}</span>
                            {viewer.city && <span className="ml-2">{viewer.city}</span>}
                          </div>
                          
                          {/* Device line */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <DeviceIcon className="h-3 w-3" />
                            <span>{viewer.deviceModel || viewer.device}, {viewer.browser} {viewer.browserVersion || ''}, {viewer.os}</span>
                          </div>
                          
                          {/* Stream started badge */}
                          {viewer.wasStreamStarted && (
                            <div className="flex items-center gap-1.5 text-green-600 text-sm mt-1">
                              <Radio className="h-3 w-3" />
                              <span>Трансляция запустилась</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Интервалы присутствия - визуальная линия */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          {viewer.presenceIntervals.map((interval, idx) => {
                            // Парсим время из формата +HH:MM:SS или HH:MM:SS
                            const parseTime = (timeStr: string) => {
                              const match = timeStr.match(/\+?(\d{2}):(\d{2}):?(\d{2})?/)
                              if (match) {
                                const hours = parseInt(match[1])
                                const minutes = parseInt(match[2])
                                return hours * 60 + minutes
                              }
                              return 0
                            }
                            const webinarDuration = 120 // 2 часа
                            const startMin = parseTime(interval.startRelative)
                            const endMin = parseTime(interval.endRelative)
                            const left = (startMin / webinarDuration) * 100
                            const width = ((endMin - startMin) / webinarDuration) * 100
                            
                            return (
                              <div
                                key={idx}
                                className="absolute top-0 bottom-0 bg-green-500"
                                style={{ 
                                  left: `${Math.max(0, left)}%`, 
                                  width: `${Math.max(1, Math.min(100 - left, width))}%`
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Action badges row */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          {viewer.clickedButton && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              <MousePointer className="h-3 w-3 mr-1" />
                              Кнопка
                            </Badge>
                          )}
                          {viewer.clickedBanner && (
                            <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Баннер
                            </Badge>
                          )}
                          {viewer.sentMessages > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {viewer.sentMessages} сообщ.
                            </Badge>
                          )}
                        </div>
                        
                        {/* Total watch time */}
                        <div className="text-right">
                          <span className="text-sm font-semibold text-primary">
                            {formatWatchTime(viewer.totalWatchTime)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">просмотр</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Details - как в bizon365 */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/20">
                        {/* Header info line - как в bizon365 */}
                        <div className="py-3 border-b text-sm space-y-1">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="font-medium">
                              На вебинаре с {viewer.webinarJoinTime || '19:00'} до {viewer.webinarLeaveTime || '20:00'}
                            </span>
                            <span className="text-muted-foreground">
                              ip: {viewer.ip}
                            </span>
                            {viewer.city && (
                              <span className="text-muted-foreground">{viewer.city}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DeviceIcon className="h-3.5 w-3.5" />
                            <span>
                              {viewer.deviceModel || viewer.device}, {viewer.browser} {viewer.browserVersion || ''}, {viewer.os}
                            </span>
                          </div>
                          {viewer.wasStreamStarted && (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <Radio className="h-3.5 w-3.5" />
                              <span>Трансляция запустилась</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
                          {/* Left: Contact & Device */}
                          <div className="space-y-3">
                            {viewer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono">{viewer.phone}</span>
                              </div>
                            )}
                            {viewer.utmSource && (
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">utm: {viewer.utmSource}</Badge>
                                {viewer.utmMedium && <Badge variant="secondary" className="text-xs">{viewer.utmMedium}</Badge>}
                                {viewer.utmCampaign && <Badge variant="secondary" className="text-xs">{viewer.utmCampaign}</Badge>}
                              </div>
                            )}
                          </div>
                          
                          {/* Right: Presence Intervals - ключевая фича! */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Timer className="h-4 w-4 text-violet-500" />
                              Интервалы присутствия:
                            </h4>
                            <div className="space-y-2">
                              {viewer.presenceIntervals.map((interval, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start font-mono text-xs h-auto py-2"
                                  title="Скоро: перейти к моменту видео"
                                >
                                  <Play className="h-3 w-3 mr-2 text-violet-500" />
                                  <span className="text-violet-600 dark:text-violet-400">
                                    Присутствие от начала вебинара:
                                  </span>
                                  <span className="ml-2 font-semibold">
                                    {interval.startRelative} — {interval.endRelative}
                                  </span>
                                  <span className="ml-auto text-muted-foreground">
                                    ({interval.durationFormatted})
                                  </span>
                                </Button>
                              ))}
                            </div>
                            {viewer.presenceIntervals.length > 1 && (
                              <p className="text-xs text-muted-foreground">
                                * Зритель выходил и возвращался {viewer.presenceIntervals.length} раз(а)
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Показать сообщения
                          </Button>
                          <Button variant="outline" size="sm">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Анализ зрителя
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Pagination */}
          {filteredViewers.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Показано {filteredViewers.length} из {totalViewers} зрителей
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={params.page <= 1}
                  onClick={() => onParamsChange({ page: params.page - 1 })}
                >
                  Назад
                </Button>
                <span className="text-sm">Страница {params.page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onParamsChange({ page: params.page + 1 })}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

