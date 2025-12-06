"use client";

import Link from "next/link";
import { CreditCard, ArrowLeft, UserPlus, Wallet, ShoppingCart, Smartphone, CheckCircle, AlertCircle, RefreshCw, Banknote } from "lucide-react";

export default function PaymentProcedurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          На главную
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/20">
              <CreditCard className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Процедура оплаты
              </h1>
              <p className="text-gray-400 text-sm mt-1">Payment Procedure</p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Данная процедура описывает шаги для пополнения личного счета, оплаты за тарифы и удержания средств 
            за вебинары на сайте <ExternalLink href="https://isra.kz">isra.kz</ExternalLink>, 
            управляемом <Link href="/company" className="text-cyan-400 hover:text-cyan-300">ИП Shyrak</Link>.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Step 1 */}
          <Step 
            icon={<UserPlus className="w-5 h-5" />} 
            number={1} 
            title="Регистрация и вход в аккаунт"
          >
            <p className="text-gray-300 mb-4">
              Если у вас нет аккаунта, вам необходимо зарегистрироваться на сайте{" "}
              <ExternalLink href="https://isra.kz">isra.kz</ExternalLink>. Для этого:
            </p>
            <StepList items={[
              "Перейдите на главную страницу сайта и нажмите кнопку \"Регистрация\"",
              "Заполните форму, указав необходимые данные: Имя, E-mail, Телефон и другие запрашиваемые сведения",
              "Подтвердите регистрацию, следуя инструкциям, отправленным на вашу электронную почту"
            ]} />
            <p className="text-gray-300 mt-4">
              Войдите в свою учетную запись с помощью логина и пароля.
            </p>
          </Step>

          {/* Step 2 */}
          <Step 
            icon={<Wallet className="w-5 h-5" />} 
            number={2} 
            title="Переход к пополнению счета"
          >
            <StepList items={[
              <>После входа в аккаунт вы будете перенаправлены на страницу <ExternalLink href="https://isra.kz/rooms">https://isra.kz/rooms</ExternalLink></>,
              "В верхней части страницы нажмите кнопку \"Пополнить\""
            ]} />
          </Step>

          {/* Step 3 */}
          <Step 
            icon={<ShoppingCart className="w-5 h-5" />} 
            number={3} 
            title="Оформление заказа на пополнение счета"
          >
            <StepList items={[
              "Укажите сумму пополнения в тенге",
              "Заполните данные: Имя, E-mail, Телефон",
              "Нажмите кнопку \"Оформить заказ\""
            ]} />
          </Step>

          {/* Step 4 */}
          <Step 
            icon={<Smartphone className="w-5 h-5" />} 
            number={4} 
            title="Выбор метода эквайринга"
          >
            <p className="text-gray-300 mb-4">
              На следующем экране выберите метод эквайринга для завершения платежа:
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <PaymentMethod 
                name="Freedompay" 
                features={[
                  "Apple Pay, Google Pay, Samsung Pay",
                  "Оплата с балансов мобильных телефонов",
                  "Visa, Mastercard",
                  "Банки-терминалы"
                ]}
                color="blue"
              />
              <PaymentMethod 
                name="ROBOKASSA" 
                features={[
                  "Visa",
                  "Mastercard"
                ]}
                color="green"
              />
            </div>

            <p className="text-gray-300">
              Введите данные платежного средства и подтвердите платеж.
            </p>
          </Step>

          {/* Step 5 */}
          <Step 
            icon={<CheckCircle className="w-5 h-5" />} 
            number={5} 
            title="Подтверждение оплаты"
          >
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-gray-300">
                После успешного завершения платежа вы получите подтверждение об оплате на указанный адрес электронной почты.
              </p>
            </div>
          </Step>

          {/* Step 6 */}
          <Step 
            icon={<Banknote className="w-5 h-5" />} 
            number={6} 
            title="Оплата за тарифы из личного кабинета"
          >
            <StepList items={[
              "После пополнения счета перейдите на вкладку \"Тарифы\" в верхнем меню личного кабинета",
              "Выберите тариф, который вы хотите подключить, и нажмите на него",
              "Подтвердите оплату, и с вашего счета будет списана указанная сумма",
              "После успешного списания средств тариф будет подключен"
            ]} />
          </Step>

          {/* Step 7 */}
          <Step 
            icon={<CreditCard className="w-5 h-5" />} 
            number={7} 
            title='Основной тариф "Basic" и удержание средств'
          >
            <StepList items={[
              "Если не подключены другие тарифы, то по умолчанию остается активным основной тариф \"Basic\"",
              "За каждое место на вебинаре будет списываться сумма за каждого человека, который зашел на вебинар, согласно указанным на тарифе суммам во вкладке \"Тарифы\"",
              "Если запланирован автовебинар, то за проведение вебинара также будут списываться средства согласно условиям тарифа"
            ]} />
          </Step>

          {/* Step 8 */}
          <Step 
            icon={<AlertCircle className="w-5 h-5" />} 
            number={8} 
            title="Недостаточный баланс для оплаты тарифа"
            variant="warning"
          >
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-gray-300">
                Если на вашем счете недостаточно средств для оплаты выбранного тарифа, появится ошибка о том, 
                что на счете недостаточно средств для подключения тарифа. В этом случае вам необходимо пополнить 
                баланс и повторить попытку.
              </p>
            </div>
          </Step>

          {/* Step 9 */}
          <Step 
            icon={<RefreshCw className="w-5 h-5" />} 
            number={9} 
            title="Возврат средств и отмена заказов"
          >
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-gray-300 mb-3">
                Если вам необходимо отменить заказ или услугу и вернуть средства, пожалуйста, свяжитесь с нами 
                по электронной почте:{" "}
                <a href="mailto:shyrak.trz@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                  shyrak.trz@gmail.com
                </a>
              </p>
              <p className="text-gray-400 text-sm">
                Возвраты осуществляются в течение 3-14 рабочих дней после подтверждения запроса.
              </p>
            </div>
            <div className="mt-4">
              <Link href="/refund" className="text-cyan-400 hover:text-cyan-300 text-sm inline-flex items-center gap-1">
                Подробнее о политике возврата →
              </Link>
            </div>
          </Step>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <nav className="flex flex-wrap gap-4 mb-6">
            <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
              Политика конфиденциальности
            </Link>
            <Link href="/contract" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
              Публичная оферта
            </Link>
            <Link href="/payment" className="text-green-400 text-sm">
              Процедура оплаты
            </Link>
            <Link href="/refund" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
              Правила возврата
            </Link>
          </nav>
          <p className="text-gray-500 text-sm">© 2025 isra.kz — Все права защищены</p>
        </footer>
      </div>
    </div>
  );
}

