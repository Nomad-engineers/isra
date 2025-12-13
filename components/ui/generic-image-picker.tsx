'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GenericImagePickerProps {
  label: string
  description?: string
  currentImage?: string
  onImageSelect: (file: File | null) => void
  onUrlChange?: (url: string) => void
  className?: string
  aspectRatio?: 'square' | 'video' | 'banner'
  maxSize?: number // in MB
}

export function GenericImagePicker({
  label,
  description,
  currentImage,
  onImageSelect,
  onUrlChange,
  className,
  aspectRatio = 'square',
  maxSize = 5
}: GenericImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImage || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getDimensions = () => {
    switch (aspectRatio) {
      case 'square':
        return 'w-32 h-32'
      case 'video':
        return 'w-48 h-32'
      case 'banner':
        return 'w-full h-24 max-w-md'
      default:
        return 'w-32 h-32'
    }
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Размер файла не должен превышать ${maxSize} МБ`)
      return
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Поддерживаются только форматы: JPG, PNG, WEBP')
      return
    }

    setIsUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      setIsUploading(false)
      onImageSelect(file)
      setUrlMode(false)
    }

    reader.onerror = () => {
      toast.error('Ошибка при чтении файла')
      setIsUploading(false)
    }

    reader.readAsDataURL(file)
  }, [onImageSelect, maxSize])

  const handleUrlChange = useCallback((url: string) => {
    setImageUrl(url)
    if (onUrlChange) {
      onUrlChange(url)
    }
  }, [onUrlChange])

  const handleUrlSubmit = useCallback(() => {
    if (imageUrl) {
      setPreview(imageUrl)
      onImageSelect(null) // Pass null to indicate file upload, but URL is used
      setUrlMode(false)
    }
  }, [imageUrl, onImageSelect])

  const handleClick = () => {
    if (urlMode) {
      handleUrlSubmit()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setImageUrl('')
    onImageSelect(null)
    if (onUrlChange) {
      onUrlChange('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = preview || currentImage || imageUrl

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center",
            getDimensions()
          )}>
            {displayImage ? (
              <img
                src={displayImage}
                alt={label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">
                  {aspectRatio === 'banner' ? 'Баннер' : aspectRatio === 'video' ? 'Видео' : 'Логотип'}
                </span>
              </div>
            )}
          </div>

          {displayImage && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {!urlMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Загрузка...' : displayImage ? 'Изменить' : 'Загрузить'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUrlMode(true)}
              >
                Ввести URL
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl}
                >
                  Применить
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUrlMode(false)
                    setImageUrl(currentImage || '')
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {displayImage && !urlMode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              Удалить
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label={`Загрузить ${label}`}
        />
      </div>
    </div>
  )
}