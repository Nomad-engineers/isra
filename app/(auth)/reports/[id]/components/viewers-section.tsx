import { WebinarViewer } from '@/api/reports/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Eye,
  EyeOff,
  Clock,
  UserPlus,
  TrendingUp,
  Activity,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react'
import { useState, useEffect } from 'react'

// Demo viewers data
const demoViewers: WebinarViewer[] = [
  { id: '1', name: 'Гүлнұр Бекмұратова', email: 'gulnur@mail.kz', joinedAt: '2025-12-04T18:51:00', leftAt: '2025-12-04T20:05:00', totalWatchTime: 4440, isOnline: false },
  { id: '2', name: 'Айнур Қалдыбаева', email: 'ainur@gmail.com', joinedAt: '2025-12-04T19:00:00', leftAt: null, totalWatchTime: 3840, isOnline: true },
  { id: '3', name: 'Серік Санжар', email: 'serik@outlook.com', joinedAt: '2025-12-04T19:15:00', leftAt: '2025-12-04T19:55:00', totalWatchTime: 2400, isOnline: false },
  { id: '4', name: 'Қалдыбаева Баян', email: 'bayan@mail.ru', joinedAt: '2025-12-04T19:00:00', leftAt: null, totalWatchTime: 3600, isOnline: true },
  { id: '5', name: 'Газиза Алтынбекова', email: 'gaziza@gmail.com', joinedAt: '2025-12-04T19:02:00', leftAt: '2025-12-04T20:04:00', totalWatchTime: 3720, isOnline: false },
]

interface ViewersSectionProps {
  viewers?: {
    total: number
    currentlyOnline: number
    fromPartners?: number
    list: WebinarViewer[]
    pagination?: {
      page: number
      limit: number
      totalPages: number
    }
  }
  params: {
    page: number
    limit: number
    search: string
  }
  onParamsChange: (params: Partial<{ page: number; limit: number; search: string }>) => void
  loading: boolean
}

export function ViewersSection({ viewers: propViewers, params, onParamsChange, loading }: ViewersSectionProps) {
  const [searchInput, setSearchInput] = useState(params.search)
  const [activeTab, setActiveTab] = useState('all')
  const [perPage, setPerPage] = useState('50')

  // Use demo data if none provided
  const viewersList = propViewers?.list && propViewers.list.length > 0 ? propViewers.list : demoViewers
  const totalViewers = propViewers?.total || 164
  const onlineViewers = propViewers?.currentlyOnline || 42
  const fromPartners = propViewers?.fromPartners || 0

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== params.search) {
        onParamsChange({ search: searchInput })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchInput, params.search, onParamsChange])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handlePageChange = (page: number) => {
    onParamsChange({ page })
  }

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(totalViewers / params.limit)
  const startItem = (params.page - 1) * params.limit + 1
  const endItem = Math.min(params.page * params.limit, totalViewers)

  // Calculate statistics
  const engagementRate = totalViewers > 0 ? Math.round((onlineViewers / totalViewers) * 100) : 0
  const avgWatchTime = viewersList.length > 0 
    ? Math.round(viewersList.reduce((acc, v) => acc + v.totalWatchTime, 0) / viewersList.length / 60)
    : 0

  // Filter viewers by status
  const filteredViewers = viewersList.filter(viewer => {
    if (activeTab === 'online') return viewer.isOnline
    if (activeTab === 'offline') return !viewer.isOnline
    // Also filter by search
    if (searchInput) {
      const search = searchInput.toLowerCase()
      return viewer.name.toLowerCase().includes(search) || viewer.email.toLowerCase().includes(search)
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalViewers}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Всего заходили</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{onlineViewers}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Сейчас онлайн</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-100 dark:border-violet-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">{fromPartners}</div>
                <div className="text-sm text-violet-600 dark:text-violet-400">От партнеров</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-100 dark:border-orange-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{avgWatchTime}м</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Среднее время</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Header with Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Список зрителей</CardTitle>
                <p className="text-sm text-muted-foreground">Все посетители вебинара</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени или email..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={perPage} onValueChange={setPerPage}>
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Все ({totalViewers})
              </TabsTrigger>
              <TabsTrigger value="online" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Онлайн ({onlineViewers})
              </TabsTrigger>
              <TabsTrigger value="offline" className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Офлайн ({totalViewers - onlineViewers})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading && filteredViewers.length === 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-xl">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredViewers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 opacity-50 mb-4" />
                  <p>{searchInput ? 'Зрители не найдены' : 'Зрителей пока нет'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredViewers.map((viewer) => (
                    <div
                      key={viewer.id}
                      className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md hover:border-primary/20 transition-all duration-200"
                    >
                      <Avatar className="w-12 h-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                          {viewer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{viewer.name}</h3>
                          {viewer.isOnline ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                              Онлайн
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Офлайн
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">{viewer.email}</div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Вход: {formatDateTime(viewer.joinedAt)}</span>
                          </div>
                          {viewer.leftAt && (
                            <div className="flex items-center gap-1">
                              <span>→ Выход: {formatDateTime(viewer.leftAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                          <Activity className="h-4 w-4" />
                          {formatWatchTime(viewer.totalWatchTime)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">Просмотр</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Показано {startItem}-{endItem} из {totalViewers} зрителей
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.page - 1)}
              disabled={params.page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <span className="text-sm px-2">
              Страница {params.page} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.page + 1)}
              disabled={params.page >= totalPages || loading}
            >
              Вперед
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}