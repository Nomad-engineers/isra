import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

interface WebinarBannerProps {
  show: boolean
  text?: string
  buttonText?: string
  buttonUrl?: string
}

export function WebinarBanner({ show, text, buttonText, buttonUrl }: WebinarBannerProps) {
  if (!show || !text) return null

  const handleButtonClick = () => {
    if (buttonUrl) {
      window.open(buttonUrl, '_blank')
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 m-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/20 text-white border-white/30">
              Важное объявление
            </Badge>
          </div>
          <p className="text-white font-medium leading-relaxed">{text}</p>
        </div>

        {buttonText && buttonUrl && (
          <Button
            onClick={handleButtonClick}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 shrink-0"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  )
}