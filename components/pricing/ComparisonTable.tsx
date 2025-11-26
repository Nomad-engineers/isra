import React from 'react'
import { Check, X } from 'lucide-react'

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

interface ComparisonTableProps {
  plans: Plan[]
}

const comparisonFeatures = [
  {
    category: 'Пользователи',
    features: [
      { name: 'Макс. пользователей', values: [5, 15, 50, '∞'] },
      { name: 'Одновременных сессий', values: [5, 15, 100, 500] }
    ]
  },
  {
    category: 'Хранилище',
    features: [
      { name: 'Объем хранилища', values: ['10 ГБ', '50 ГБ', '200 ГБ', '1 ТБ'] },
      { name: 'Макс. размер файла', values: ['100 МБ', '500 МБ', '2 ГБ', '10 ГБ'] }
    ]
  },
  {
    category: 'Аналитика',
    features: [
      { name: 'Базовая аналитика', values: [true, true, true, true] },
      { name: 'Расширенная аналитика', values: [false, true, true, true] },
      { name: 'Кастомные отчеты', values: [false, false, true, true] },
      { name: 'Экспорт данных', values: [true, true, true, true] }
    ]
  },
  {
    category: 'Поддержка',
    features: [
      { name: 'Email поддержка', values: [true, true, true, true] },
      { name: 'Чат поддержка', values: [false, true, true, true] },
      { name: 'Телефонная поддержка', values: [false, false, true, true] },
      { name: '24/7 поддержка', values: [false, false, false, true] },
      { name: 'Персональный менеджер', values: [false, false, true, true] }
    ]
  },
  {
    category: 'Интеграции',
    features: [
      { name: 'API доступ', values: [true, true, true, true] },
      { name: 'Webhooks', values: [true, true, true, true] },
      { name: 'Интеграции с CRM', values: [false, true, true, true] },
      { name: 'SSO аутентификация', values: [false, false, false, true] }
    ]
  },
  {
    category: 'Безопасность',
    features: [
      { name: 'Двухфакторная аутентификация', values: [true, true, true, true] },
      { name: 'Резервное копирование', values: [true, true, true, true] },
      { name: 'Шифрование данных', values: [true, true, true, true] },
      { name: 'SLA гарантии', values: [false, false, false, true] }
    ]
  }
]

export function ComparisonTable({ plans }: ComparisonTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <th className="text-left p-6 font-bold text-gray-300 uppercase tracking-wider text-sm">Возможность</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center p-6 font-bold min-w-[140px]">
                    <div className="text-white text-lg">{plan.name}</div>
                    <div className="text-sm text-blue-400 font-normal">{plan.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((category, categoryIndex) => (
                <React.Fragment key={category.category}>
                  <tr className="bg-gradient-to-r from-gray-800/50 to-gray-700/30">
                    <td
                      colSpan={plans.length + 1}
                      className="px-6 py-4 font-bold text-gray-200 text-sm uppercase tracking-wider"
                    >
                      {category.category}
                    </td>
                  </tr>
                  {category.features.map((feature, featureIndex) => (
                    <tr
                      key={`${categoryIndex}-${featureIndex}`}
                      className="border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/20 transition-colors duration-200"
                    >
                      <td className="p-6 text-gray-200 text-sm font-medium">{feature.name}</td>
                      {feature.values.map((value, valueIndex) => (
                        <td key={valueIndex} className="p-6 text-center">
                          {typeof value === 'boolean' ? (
                            value ? (
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                                <X className="w-4 h-4 text-gray-500" />
                              </div>
                            )
                          ) : (
                            <span className="text-gray-200 text-sm font-medium inline-block px-3 py-1 bg-gray-700/50 rounded-lg">
                              {value}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-lg font-bold text-blue-400">{plan.price}</div>
            </div>
            <div className="space-y-6">
              {comparisonFeatures.map((category) => (
                <div key={category.category}>
                  <h4 className="font-bold text-gray-200 text-sm uppercase tracking-wider mb-3">
                    {category.category}
                  </h4>
                  <div className="space-y-3">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{feature.name}</span>
                        {(() => {
                          const planIndex = plans.findIndex(p => p.id === plan.id);
                          const value = feature.values[planIndex];
                          return typeof value === 'boolean' ? (
                            value ? (
                              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                                <X className="w-3 h-3 text-gray-500" />
                              </div>
                            )
                          ) : (
                            <span className="text-gray-200 text-sm font-medium px-2 py-1 bg-gray-700/50 rounded-lg">
                              {value}
                            </span>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}