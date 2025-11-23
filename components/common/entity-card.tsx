import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Calendar, Users } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'
import { BaseEntity } from '@/types/common'

interface EntityCardProps<T extends BaseEntity> {
  data: T & {
    name: string
    description?: string
    active?: boolean
    status?: string
  }
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCopyLink?: (id: string) => void
  actions?: React.ReactNode
  statusBadge?: {
    label: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  extraInfo?: {
    icon?: React.ReactNode
    label: string
    value: string | number
  }[]
}

export function EntityCard<T extends BaseEntity>({
  data,
  onView,
  onEdit,
  onDelete,
  onCopyLink,
  actions,
  statusBadge,
  extraInfo,
}: EntityCardProps<T>) {
  const handleCopyLink = async () => {
    if (onCopyLink && data.id) {
      await onCopyLink(data.id)
    }
  }

  return (
    <Card className='w-full hover:shadow-md transition-shadow'>
      <CardHeader>
        <CardTitle className='flex justify-between items-start'>
          <span className='text-lg font-semibold line-clamp-2'>{data.name}</span>
          <div className='flex items-center gap-2 flex-shrink-0'>
            {statusBadge && <Badge variant={statusBadge.variant || 'secondary'}>{statusBadge.label}</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {onView && (
                  <DropdownMenuItem onClick={() => onView(data.id)}>
                    <Eye className='h-4 w-4 mr-2' />
                    Открыть
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(data.id)}>
                    <Edit className='h-4 w-4 mr-2' />
                    Изменить
                  </DropdownMenuItem>
                )}
                {onCopyLink && (
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className='h-4 w-4 mr-2' />
                    Копировать ссылку
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(data.id)} className='text-destructive'>
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
        {data.description && (
          <p className='text-muted-foreground text-sm line-clamp-3'>{data.description}</p>
        )}

        {extraInfo && extraInfo.length > 0 && (
          <div className='space-y-2'>
            {extraInfo.map((info, index) => (
              <div key={index} className='flex items-center gap-2 text-sm text-muted-foreground'>
                {info.icon && <span className='flex-shrink-0'>{info.icon}</span>}
                <span className='font-medium'>{info.label}:</span>
                <span>{info.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className='flex justify-between text-xs text-muted-foreground pt-2 border-t'>
          <span>Создан: {formatDate(data.createdAt, 'short')}</span>
          <span>Обновлен: {formatDate(data.updatedAt, 'short')}</span>
        </div>
      </CardContent>
    </Card>
  )
}