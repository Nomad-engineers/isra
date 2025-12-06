import { WebinarModerator } from '@/api/reports/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Shield,
  Mail,
  Crown,
  Clock,
  Key,
  User,
  Users,
  Activity,
  Star,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Settings
} from 'lucide-react'

interface ModeratorsSectionProps {
  moderators: WebinarModerator[]
  loading: boolean
}

export function ModeratorsSection({ moderators, loading }: ModeratorsSectionProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'moderator':
        return <Shield className="h-4 w-4" />
      case 'assistant':
        return <Crown className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'moderator':
        return 'Модератор'
      case 'assistant':
        return 'Помощник'
      default:
        return 'Участник'
    }
  }

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      chat_moderation: 'Модерация чата',
      user_management: 'Управление пользователями',
      content_control: 'Управление контентом',
      technical_support: 'Техническая поддержка',
      analytics: 'Аналитика',
      settings: 'Настройки'
    }
    return labels[permission] || permission
  }

  const getPermissionIcon = (permission: string) => {
    const icons: Record<string, React.ReactNode> = {
      chat_moderation: <MessageCircle className="h-3 w-3" />,
      user_management: <Users className="h-3 w-3" />,
      content_control: <Star className="h-3 w-3" />,
      technical_support: <Activity className="h-3 w-3" />,
      analytics: <TrendingUp className="h-3 w-3" />,
      settings: <Settings className="h-3 w-3" />
    }
    return icons[permission] || <Key className="h-3 w-3" />
  }

  // Calculate statistics
  const totalModerators = moderators.length
  const moderatorsWithAnalytics = moderators.filter(m => m.permissions.includes('analytics')).length
  const moderatorsWithChatModeration = moderators.filter(m => m.permissions.includes('chat_moderation')).length
  const avgPermissionsCount = totalModerators > 0
    ? Math.round(moderators.reduce((acc, m) => acc + m.permissions.length, 0) / totalModerators)
    : 0

  return (
    <div className="space-y-6">
      {/* Статистика модераторов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Аналитика модераторов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{totalModerators}</div>
                <div className="text-sm text-blue-700">Всего модераторов</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{moderatorsWithChatModeration}</div>
                <div className="text-sm text-green-700">Модераторов чата</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{moderatorsWithAnalytics}</div>
                <div className="text-sm text-purple-700">С доступом к аналитике</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Key className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">{avgPermissionsCount}</div>
                <div className="text-sm text-orange-700">Среднее прав</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список модераторов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Команда модерации
              <Badge variant="secondary">{totalModerators}</Badge>
            </div>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Добавить модератора
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && moderators.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-16 rounded-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : moderators.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">Модераторы не назначены</div>
              <div className="text-sm">Добавьте модераторов для управления вебинаром</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moderators.map((moderator) => (
                <div
                  key={moderator.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {moderator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-lg truncate">{moderator.name}</h3>
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getRoleIcon(moderator.role)}
                          {getRoleLabel(moderator.role)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{moderator.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Clock className="h-3 w-3" />
                    <span>Присоединился: {formatDateTime(moderator.joinedAt)}</span>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Key className="h-3 w-3" />
                        Права доступа ({moderator.permissions.length})
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {moderator.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant="secondary"
                          className="text-xs flex items-center gap-1 px-2 py-1"
                        >
                          {getPermissionIcon(permission)}
                          {getPermissionLabel(permission)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Activity indicator */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Активность</span>
                      <span className="text-green-600 font-medium">Высокая</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1 mt-1">
                      <div className="bg-green-500 h-1 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}