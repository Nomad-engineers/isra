import { PlanCard } from "@/components/pricing/PlanCard";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";

const plans = [
  {
    id: "basic",
    name: "BASIC",
    price: "Бесплатно",
    period: "",
    description: "Для малого бизнеса и блогеров",
    features: [
      "По балансу (20₸/участник)",
      "2 комнат",
      "1ГБ хранилище",
      "20.00₸ за автовебинар",
    ],
    badge: null,
    isCurrent: false,
  },
  {
    id: "starter",
    name: "STARTER",
    price: "8 990 ₸",
    period: "/мес",
    description: "Для малого бизнеса и блогеров",
    features: [
      "100 участников",
      "10 комнат",
      "10ГБ хранилище",
      "15.00₸ за автовебинар",
    ],
    badge: null,
    isCurrent: false,
  },
  {
    id: "professional",
    name: "PROFESSIONAL",
    price: "24 990 ₸",
    period: "/мес",
    description: "Для профессионального использования",
    features: [
      "500 участников",
      "50 комнат",
      "50ГБ хранилище",
      "12.00₸ за автовебинар",
    ],
    badge: null,
    isCurrent: false,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "Безлимит",
    period: "",
    description: "Корпоративные решения без ограничений",
    features: [
      "Безлимит участников",
      "Безлимит комнат",
      "100ГБ хранилище",
      "10.00₸ за автовебинар",
    ],
    badge: null,
    isCurrent: false,
  },
];

export default function TariffsPage() {
  return (
    <div className=" text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h1 className="text-4xl font-bold text-white">Баланс и тариф</h1>
          </div>

          <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Текущий баланс
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    0 ₸
                  </span>
                  <span className="text-lg text-gray-500">/ мес</span>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Не указан
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-600/20">
                  Пополнить
                </button>
                <button className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium text-gray-300 transition-all duration-300 border border-gray-600">
                  История
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Выберите подходящий тариф
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Гибкие тарифные планы для любых потребностей вашего бизнеса
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Сравнение тарифов
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Детальное сравнение всех возможностей каждого тарифа
            </p>
          </div>
          <ComparisonTable plans={plans} />
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Часто задаваемые вопросы
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Ответы на популярные вопросы о наших тарифах
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Можно ли изменить тариф?",
                answer:
                  "Да, вы можете изменить тариф в любой момент. Разница в стоимости будет зачтена на следующий период.",
              },
              {
                question: "Какие способы оплаты доступны?",
                answer:
                  "Мы принимаем банковские карты, электронные кошельки и банковские переводы.",
              },
              {
                question: "Есть ли скидки для некоммерческих организаций?",
                answer:
                  "Да, мы предоставляем скидки 20% для образовательных и некоммерческих организаций.",
              },
              {
                question: "Как происходит выставление счетов?",
                answer:
                  "Счета выставляются автоматически в начале каждого расчетного периода и отправляются на email.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-600 transition-colors duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-12 text-center mb-16 border border-blue-700/50">
          <h2 className="text-3xl font-bold text-white mb-4">
            Остались вопросы?
          </h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Наша команда поддержки всегда готова помочь вам выбрать подходящий
            тариф
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-900 hover:bg-gray-100 rounded-xl font-bold transition-all duration-300 transform hover:scale-105">
              Связаться с поддержкой
            </button>
            <button className="px-8 py-4 bg-transparent text-white hover:bg-white/10 border border-white/30 rounded-xl font-bold transition-all duration-300">
              Запросить демо
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
