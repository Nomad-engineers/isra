import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Calendar, Clock, FileText, Play } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Webinar } from '@/types/webinar'

interface WebinarCardProps {
  webinar: Webinar
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCopyLink?: (id: string) => void
  onStartWebinar?: (id: string) => void
  actions?: React.ReactNode
}

const statusConfig = {
  draft: {
    label: 'Черновик',
    variant: 'secondary' as const,
    className: 'bg-muted text-muted-foreground border-border',
  },
  scheduled: {
    label: 'Запланирован',
    variant: 'blue' as const,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  active: {
    label: 'Активный',
    variant: 'green' as const,
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 animate-pulse',
  },
  ended: {
    label: 'Завершен',
    variant: 'secondary' as const,
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  cancelled: {
    label: 'Отменен',
    variant: 'destructive' as const,
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
}

export function WebinarCard({ webinar, onView, onEdit, onDelete, onCopyLink, onStartWebinar, actions }: WebinarCardProps) {
  const statusInfo = statusConfig[webinar.status] || statusConfig.draft

  return (
    <Card
      className={cn(
        'w-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 group'
      )}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex justify-between items-start gap-2'>
          <span className='text-lg leading-tight font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors cursor-default'>
            {webinar.title}
          </span>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <Badge variant={statusInfo.variant} className={cn('text-xs px-2 py-1', statusInfo.className)}>
              {statusInfo.label}
            </Badge>
            {webinar.active ? (
              <Badge variant='outline' className='text-green-600 dark:text-green-400 border-green-500/50 bg-green-500/10 animate-pulse'>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                В прямом эфире
              </Badge>
            ) : webinar.scheduledAt ? (
              <Badge variant='blue' className='text-xs px-2 py-1'>
                <Calendar className='w-3 h-3 mr-1' />
                Запланирован
              </Badge>
            ) : webinar.tags && webinar.tags.length > 0 ? (
              <Badge variant='outline' className='text-primary border-primary/50 bg-primary/10'>
                {webinar.tags[0]}
              </Badge>
            ) : (
              <Badge variant='outline' className='text-muted-foreground border-border bg-muted'>
                <FileText className='w-3 h-3 mr-1' />
                Черновик
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 hover:bg-muted hover:text-primary transition-colors'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {onView && (
                  <DropdownMenuItem onClick={() => onView(webinar.id)}>
                    <Eye className='h-4 w-4 mr-2' />
                    Просмотр
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(webinar.id)}>
                    <Edit className='h-4 w-4 mr-2' />
                    Изменить
                  </DropdownMenuItem>
                )}
                {onCopyLink && (
                  <DropdownMenuItem onClick={() => onCopyLink(webinar.id)}>
                    <Copy className='h-4 w-4 mr-2' />
                    Копировать ссылку
                  </DropdownMenuItem>
                )}
                {onStartWebinar && !webinar.roomStarted && (
                  <DropdownMenuItem onClick={() => onStartWebinar(webinar.id)} className="text-green-600 focus:text-green-600">
                    <Play className='h-4 w-4 mr-2' />
                    Старт вебинара
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(webinar.id)}
                    className='text-destructive focus:text-destructive'
                  >
                    <Trash2 className='h-4 w-4 mr-2' />
                    Удалить
                  </DropdownMenuItem>
                )}
                {actions}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {webinar.description && <p className='text-sm text-muted-foreground line-clamp-2'>{webinar.description}</p>}

        <div className='space-y-2 text-sm'>
          {webinar.scheduledAt && (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Calendar className='h-4 w-4' />
              <span>{formatDate(webinar.scheduledAt, 'long')}</span>
            </div>
          )}

          {webinar.hostName && (
            <div className='text-muted-foreground'>
              <span className='font-medium'>Ведущий:</span> {webinar.hostName}
            </div>
          )}

          {webinar.duration && (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <Clock className='h-4 w-4' />
              <span>{webinar.duration} минут</span>
            </div>
          )}
        </div>

        {webinar.tags && webinar.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 pt-2 border-t border-border'>
            {webinar.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant='outline' className='text-xs'>
                {tag}
              </Badge>
            ))}
            {webinar.tags.length > 3 && (
              <Badge variant='outline' className='text-xs'>
                +{webinar.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className='flex justify-between text-xs text-muted-foreground pt-3 border-t border-border'>
          <span className="hover:text-foreground transition-colors">
            Создан: {formatDate(webinar.createdAt)}
          </span>
          <span className="hover:text-foreground transition-colors">
            Обновлен: {formatDate(webinar.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
