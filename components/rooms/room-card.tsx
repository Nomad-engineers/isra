import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Calendar, FileText, DoorOpen } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Room } from '@/types/room'

interface RoomCardProps {
  room: Room
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCopyLink?: (id: string) => void
  actions?: React.ReactNode
}

export function RoomCard({ room, onView, onEdit, onDelete, onCopyLink, actions }: RoomCardProps) {
  return (
    <Card
      className={cn(
        'w-full card-glass transition-all duration-300 hover:shadow-lg hover:shadow-isra-primary/10 hover:-translate-y-1 group'
      )}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex justify-between items-start gap-2'>
          <span className='text-lg leading-tight font-semibold text-foreground line-clamp-2 group-hover:text-isra-primary transition-colors cursor-default'>
            {room.name}
          </span>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <Badge variant='outline' className='text-isra-cyan border-isra-cyan/50 bg-isra-cyan/10'>
              <DoorOpen className='w-3 h-3 mr-1' />
              Комната
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 hover:bg-isra-medium/30 hover:text-isra-primary transition-colors'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {onView && (
                  <DropdownMenuItem onClick={() => onView(room.id)}>
                    <Eye className='h-4 w-4 mr-2' />
                    Просмотр
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(room.id)}>
                    <Edit className='h-4 w-4 mr-2' />
                    Изменить
                  </DropdownMenuItem>
                )}
                {onCopyLink && (
                  <DropdownMenuItem onClick={() => onCopyLink(room.id)}>
                    <Copy className='h-4 w-4 mr-2' />
                    Копировать ссылку
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(room.id)}
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
        {room.description && (
          <p className='text-sm text-muted-foreground line-clamp-3'>{room.description}</p>
        )}

        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Calendar className='h-4 w-4' />
            <span>Создан: {formatDate(room.createdAt, 'long')}</span>
          </div>

          {room.updatedAt !== room.createdAt && (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <FileText className='h-4 w-4' />
              <span>Обновлен: {formatDate(room.updatedAt, 'long')}</span>
            </div>
          )}
        </div>

        <div className='flex justify-between text-xs text-muted-foreground pt-3 border-t border-isra/30'>
          <span className="hover:text-foreground transition-colors">
            ID: {room.id}
          </span>
          <span className="hover:text-foreground transition-colors">
            Пользователь: {
              typeof room.user === 'object' && room.user
                ? room.user.email || room.user.firstName || room.user.lastName || 'Unknown'
                : room.user || 'Unknown'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  )
}