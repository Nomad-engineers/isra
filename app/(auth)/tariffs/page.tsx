'use client'

import { PlanCard } from '@/components/pricing/PlanCard'
import { ComparisonTable } from '@/components/pricing/ComparisonTable'
import { PageLoader } from '@/components/ui/loaders'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { usePlans } from '@/hooks/use-plans'
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

export default function TariffsPage() {
  const { plans, loading, error, retry, isUsingFallback, currentPlan, planStatus, planEndDate } = usePlans()

  // Show loading state
  if (loading) {
    return (
      <div className='min-h-screen text-foreground'>
        <div className='container mx-auto px-4 py-8 max-w-7xl'>
          <PageLoader />
        </div>
      </div>
    )
  }

  // Current plan status display
  const renderCurrentPlanStatus = () => {
    if (!currentPlan) return null

    const statusColors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      trialing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      canceled: 'bg-red-500/20 text-red-400 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }

    const statusLabels = {
      active: 'Активен',
      trialing: 'На испытательном сроке',
      paused: 'Приостановлен',
      canceled: 'Отменен',
      expired: 'Истек',
    }

    return (
      <div className='mb-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-900/20 rounded-xl border border-primary/30'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <CheckCircle className='w-5 h-5 text-green-500' />
            <span className='text-lg font-semibold'>Ваш текущий тариф:</span>
            <span className='text-xl font-bold text-primary'>{currentPlan.name}</span>
            {planStatus && (
              <Badge className={statusColors[planStatus as keyof typeof statusColors]}>
                {statusLabels[planStatus as keyof typeof statusLabels]}
              </Badge>
            )}
          </div>
          {planEndDate && (
            <div className='text-sm text-muted-foreground'>
              Действует до: {new Date(planEndDate).toLocaleDateString('ru-RU')}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Error state with retry
  const renderErrorState = () => {
    if (!error) return null

    return (
      <Alert variant='destructive' className='mb-6'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription className='flex items-center justify-between'>
          <span>{error}</span>
          <Button variant='outline' size='sm' onClick={retry} className='ml-4'>
            <RefreshCw className='w-4 h-4 mr-2' />
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Fallback notification
  const renderFallbackNotification = () => {
    if (!isUsingFallback) return null

    return (
      <Alert variant='warning' className='mb-6'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>Показаны базовые тарифы. Не удается загрузить актуальные предложения.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='min-h-screen text-foreground'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Header Section */}
        <div className='mb-16'>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full'></div>
            <h1 className='text-4xl font-bold text-foreground'>Баланс и тариф</h1>
          </div>

        <div className='bg-card rounded-2xl p-8 border border-border shadow-xl'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6'>
              <div className='space-y-3'>
                <div className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>Текущий баланс</div>
                <div className='flex items-baseline gap-3'>
                  <span className='text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent'>
                    0 ₸
                  </span>
                  <span className='text-lg text-muted-foreground'>/ мес</span>
                </div>
                <div className='text-sm text-muted-foreground flex items-center gap-2'>
                  <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                  {currentPlan ? `Тариф: ${currentPlan.name}` : 'Не указан'}
                </div>
              </div>
              <div className='flex gap-3'>
                <button className='px-8 py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg'>
                  Пополнить
                </button>
                <button className='px-6 py-4 bg-muted hover:bg-muted/80 rounded-xl font-medium text-foreground transition-all duration-300 border border-border'>
                  История
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current plan status */}
        {renderCurrentPlanStatus()}

        {/* Error state */}
        {renderErrorState()}

        {/* Fallback notification */}
        {renderFallbackNotification()}

        {/* Pricing Cards */}
        <div className='mb-20'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-4'>Выберите подходящий тариф</h2>
            <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
              Гибкие тарифные планы для любых потребностей вашего бизнеса
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
              />
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className='mb-20'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-4'>Сравнение тарифов</h2>
            <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
              Детальное сравнение всех возможностей каждого тарифа
            </p>
          </div>
          <ComparisonTable plans={plans} />
        </div>

        {/* FAQ Section */}
        <div className='mb-20'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-4'>Часто задаваемые вопросы</h2>
            <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>Ответы на популярные вопросы о наших тарифах</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[
              {
                question: 'Можно ли изменить тариф?',
                answer:
                  'Да, вы можете изменить тариф в любой момент. Разница в стоимости будет зачтена на следующий период.',
              },
              {
                question: 'Какие способы оплаты доступны?',
                answer: 'Мы принимаем банковские карты, электронные кошельки и банковские переводы.',
              },
              {
                question: 'Есть ли скидки для некоммерческих организаций?',
                answer: 'Да, мы предоставляем скидки 20% для образовательных и некоммерческих организаций.',
              },
              {
                question: 'Как происходит выставление счетов?',
                answer: 'Счета выставляются автоматически в начале каждого расчетного периода и отправляются на email.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className='bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors duration-300'
              >
                <h3 className='text-lg font-semibold text-foreground mb-3'>{faq.question}</h3>
                <p className='text-muted-foreground leading-relaxed'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className='bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-900/30 rounded-2xl p-12 text-center mb-16 border border-primary/20'>
          <h2 className='text-3xl font-bold text-foreground mb-4'>Остались вопросы?</h2>
          <p className='text-muted-foreground text-lg mb-8 max-w-2xl mx-auto'>
            Наша команда поддержки всегда готова помочь вам выбрать подходящий тариф
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className='px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold transition-all duration-300 transform hover:scale-105'>
              Связаться с поддержкой
            </button>
            <button className='px-8 py-4 bg-transparent text-foreground hover:bg-muted border border-border rounded-xl font-bold transition-all duration-300'>
              Запросить демо
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
