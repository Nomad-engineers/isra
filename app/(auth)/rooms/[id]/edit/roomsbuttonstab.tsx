'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export interface RoomFileButtonItem {
  id: string
  title: string
  url?: string | null
  fileUrl?: string | null
}

interface RoomFilesButtonsTabProps {
  enabled: boolean
  items: RoomFileButtonItem[]
  localFiles: Record<string, File | null>
  onToggleEnabled: (next: boolean) => void
  onChangeItems: (next: RoomFileButtonItem[]) => void
  onPickFile: (id: string, file: File | null) => void
  onRemoveItem: (id: string) => void
  onAddItem: () => void
}

export function RoomFilesButtonsTab({
  enabled,
  items,
  localFiles,
  onToggleEnabled,
  onChangeItems,
  onPickFile,
  onRemoveItem,
  onAddItem,
}: RoomFilesButtonsTabProps) {
  const handleChange = (id: string, patch: Partial<RoomFileButtonItem>) => {
    onChangeItems(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4'>
        <div className='space-y-1'>
          <p className='text-base font-medium'>Показать файлы для скачивания и произвольные ссылки</p>
          <p className='text-sm text-muted-foreground'>Файлы и ссылки будут показаны пользователям комнаты.</p>
        </div>
        <div className='flex items-center gap-3'>
          <label htmlFor='files-buttons-enabled' className='text-sm font-medium'>
            Вкл/Выкл
          </label>
          <Switch
            id='files-buttons-enabled'
            checked={enabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>
      </div>

      <div className='space-y-4'>
        {items.map((item) => {
          const fileInputId = `files-button-file-${item.id}`
          const localFile = localFiles[item.id]

          return (
            <div key={item.id} className='space-y-4 rounded-lg border p-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label htmlFor={`files-button-url-${item.id}`} className='text-sm font-medium'>
                    Ссылка
                  </label>
                  <Input
                    id={`files-button-url-${item.id}`}
                    type='url'
                    placeholder='https://example.com'
                    value={item.url ?? ''}
                    onChange={(event) => handleChange(item.id, { url: event.target.value })}
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor={`files-button-title-${item.id}`} className='text-sm font-medium'>
                    Название
                  </label>
                  <Input
                    id={`files-button-title-${item.id}`}
                    placeholder='Название кнопки'
                    value={item.title}
                    onChange={(event) => handleChange(item.id, { title: event.target.value })}
                  />
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-3'>
                <input
                  id={fileInputId}
                  type='file'
                  className='hidden'
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    onPickFile(item.id, file)
                  }}
                />
                <Button type='button' variant='outline' asChild>
                  <label htmlFor={fileInputId}>Выбрать файл...</label>
                </Button>
                {localFile ? (
                  <span className='text-xs text-muted-foreground'>{localFile.name}</span>
                ) : item.fileUrl ? (
                  <span className='text-xs text-muted-foreground'>Файл уже загружен</span>
                ) : null}
                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => onRemoveItem(item.id)}
                >
                  Убрать
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Button type='button' variant='outline' onClick={onAddItem}>
        + Добавить файл
      </Button>
    </div>
  )
}
