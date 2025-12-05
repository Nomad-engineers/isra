"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  MousePointer,
  Image,
  Target,
  AlertCircle,
} from 'lucide-react'
import { ConversionStats } from '@/api/reports/types'

interface ConversionsStatsProps {
  stats?: ConversionStats
  totalViewers: number
}

// Данные которые могут приходить с backend
const demoStats = {
  buttonClicks: 12,
  buttonClicksPercent: 7.3,
  bannerClicks: 24,
  bannerClicksPercent: 14.6,
}

export function ConversionsStats({ stats: propStats, totalViewers }: ConversionsStatsProps) {
  const buttonClicks = propStats?.buttonClicks ?? demoStats.buttonClicks
  const bannerClicks = propStats?.bannerClicks ?? demoStats.bannerClicks
  const buttonPercent = totalViewers > 0 ? ((buttonClicks / totalViewers) * 100).toFixed(1) : '0'
  const bannerPercent = totalViewers > 0 ? ((bannerClicks / totalViewers) * 100).toFixed(1) : '0'

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Target className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle className="text-base">Конверсии</CardTitle>
            <p className="text-sm text-muted-foreground">
              Клики по элементам вебинара
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Button clicks */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MousePointer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium">Нажали на кнопку</p>
              <p className="text-sm text-muted-foreground">
                {buttonClicks} из {totalViewers} зрителей
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{buttonPercent}%</p>
          </div>
        </div>

        {/* Banner clicks */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Image className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-medium">Нажали на баннер</p>
              <p className="text-sm text-muted-foreground">
                {bannerClicks} из {totalViewers} зрителей
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{bannerPercent}%</p>
          </div>
        </div>

        {/* Info about missing data */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/30">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Данные о покупках и регистрациях будут доступны после интеграции с платежной системой
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
