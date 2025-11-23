import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Clock } from 'lucide-react'

export default function TariffsPage() {
  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <Card className='w-full max-w-md border-isra bg-isra-medium/80 backdrop-blur-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='flex items-center justify-center gap-2 text-white'>
            <CreditCard className='h-6 w-6 text-isra-cyan' />
            В разработке
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center space-y-4'>
          <div className='flex justify-center mb-4'>
            <Clock className='h-12 w-12 text-isra-cyan' />
          </div>
          <p className='text-gray-300 text-sm leading-relaxed'>
            Страница управления тарифами находится в разработке.
          </p>
          <p className='text-gray-300 text-sm leading-relaxed'>
            Скоро вы сможете легко изменять свой план, просматривать историю платежей и управлять подпиской.
          </p>
          <div className='pt-2'>
            <p className='text-isra-cyan text-xs font-medium'>
              Ожидайте обновлений в ближайшее время
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}