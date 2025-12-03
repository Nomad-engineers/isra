import { Loader2 } from 'lucide-react'

export default function ReportsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Загрузка отчетов...</p>
      </div>
    </div>
  )
}