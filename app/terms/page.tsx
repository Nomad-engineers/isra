"use client";

import Link from "next/link";
import { Scale, ArrowLeft, Users, Shield, AlertTriangle, Ban, FileCheck, HelpCircle, Mail } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 border border-indigo-500/20">
              <Scale className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Правила пользования
              </h1>
              <p className="text-gray-400 text-sm mt-1">Terms of Service</p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Настоящие правила регулируют использование сервиса{" "}
            <ExternalLink href="https://isra.kz">Isra.kz</ExternalLink> — платформы для проведения 
            вебинаров и автовебинаров. Используя наш сервис, вы соглашаетесь с данными правилами.
          </p>
        </header>

        {/* Important Notice */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20">
          <p className="text-gray-300">
            Для полного ознакомления с юридическими условиями, пожалуйста, прочитайте также{" "}
            <Link href="/contract" className="text-indigo-400 hover:text-indigo-300">Публичную оферту</Link> и{" "}
            <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Политику конфиденциальности</Link>.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-10">
          {/* Section 1 */}
          <Section icon={<Users className="w-5 h-5" />} number="1" title="Общие положения">
            <Paragraph number="1.1">
              Сервис Isra.kz предоставляет возможность проведения онлайн-вебинаров и автовебинаров 
              для физических и юридических лиц.
            </Paragraph>
            <Paragraph number="1.2">
              Регистрируясь на сайте, вы подтверждаете, что достигли 18-летнего возраста или действуете 
              от имени юридического лица, уполномочены принимать данные условия.
            </Paragraph>
            <Paragraph number="1.3">
              Администрация оставляет за собой право изменять настоящие правила без предварительного 
              уведомления. Актуальная версия всегда доступна на данной странице.
            </Paragraph>
          </Section>

          {/* Section 2 */}
          <Section icon={<FileCheck className="w-5 h-5" />} number="2" title="Использование сервиса">
            <Paragraph number="2.1">
              <Strong>Регистрация:</Strong> Для использования сервиса необходимо создать учетную запись, 
              указав достоверные данные.
            </Paragraph>
            <Paragraph number="2.2">
              <Strong>Учетная запись:</Strong> Вы несете полную ответственность за безопасность своего 
              аккаунта и все действия, совершенные с его использованием.
            </Paragraph>
            <Paragraph number="2.3">
              <Strong>Один аккаунт:</Strong> Создание нескольких учетных записей с целью получения 
              дополнительных тестовых периодов запрещено.
            </Paragraph>
            
            <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-white/5">
              <h4 className="text-white font-semibold mb-3">Возможности сервиса:</h4>
              <ul className="space-y-2">
                <FeatureItem>Создание до 10 виртуальных комнат для вебинаров</FeatureItem>
                <FeatureItem>Проведение автовебинаров по расписанию</FeatureItem>
                <FeatureItem>Организация чатов между участниками</FeatureItem>
                <FeatureItem>Отображение баннеров и интерактивных элементов</FeatureItem>
                <FeatureItem>Запись и воспроизведение сценариев</FeatureItem>
                <FeatureItem>Аналитика активности участников</FeatureItem>
              </ul>
            </div>
          </Section>

          {/* Section 3 */}
          <Section icon={<Ban className="w-5 h-5" />} number="3" title="Запрещенные действия">
            <p className="text-gray-300 mb-4">
              При использовании сервиса запрещается:
            </p>
            
            <div className="space-y-3">
              <ProhibitedItem text="Публикация материалов, нарушающих законодательство Республики Казахстан" />
              <ProhibitedItem text="Использование нецензурных выражений и оскорбительного контента" />
              <ProhibitedItem text="Нарушение авторских и смежных прав третьих лиц" />
              <ProhibitedItem text="Распространение спама и вредоносного программного обеспечения" />
              <ProhibitedItem text="Попытки несанкционированного доступа к системе" />
              <ProhibitedItem text="Использование сервиса для мошеннических действий" />
              <ProhibitedItem text="Перепродажа услуг без участия в партнерской программе" />
              <ProhibitedItem text="Любые действия, наносящие ущерб репутации сервиса" />
            </div>
          </Section>

          {/* Section 4 */}
          <Section icon={<AlertTriangle className="w-5 h-5" />} number="4" title="Ответственность и ограничения">
            <Paragraph number="4.1">
              <Strong>Ответственность пользователя:</Strong> Вы несете полную ответственность за контент, 
              который публикуете и распространяете через сервис.
            </Paragraph>
            <Paragraph number="4.2">
              <Strong>Ограничение ответственности:</Strong> Сервис не несет ответственности за сбои 
              в работе сторонних сервисов (хостинг, YouTube, почтовые службы и т.д.).
            </Paragraph>
            <Paragraph number="4.3">
              <Strong>Техническое обслуживание:</Strong> Администрация может проводить технические работы, 
              временно ограничивая доступ к сервису.
            </Paragraph>
            <Paragraph number="4.4">
              <Strong>Блокировка:</Strong> При нарушении правил аккаунт может быть заблокирован 
              временно или навсегда без предварительного уведомления.
            </Paragraph>
          </Section>

          {/* Section 5 */}
          <Section icon={<Shield className="w-5 h-5" />} number="5" title="Защита данных">
            <Paragraph number="5.1">
              Мы серьезно относимся к защите ваших персональных данных. Подробная информация 
              содержится в нашей{" "}
              <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">
                Политике конфиденциальности
              </Link>.
            </Paragraph>
            <Paragraph number="5.2">
              Мы используем файлы cookie для улучшения работы сервиса. Подробнее читайте в{" "}
              <Link href="/cookies" className="text-pink-400 hover:text-pink-300">
                Политике Cookie
              </Link>.
            </Paragraph>
            <Paragraph number="5.3">
              Ваши учетные данные (логин, пароль) должны храниться в тайне. При подозрении на 
              несанкционированный доступ немедленно сообщите нам.
            </Paragraph>
          </Section>

          {/* Section 6 */}
          <Section icon={<Scale className="w-5 h-5" />} number="6" title="Оплата и возврат">
            <Paragraph number="6.1">
              Услуги предоставляются на условиях предоплаты. Тарифы и цены указаны в разделе{" "}
              <Link href="/tariffs" className="text-indigo-400 hover:text-indigo-300">Тарифы</Link>.
            </Paragraph>
            <Paragraph number="6.2">
              Подробная информация о процедуре оплаты доступна на странице{" "}
              <Link href="/payment" className="text-green-400 hover:text-green-300">Процедура оплаты</Link>.
            </Paragraph>
            <Paragraph number="6.3">
              Условия возврата средств описаны в{" "}
              <Link href="/refund" className="text-orange-400 hover:text-orange-300">Политике возврата</Link>.
            </Paragraph>
          </Section>

          {/* Section 7 */}
          <Section icon={<HelpCircle className="w-5 h-5" />} number="7" title="Техническая поддержка">
            <Paragraph number="7.1">
              Техническая поддержка предоставляется через электронную почту и раздел помощи на сайте.
            </Paragraph>
            <Paragraph number="7.2">
              Время ответа зависит от загруженности службы поддержки и сложности вопроса.
            </Paragraph>
            <Paragraph number="7.3">
              При обращении в поддержку, пожалуйста, предоставляйте максимально полную информацию о проблеме.
            </Paragraph>
          </Section>

          {/* Section 8 */}
          <Section icon={<FileCheck className="w-5 h-5" />} number="8" title="Заключительные положения">
            <Paragraph number="8.1">
              Настоящие правила вступают в силу с момента регистрации на сайте.
            </Paragraph>
            <Paragraph number="8.2">
              Все споры решаются путем переговоров, а при невозможности достижения согласия — 
              в судебном порядке по законодательству Республики Казахстан.
            </Paragraph>
            <Paragraph number="8.3">
              Для получения полной юридической информации ознакомьтесь с{" "}
              <Link href="/contract" className="text-purple-400 hover:text-purple-300">Публичной офертой</Link>.
            </Paragraph>
          </Section>

          {/* Contact */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#161616] border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">Контакты</h3>
            </div>
            <p className="text-gray-300 mb-3">
              По всем вопросам, связанным с использованием сервиса, обращайтесь:
            </p>
            <a 
              href="mailto:shyrak.trz@gmail.com" 
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              shyrak.trz@gmail.com
            </a>
          </div>

          {/* Related Documents */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#161616] border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Связанные документы</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DocumentLink href="/contract" title="Публичная оферта" color="purple" />
              <DocumentLink href="/privacy" title="Политика конфиденциальности" color="cyan" />
              <DocumentLink href="/payment" title="Процедура оплаты" color="green" />
              <DocumentLink href="/refund" title="Политика возврата" color="orange" />
              <DocumentLink href="/cookies" title="Политика Cookie" color="pink" />
              <DocumentLink href="/company" title="Реквизиты компании" color="amber" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <nav className="flex flex-wrap gap-4 mb-6">
            <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-indigo-400 text-sm">
              Правила пользования
            </Link>
            <Link href="/contract" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
              Публичная оферта
            </Link>
            <Link href="/refund" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              Правила возврата
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
              Политика Cookie
            </Link>
          </nav>
          <p className="text-gray-500 text-sm">© 2025 isra.kz — Все права защищены</p>
        </footer>
      </div>
    </div>
  );
}

// Component helpers
function Section({ icon, number, title, children }: { icon: React.ReactNode; number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-8">
      <h2 className="flex items-center gap-3 text-xl font-bold text-white mb-6">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-indigo-800/30 border border-indigo-500/20 text-indigo-400">
          {icon}
        </span>
        <span className="text-gray-500 font-mono text-sm mr-1">{number}.</span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Paragraph({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <p className="text-gray-300 leading-relaxed">
      <span className="text-gray-500 font-mono text-sm mr-2">{number}</span>
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="text-white font-semibold">{children}</strong>;
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

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="text-gray-400 flex items-start gap-2">
      <span className="text-green-400 mt-0.5">✓</span>
      {children}
    </li>
  );
}

function ProhibitedItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
      <span className="text-red-400 mt-0.5">✕</span>
      <p className="text-gray-300">{text}</p>
    </div>
  );
}

function DocumentLink({ href, title, color }: { href: string; title: string; color: string }) {
  const colors: Record<string, string> = {
    purple: "hover:text-purple-400",
    cyan: "hover:text-cyan-400",
    green: "hover:text-green-400",
    orange: "hover:text-orange-400",
    pink: "hover:text-pink-400",
    amber: "hover:text-amber-400"
  };
  
  return (
    <Link 
      href={href} 
      className={`p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-300 ${colors[color]}`}
    >
      {title}
    </Link>
  );
}
