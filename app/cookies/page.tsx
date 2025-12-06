"use client";

import Link from "next/link";
import { Cookie, ArrowLeft, Info, Settings, Shield, Eye, Trash2, HelpCircle } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/20">
              <Cookie className="w-8 h-8 text-pink-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Политика использования файлов Cookie
              </h1>
              <p className="text-gray-400 text-sm mt-1">Cookie Policy</p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Настоящая политика объясняет, как сервис <ExternalLink href="https://isra.kz">Isra.kz</ExternalLink>{" "}
            использует файлы cookie и аналогичные технологии для распознавания пользователей при посещении нашего сайта.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <Section icon={<Info className="w-5 h-5" />} number="1" title="Что такое файлы Cookie?">
            <p className="text-gray-300 leading-relaxed">
              Файлы cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве (компьютере, 
              планшете или мобильном телефоне) при посещении веб-сайтов. Они широко используются для обеспечения 
              работы сайтов или повышения эффективности их работы, а также для предоставления информации владельцам сайта.
            </p>
            
            <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-white/5">
              <h4 className="text-white font-medium mb-3">Файлы cookie позволяют:</h4>
              <ul className="space-y-2">
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Идентифицировать ваш браузер и сохранять его настройки
                </li>
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Улучшать качество предоставляемых услуг
                </li>
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Отслеживать тренды активности пользователей
                </li>
                <li className="text-gray-400 flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Запоминать ваши предпочтения и настройки
                </li>
              </ul>
            </div>
          </Section>

          {/* Section 2 */}
          <Section icon={<Settings className="w-5 h-5" />} number="2" title="Типы используемых Cookie">
            <div className="grid gap-4 sm:grid-cols-2">
              <CookieTypeCard 
                title="Необходимые cookie"
                description="Обеспечивают базовую функциональность сайта: навигацию, авторизацию, доступ к защищенным разделам."
                required
              />
              <CookieTypeCard 
                title="Функциональные cookie"
                description="Позволяют запоминать ваши предпочтения: язык, регион, настройки отображения."
              />
              <CookieTypeCard 
                title="Аналитические cookie"
                description="Помогают понять, как посетители взаимодействуют с сайтом, собирая анонимную статистику."
              />
              <CookieTypeCard 
                title="Сессионные cookie"
                description="Временные файлы, которые удаляются после закрытия браузера."
              />
            </div>
          </Section>

          {/* Section 3 */}
          <Section icon={<Eye className="w-5 h-5" />} number="3" title="Какую информацию мы собираем">
            <p className="text-gray-300 leading-relaxed mb-4">
              При использовании нашего сервиса мы автоматически собираем следующую информацию:
            </p>
            
            <div className="space-y-3">
              <InfoItem 
                title="IP-адрес" 
                description="Для определения региона и обеспечения безопасности"
              />
              <InfoItem 
                title="Тип и версия браузера" 
                description="Для оптимизации отображения сайта"
              />
              <InfoItem 
                title="Язык браузера" 
                description="Для предоставления контента на нужном языке"
              />
              <InfoItem 
                title="Дата и время запроса" 
                description="Для анализа активности и отладки"
              />
              <InfoItem 
                title="Источник перехода" 
                description="Для понимания, откуда приходят пользователи"
              />
            </div>
          </Section>

          {/* Section 4 */}
          <Section icon={<Shield className="w-5 h-5" />} number="4" title="Использование данных">
            <Paragraph number="4.1">
              Собранные данные используются исключительно для улучшения работы сервиса и не передаются 
              третьим лицам без вашего согласия, за исключением случаев, предусмотренных законодательством 
              Республики Казахстан.
            </Paragraph>
            <Paragraph number="4.2">
              Мы не используем cookie для отслеживания вашей активности на других сайтах.
            </Paragraph>
            <Paragraph number="4.3">
              Информация, собранная с помощью cookie, может быть использована для:
            </Paragraph>
            <ul className="ml-6 mt-2 space-y-2">
              <li className="text-gray-300 flex items-start gap-2">
                <span className="text-pink-400 mt-1.5">•</span>
                Персонализации вашего опыта использования сервиса
              </li>
              <li className="text-gray-300 flex items-start gap-2">
                <span className="text-pink-400 mt-1.5">•</span>
                Анализа использования и улучшения функциональности
              </li>
              <li className="text-gray-300 flex items-start gap-2">
                <span className="text-pink-400 mt-1.5">•</span>
                Обеспечения безопасности аккаунта
              </li>
              <li className="text-gray-300 flex items-start gap-2">
                <span className="text-pink-400 mt-1.5">•</span>
                Предоставления технической поддержки
              </li>
            </ul>
          </Section>

          {/* Section 5 */}
          <Section icon={<Trash2 className="w-5 h-5" />} number="5" title="Управление файлами Cookie">
            <p className="text-gray-300 leading-relaxed mb-4">
              Вы можете управлять файлами cookie через настройки вашего браузера. Большинство браузеров 
              позволяют:
            </p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <ControlOption text="Просматривать сохраненные cookie" />
              <ControlOption text="Удалять отдельные cookie" />
              <ControlOption text="Блокировать cookie от определенных сайтов" />
              <ControlOption text="Блокировать все cookie" />
              <ControlOption text="Удалять все cookie при закрытии браузера" />
              <ControlOption text="Настроить уведомления о cookie" />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-gray-300 text-sm">
                <strong className="text-amber-400">Внимание:</strong> Отключение cookie может повлиять на функциональность 
                сайта. Некоторые функции могут быть недоступны или работать некорректно.
              </p>
            </div>
          </Section>

          {/* Section 6 */}
          <Section icon={<HelpCircle className="w-5 h-5" />} number="6" title="Дополнительная информация">
            <p className="text-gray-300 leading-relaxed">
              Для получения более подробной информации о том, как мы обрабатываем ваши данные, 
              ознакомьтесь с нашей{" "}
              <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">
                Политикой конфиденциальности
              </Link>.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Если у вас есть вопросы относительно использования cookie, свяжитесь с нами по адресу:{" "}
              <a href="mailto:shyrak.trz@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                shyrak.trz@gmail.com
              </a>
            </p>
            
            <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-gray-400 text-sm">
                Продолжая использовать наш сайт, вы соглашаетесь с использованием файлов cookie в соответствии 
                с настоящей политикой.
              </p>
            </div>
          </Section>
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
            <Link href="/cookies" className="text-pink-400 text-sm">
              Политика Cookie
            </Link>
            <Link href="/company" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
              Реквизиты
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
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600/30 to-pink-800/30 border border-pink-500/20 text-pink-400">
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

function CookieTypeCard({ title, description, required = false }: { 
  title: string; 
  description: string; 
  required?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-white font-medium">{title}</h4>
        {required && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
            Обязательные
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function InfoItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
      <span className="w-2 h-2 rounded-full bg-pink-400 mt-2 flex-shrink-0" />
      <div>
        <p className="text-gray-200 font-medium">{title}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
  );
}

function ControlOption({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
      <span className="text-green-400">✓</span>
      <span className="text-gray-300 text-sm">{text}</span>
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

