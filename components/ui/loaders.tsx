import { Loader2 } from 'lucide-react'
import { Skeleton } from './skeleton'

export function PageLoader() {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='text-center space-y-4'>
        <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
        <p className='text-muted-foreground'>Загрузка...</p>
      </div>
    </div>
  )
}

export function InlineLoader() {
  return (
    <div className='flex items-center justify-center py-8'>
      <Loader2 className='h-6 w-6 animate-spin text-primary' />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className='rounded-lg border'>
      <div className='p-6 space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
        <Skeleton className='h-20 w-full' />
        <div className='flex justify-between'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-24' />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex items-center space-x-4'>
          <Skeleton className='h-12 w-12 rounded-full' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className='rounded-lg border p-6'>
      <div className='space-y-3'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-8 w-16' />
      </div>
    </div>
  )
}