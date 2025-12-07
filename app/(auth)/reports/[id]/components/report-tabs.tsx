import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Monitor,
  Users,
  UserCheck,
  MessageSquare,
  Shield,
  BarChart3,
  Activity,
  Info,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportTab {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
  badge?: string | number
  badgeColor?: 'default' | 'success' | 'warning' | 'destructive'
}

interface ReportTabsProps {
  tabs: ReportTab[]
  defaultTab?: string
}

export function ReportTabs({ tabs, defaultTab = 'info' }: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const getBadgeVariant = (color?: string) => {
    switch (color) {
      case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'destructive': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-primary/10 text-primary'
    }
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Beautiful Tab Navigation */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-2">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-full min-w-max h-auto p-1.5 gap-1 bg-muted/40 rounded-xl">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative flex items-center gap-2 py-3 px-5 rounded-lg font-medium transition-all duration-200",
                      "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900",
                      "data-[state=active]:shadow-md data-[state=active]:shadow-primary/10",
                      "hover:bg-white/50 dark:hover:bg-gray-900/50",
                      "group"
                    )}
                  >
                    <span className={cn(
                      "p-1.5 rounded-md transition-colors",
                      "group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground",
                      "bg-muted"
                    )}>
                      {tab.icon}
                    </span>
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={cn(
                        "ml-1 text-xs px-2 py-0.5 rounded-full font-semibold",
                        getBadgeVariant(tab.badgeColor)
                      )}>
                        {tab.badge}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {tabs.map((tab) => (
            <TabsContent 
              key={tab.id} 
              value={tab.id} 
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="animate-in fade-in-50 duration-300">
                {tab.content}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}

// Предопределенные иконки для удобства
export const ReportIcons = {
  info: <Info className="h-4 w-4" />,
  viewers: <Users className="h-4 w-4" />,
  uniqueViewers: <UserCheck className="h-4 w-4" />,
  chart: <BarChart3 className="h-4 w-4" />,
  chat: <MessageSquare className="h-4 w-4" />,
  moderators: <Shield className="h-4 w-4" />,
  analytics: <TrendingUp className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />
} as const