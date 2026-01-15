'use client'

import { useState, useRef, useEffect } from 'react'
import { FolderOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface GenericImagePickerProps {
  label: string
  description?: string
  currentImage?: string
  onImageSelect: (file: File | null) => void
  onUrlChange: (url: string) => void
  aspectRatio?: 'square' | 'banner'
  className?: string
  onUpload?: (file: File) => Promise<string>
}

export function GenericImagePicker({
  label,
  description,
  currentImage,
  onImageSelect,
  onUrlChange,
  aspectRatio = 'square',
  className = '',
  onUpload,
}: GenericImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Обновляем previewUrl когда currentImage меняется
  useEffect(() => {
    console.log(`[${label}] currentImage changed:`, currentImage)
    setPreviewUrl(currentImage)
  }, [currentImage, label])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    onImageSelect(file)

    if (onUpload) {
      setIsUploading(true)
      try {
        const uploadedUrl = await onUpload(file)
        onUrlChange(uploadedUrl) 
        setPreviewUrl(uploadedUrl) 
      } catch (error) {
        console.error('Failed to upload:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
useEffect(() => {
    console.log(`[${label}] currentImage changed:`, currentImage)
    if (currentImage) {
      setPreviewUrl(currentImage)
    }
  }, [currentImage, label])
  return (
    <div className={cn('space-y-3', className)}>
      <Label className="text-sm font-normal text-foreground">{label}</Label>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <Button
        type="button"
        variant="outline"
        onClick={handleUploadClick}
        disabled={isUploading}
        className="w-full justify-start gap-2 h-11 bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary font-normal"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Загрузка...
          </>
        ) : (
          <>
            <FolderOpen className="h-4 w-4" />
            Выбрать {label.toLowerCase()}
          </>
        )}
      </Button>

      <div
        className={cn(
          "relative bg-white rounded-lg overflow-hidden border",
          aspectRatio === 'square' ? 'w-full h-[200px]' : 'w-full h-[200px]'
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="w-full h-full object-contain bg-white"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="text-center text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-muted/50 flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-xs">{label}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}