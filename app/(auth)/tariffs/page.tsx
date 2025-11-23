import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, CreditCard, Clock, Users, Video, Settings, Star } from 'lucide-react'

const plans = [
  {
    name: 'Бесплатный',
    price: '0₽',
    description: 'Для тех, кто начинает',
    features: [
      { text: 'До 10 участников', available: true },
      { text: 'До 3 вебинаров в месяц', available: true },
      { text: 'Базовая аналитика', available: true },
      { text: 'Запись вебинаров', available: false },
      { text: 'Техническая поддержка', available: false },
      { text: 'Белый брендинг', available: false },
    ],
    current: false,
  },
  {
    name: 'PRO',
    price: '1,990₽',
    period: '/мес',
    description: 'Для профессионалов',
    features: [
      { text: 'До 100 участников', available: true },
      { text: 'Безлимитные вебинары', available: true },
      { text: 'Расширенная аналитика', available: true },
      { text: 'Запись вебинаров', available: true },
      { text: 'Приоритетная поддержка', available: true },
      { text: 'Белый брендинг', available: false },
    ],
    current: true,
    popular: true,
  },
  {
    name: 'Бизнес',
    price: '4,990₽',
    period: '/мес',
    description: 'Для компаний',
    features: [
      { text: 'До 500 участников', available: true },
      { text: 'Безлимитные вебинары', available: true },
      { text: 'Продвинутая аналитика', available: true },
      { text: 'Запись вебинаров в HD', available: true },
      { text: 'Персональный менеджер', available: true },
      { text: 'Белый брендинг', available: true },
    ],
    current: false,
  },
]

export default function TariffsPage() {
  return (
    <div className='space-y-8'>
      <div className='text-center space-y-4'>
        <h1 className='text-3xl font-bold tracking-tight'>Тарифные планы</h1>
        <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
          Выберите подходящий план для ваших задач. Можете изменить или отменить подписку в любой момент.
        </p>
      </div>

      {/* Заглушка о разработке */}
      <Card className='border-yellow-200 bg-yellow-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-yellow-800'>
            <Settings className='h-5 w-5' />
            В разработке
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-yellow-700'>
            Страница управления тарифами находится в разработке. Скоро вы сможете легко изменять свой план,
            просматривать историю платежей и управлять подпиской.
          </p>
        </CardContent>
      </Card>

      {/* Тарифные планы */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.popular
                ? 'border-primary shadow-lg scale-105'
                : 'border-gray-200'
            } ${plan.current ? 'ring-2 ring-primary' : ''}`}
          >
            {plan.popular && (
              <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                <Badge className='px-3 py-1'>
                  <Star className='h-3 w-3 mr-1' />
                  Популярный
                </Badge>
              </div>
            )}

            {plan.current && (
              <div className='absolute top-4 right-4'>
                <Badge variant='default'>Текущий</Badge>
              </div>
            )}

            <CardHeader className='text-center pb-4'>
              <CardTitle className='text-xl'>{plan.name}</CardTitle>
              <div className='space-y-1'>
                <div className='flex items-baseline justify-center gap-1'>
                  <span className='text-3xl font-bold'>{plan.price}</span>
                  {plan.period && (
                    <span className='text-muted-foreground text-sm'>{plan.period}</span>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>{plan.description}</p>
              </div>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                {plan.features.map((feature, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    {feature.available ? (
                      <Check className='h-4 w-4 text-green-600 flex-shrink-0' />
                    ) : (
                      <X className='h-4 w-4 text-gray-400 flex-shrink-0' />
                    )}
                    <span className={`text-sm ${feature.available ? '' : 'text-muted-foreground'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  plan.current
                    ? 'bg-muted text-muted-foreground hover:bg-muted'
                    : plan.popular
                    ? 'bg-primary'
                    : 'bg-background border-2 border-input hover:bg-accent'
                }`}
                variant={plan.current ? 'secondary' : 'default'}
                disabled={plan.current}
              >
                {plan.current ? 'Текущий план' : 'Выбрать план'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Часто задаваемые вопросы</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Можно ли изменить тариф?</h4>
              <p className='text-sm text-muted-foreground'>
                Да, вы можете изменить тариф в любой момент. При повышении тарифа разница будет
                списана пропорционально оставшимся дням в месяце.
              </p>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium'>Как происходит оплата?</h4>
              <p className='text-sm text-muted-foreground'>
                Оплата происходит ежемесячно автоматически. Вы можете отменить подписку
                в любой момент, и доступ останется до конца оплаченного периода.
              </p>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium'>Есть ли бесплатный период?</h4>
              <p className='text-sm text-muted-foreground'>
                Да, для новых пользователей доступен 14-дневный бесплатный период на тариф PRO.
              </p>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium'>Что происходит с данными при отмене?</h4>
              <p className='text-sm text-muted-foreground'>
                Все ваши данные и записи вебинаров сохраняются. При возобновлении подписки
                вы получите доступ ко всем функциям снова.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}