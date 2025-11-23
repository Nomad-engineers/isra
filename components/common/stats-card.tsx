import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isUp: boolean
  }
  className?: string
  tooltipText?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  tooltipText
}: StatsCardProps) {
  const cardContent = (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg hover:shadow-isra-primary/10 hover:-translate-y-1 border-isra/30 card-glass",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        {Icon && (
          <div className="p-1.5 rounded-md bg-isra-medium/50">
            <Icon className="h-4 w-4 text-isra-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gradient-accent">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full",
              trend.isUp
                ? "text-green-400 bg-green-500/10"
                : "text-red-400 bg-red-500/10"
            )}>
              {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground ml-2">от прошлого периода</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (tooltipText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return cardContent
}