import { WebinarChatMessage } from '@/api/reports/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import {
  MessageCircle,
  User,
  Shield,
  Clock,
  Send,
  Search,
  TrendingUp,
  MessageSquare,
  Filter,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

interface ChatSectionProps {
  chat: WebinarChatMessage[]
  params: {
    page: number
    limit: number
  }
  onParamsChange: (params: Partial<{ page: number; limit: number }>) => void
  loading: boolean
}

// Demo chat messages if none provided
const demoChatMessages: WebinarChatMessage[] = [
  { id: '1', userId: '1', userName: 'Гүлнұр', message: 'Қызым қасымда', timestamp: '2025-12-04T19:00:02', isModerator: false },
  { id: '2', userId: '2', userName: 'Құдайберген Іңкәр', message: '+', timestamp: '2025-12-04T19:00:03', isModerator: false },
  { id: '3', userId: '3', userName: 'Газиза Алтынбекова', message: 'Балам қасымда емес бола берема?', timestamp: '2025-12-04T19:00:05', isModerator: false },
  { id: '4', userId: '4', userName: 'Er in Binazar', message: 'АНАР ХАНЫМ КІТАПША БЕРЕМІЗ СОҢЫНА ДЕЙІН БОЛЫҢЫЗ', timestamp: '2025-12-04T19:00:06', isModerator: true },
  { id: '5', userId: '5', userName: 'Қалдыбаева Баян', message: '+++++', timestamp: '2025-12-04T19:00:08', isModerator: false },
  { id: '6', userId: '6', userName: 'Айнур', message: 'Кызым касымда', timestamp: '2025-12-04T19:00:12', isModerator: false },
  { id: '7', userId: '4', userName: 'Er in Binazar', message: 'ҒАЗИЗА ХАНЫМ ҚАЙ СЫНЫПТА ОҚИДЫ БАЛАҢЫЗ', timestamp: '2025-12-04T19:00:23', isModerator: true },
  { id: '8', userId: '5', userName: 'Қалдыбаева Баян', message: 'Сәттілік жақсы сабақ болсын', timestamp: '2025-12-04T19:00:28', isModerator: false },
  { id: '9', userId: '7', userName: 'Серік Санжар', message: 'Кеш жарық', timestamp: '2025-12-04T19:00:34', isModerator: false },
  { id: '10', userId: '4', userName: 'Er in Binazar', message: 'БАЯН ХАНЫМ ПАЙДАЛЫ БОЛСЫН', timestamp: '2025-12-04T19:00:40', isModerator: true },
  { id: '11', userId: '8', userName: 'kalima handibekova', message: 'Қайырлы кеш', timestamp: '2025-12-04T19:00:41', isModerator: false },
  { id: '12', userId: '2', userName: 'Құдайберген Іңкәр', message: 'Саламатсыздар ма', timestamp: '2025-12-04T19:00:43', isModerator: false },
]

export function ChatSection({ chat: propChat, params, onParamsChange, loading }: ChatSectionProps) {
  const [searchInput, setSearchInput] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showStats, setShowStats] = useState(true)
  const [perPage, setPerPage] = useState('50')

  // Use demo data if no chat provided
  const chat = propChat && propChat.length > 0 ? propChat : demoChatMessages

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const startTime = new Date('2025-12-04T19:00:00')
    const msgTime = new Date(dateString)
    const diff = Math.floor((msgTime.getTime() - startTime.getTime()) / 1000)
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    const seconds = diff % 60
    return `+${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  const handleLoadMore = () => {
    onParamsChange({ page: params.page + 1 })
  }

  // Calculate statistics
  const totalMessages = chat.length
  const moderatorMessages = chat.filter(msg => msg.isModerator).length
  const userMessages = totalMessages - moderatorMessages
  const averageMessageLength = chat.length > 0
    ? Math.round(chat.reduce((acc, msg) => acc + msg.message.length, 0) / chat.length)
    : 0

  // Filter messages
  const filteredMessages = chat.filter(message => {
    if (activeTab === 'moderators') return message.isModerator
    if (activeTab === 'users') return !message.isModerator
    if (searchInput) {
      return message.userName.toLowerCase().includes(searchInput.toLowerCase()) ||
             message.message.toLowerCase().includes(searchInput.toLowerCase())
    }
    return true
  })

  // Group filtered messages by date
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const date = formatDate(message.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, WebinarChatMessage[]>)

  // Calculate total pages
  const totalPages = Math.ceil(totalMessages / parseInt(perPage))

  return (
    <div className="space-y-6">
      {/* Статистика чата */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Чат вебинара</CardTitle>
                <p className="text-sm text-muted-foreground">Все сообщения участников</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? 'Скрыть' : 'Показать'} статистику
            </Button>
          </div>
        </CardHeader>
        {showStats && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalMessages}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Всего сообщений</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-100 dark:border-green-900/30">
                <div className="p-2 bg-green-500 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{userMessages}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">От участников</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl border border-purple-100 dark:border-purple-900/30">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{moderatorMessages}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">От модераторов</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{averageMessageLength}</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Средняя длина</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Основной контент чата */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по чату..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Все ({totalMessages})
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Участники ({userMessages})
              </TabsTrigger>
              <TabsTrigger value="moderators" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Модераторы ({moderatorMessages})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {/* Pagination header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {/* Page buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 9) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={params.page === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => onParamsChange({ page })}
                      >
                        {page}
                      </Button>
                    ))}
                    {totalPages > 9 && (
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                        {totalPages}
                      </Button>
                    )}
                  </div>
                </div>
                <Select value={perPage} onValueChange={setPerPage}>
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">по 20</SelectItem>
                    <SelectItem value="50">по 50</SelectItem>
                    <SelectItem value="100">по 100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chat messages */}
              <div className="h-[500px] w-full rounded-xl border bg-gradient-to-b from-muted/20 to-muted/5 overflow-y-auto">
                {loading && filteredMessages.length === 0 ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageCircle className="h-12 w-12 opacity-50 mb-4" />
                    <p>{searchInput ? 'Сообщения не найдены' : 'Сообщений в чате пока нет'}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors ${
                          message.isModerator ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {/* Time */}
                        <div className="w-20 shrink-0 text-xs font-mono text-muted-foreground pt-1">
                          {formatRelativeTime(message.timestamp)}
                        </div>

                        {/* Name and message */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-sm ${
                              message.isModerator ? 'text-blue-600 dark:text-blue-400' : ''
                            }`}>
                              {message.userName}
                            </span>
                            {message.isModerator && (
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs py-0 px-1.5">
                                <Shield className="h-3 w-3 mr-1" />
                                Мод
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground/90 break-words">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom pagination */}
              {filteredMessages.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Показано {filteredMessages.length} сообщений
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onParamsChange({ page: 1 })}
                      disabled={params.page <= 1 || loading}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onParamsChange({ page: params.page - 1 })}
                      disabled={params.page <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      Страница {params.page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onParamsChange({ page: params.page + 1 })}
                      disabled={loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onParamsChange({ page: totalPages })}
                      disabled={loading}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}