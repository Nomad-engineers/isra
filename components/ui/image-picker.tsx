'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'

interface ImagePickerProps {
  currentAvatar?: string
  firstName?: string
  lastName?: string
  onImageSelect: (file: File | null) => void
  className?: string
}

export function ImagePicker({ currentAvatar, firstName, lastName, onImageSelect, className }: ImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5 МБ')
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
    }

    reader.onerror = () => {
      toast.error('Ошибка при чтении файла')
      setIsUploading(false)
    }

    reader.readAsDataURL(file)
  }, [onImageSelect])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreview(null)
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayAvatar = preview || currentAvatar

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={displayAvatar} alt="Аватар" />
          <AvatarFallback className="text-lg">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        {displayAvatar && (
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

      <div>
        <h3 className="text-lg font-medium">Аватар профиля</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Загрузите изображение для вашего профиля (JPG, PNG, WEBP, до 5 МБ)
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Загрузка...' : displayAvatar ? 'Изменить аватар' : 'Загрузить аватар'}
          </Button>

          {displayAvatar && (
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
          aria-label="Загрузить аватар"
        />
      </div>
    </div>
  )
}