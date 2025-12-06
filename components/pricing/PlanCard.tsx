import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  badge: string | null
  isCurrent: boolean
}

interface PlanCardProps {
  plan: Plan
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <Card className={`relative bg-card border-border hover:border-primary/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl group ${plan.isCurrent ? 'ring-2 ring-primary shadow-primary/20' : 'hover:shadow-primary/10'}`}>
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg ${
              plan.badge === 'Текущий'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse'
            }`}
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      <CardContent className="p-8 relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg"></div>

        <div className="text-center mb-8 relative">
          <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
            {plan.name}
          </h3>
          <div className="flex items-baseline justify-center gap-2 mb-3">
            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              {plan.price}
            </span>
            <span className="text-muted-foreground text-lg">{plan.period}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
        </div>

        <div className="space-y-4 mb-8 relative">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 group/item">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-foreground transition-colors duration-300">
                {typeof feature === 'string' ? feature : JSON.stringify(feature)}
              </span>
            </div>
          ))}
        </div>

        <Button
          className={`w-full py-3 text-base font-semibold transition-all duration-300 ${
            plan.isCurrent
              ? 'bg-muted hover:bg-muted/80 text-muted-foreground cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white transform hover:scale-105 hover:shadow-lg'
          }`}
          variant={plan.isCurrent ? 'secondary' : 'default'}
          disabled={plan.isCurrent}
        >
          {plan.isCurrent ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Текущий тариф
            </span>
          ) : (
            'Выбрать тариф'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}