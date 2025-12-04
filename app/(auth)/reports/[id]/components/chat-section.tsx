import { WebinarChatMessage } from '@/api/reports/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
  Download
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

export function ChatSection({ chat, params, onParamsChange, loading }: ChatSectionProps) {
  const [searchInput, setSearchInput] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showStats, setShowStats] = useState(true)

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
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

  return (
    <div className="space-y-6">
      {/* Статистика чата */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Аналитика чата
            </CardTitle>
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
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{totalMessages}</div>
                  <div className="text-sm text-blue-700">Всего сообщений</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <User className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">{userMessages}</div>
                  <div className="text-sm text-green-700">От участников</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">{moderatorMessages}</div>
                  <div className="text-sm text-purple-700">От модераторов</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-900">{averageMessageLength}</div>
                  <div className="text-sm text-orange-700">Средняя длина</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Основной контент чата */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Поиск по сообщениям..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
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
              <div className="h-96 w-full rounded-md border p-4 overflow-y-auto bg-background">
                {loading && filteredMessages.length === 0 ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {searchInput ? 'Сообщения не найдены' : 'Сообщений в чате пока нет'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedMessages).map(([date, messages]) => (
                      <div key={date}>
                        <div className="sticky top-0 bg-background py-2 mb-2 border-b z-10">
                          <span className="text-sm font-medium text-muted-foreground">{date}</span>
                        </div>
                        <div className="space-y-3">
                          {messages.map((message) => (
                            <div key={message.id} className="flex gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                              <Avatar className="w-10 h-10 flex-shrink-0">
                                <AvatarFallback className={`${
                                  message.isModerator
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {message.isModerator ? (
                                    <Shield className="h-5 w-5" />
                                  ) : (
                                    message.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                  )}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-sm">
                                    {message.userName}
                                  </h3>
                                  {message.isModerator && (
                                    <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                                      Модератор
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <div className="text-sm break-words bg-muted/50 rounded-lg p-3 group-hover:bg-muted transition-colors">
                                  {message.message}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Load more button */}
                    {chat.length >= params.limit && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLoadMore}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? 'Загрузка...' : 'Загрузить еще сообщения'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}