// Component helpers
function Step({ icon, number, title, children, variant = "default" }: { 
  icon: React.ReactNode; 
  number: number; 
  title: string; 
  children: React.ReactNode;
  variant?: "default" | "warning";
}) {
  const colors = {
    default: "from-green-600/30 to-green-800/30 border-green-500/20 text-green-400",
    warning: "from-amber-600/30 to-amber-800/30 border-amber-500/20 text-amber-400"
  };
  
  return (
    <section className="relative">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colors[variant]} border`}>
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-gray-500 font-mono text-sm">{number}.</span>
            {title}
          </h2>
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function StepList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-gray-300 flex items-start gap-2">
          <span className="text-green-400 mt-1.5 flex-shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PaymentMethod({ name, features, color }: { name: string; features: string[]; color: "blue" | "green" }) {
  const colors = {
    blue: "from-blue-600/20 to-blue-800/20 border-blue-500/20",
    green: "from-green-600/20 to-green-800/20 border-green-500/20"
  };
  const textColors = {
    blue: "text-blue-400",
    green: "text-green-400"
  };
  
  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border`}>
      <h4 className={`font-semibold ${textColors[color]} mb-2`}>{name}</h4>
      <ul className="space-y-1">
        {features.map((feature, i) => (
          <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
            <span className="text-gray-500 mt-0.5">•</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-cyan-400 hover:text-cyan-300 transition-colors"
    >
      {children}
    </a>
  );
}

