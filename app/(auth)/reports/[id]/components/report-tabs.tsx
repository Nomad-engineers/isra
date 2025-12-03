import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Monitor,
  Users,
  MessageSquare,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react'

interface ReportTab {
  id: string
  label: string
  icon: ReactNode
  content: ReactNode
  badge?: string | number
}

interface ReportTabsProps {
  tabs: ReportTab[]
  defaultTab?: string
}

export function ReportTabs({ tabs, defaultTab = 'info' }: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="mb-6">
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              {tab.content}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}

// Предопределенные иконки для удобства
export const ReportIcons = {
  info: <Monitor className="h-4 w-4" />,
  viewers: <Users className="h-4 w-4" />,
  chat: <MessageSquare className="h-4 w-4" />,
  moderators: <Shield className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  activity: <Activity className="h-4 w-4" />
} as const