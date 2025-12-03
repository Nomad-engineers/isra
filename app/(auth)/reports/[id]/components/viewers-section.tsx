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
  Users,
  Search,
  Eye,
  EyeOff,
  Clock,
  UserPlus,
  TrendingUp,
  Activity,
  Filter
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface ViewersSectionProps {
  viewers: {
    total: number
    currentlyOnline: number
    list: WebinarViewer[]
  }
  params: {
    page: number
    limit: number
    search: string
  }
  onParamsChange: (params: Partial<{ page: number; limit: number; search: string }>) => void
  loading: boolean
}

export function ViewersSection({ viewers, params, onParamsChange, loading }: ViewersSectionProps) {
  const [searchInput, setSearchInput] = useState(params.search)
  const [activeTab, setActiveTab] = useState('all')

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

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
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

  const totalPages = Math.ceil(viewers.total / params.limit)
  const startItem = (params.page - 1) * params.limit + 1
  const endItem = Math.min(params.page * params.limit, viewers.total)

  // Статистика для карточек
  const engagementRate = Math.round((viewers.currentlyOnline / viewers.total) * 100)
  const avgWatchTime = Math.round(viewers.list.reduce((acc, v) => acc + v.totalWatchTime, 0) / viewers.list.length / 60)
  const onlineViewers = viewers.currentlyOnline
  const totalViewers = viewers.total

  // Фильтрация зрителей по статусу
  const filteredViewers = viewers.list.filter(viewer => {
    if (activeTab === 'online') return viewer.isOnline
    if (activeTab === 'offline') return !viewer.isOnline
    return true
  })

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Аналитика зрителей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{totalViewers}</div>
                <div className="text-sm text-blue-700">Всего зрителей</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{onlineViewers}</div>
                <div className="text-sm text-green-700">Сейчас онлайн</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{avgWatchTime}м</div>
                <div className="text-sm text-purple-700">Среднее время</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">{engagementRate}%</div>
                <div className="text-sm text-orange-700">Вовлеченность</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основной контент с табами */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-80"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Все ({viewers.total})
              </TabsTrigger>
              <TabsTrigger value="online" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Онлайн ({onlineViewers})
              </TabsTrigger>
              <TabsTrigger value="offline" className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                Офлайн ({viewers.total - onlineViewers})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading && filteredViewers.length === 0 ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
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
                <div className="text-center py-8 text-muted-foreground">
                  {searchInput ? 'Зрители не найдены' : 'Зрителей пока нет'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredViewers.map((viewer) => (
                    <div
                      key={viewer.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {viewer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{viewer.name}</h3>
                          {viewer.isOnline ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                              <Eye className="h-3 w-3 mr-1" />
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
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Вход: {formatDateTime(viewer.joinedAt)}</span>
                          </div>
                          {viewer.leftAt && (
                            <div className="text-muted-foreground">
                              Выход: {formatDateTime(viewer.leftAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          {formatWatchTime(Math.floor(viewer.totalWatchTime / 60))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Время просмотра</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Показано {startItem}-{endItem} из {viewers.total} зрителей
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.page - 1)}
              disabled={params.page <= 1 || loading}
            >
              Назад
            </Button>
            <span className="text-sm">
              Страница {params.page} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(params.page + 1)}
              disabled={params.page >= totalPages || loading}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}