"use client";

import Link from "next/link";
import { RefreshCw, ArrowLeft, Clock, FileText, Mail, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/20">
              <RefreshCw className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Политика возврата средств
              </h1>
              <p className="text-gray-400 text-sm mt-1">Refund Policy</p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Настоящая политика возврата средств описывает условия и порядок возврата денежных средств 
            за услуги сервиса <ExternalLink href="https://isra.kz">Isra.kz</ExternalLink>, 
            управляемого <Link href="/company" className="text-cyan-400 hover:text-cyan-300">ИП Shyrak</Link>.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Key Info Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Важная информация</h2>
                <p className="text-gray-300">
                  Пользователь имеет право отказаться от услуг в течение <strong className="text-white">14 календарных дней</strong> с даты 
                  получения доступа к Сайту. Возврат осуществляется за минусом суммы за фактически оказанные услуги.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <Section icon={<FileText className="w-5 h-5" />} number="1" title="Общие положения">
            <Paragraph number="1.1">
              Возврат денежных средств осуществляется в соответствии с условиями{" "}
              <Link href="/contract" className="text-cyan-400 hover:text-cyan-300">Публичной оферты</Link> и действующим 
              законодательством Республики Казахстан.
            </Paragraph>
            <Paragraph number="1.2">
              Все услуги Сервиса предоставляются на условиях 100% предоплаты.
            </Paragraph>
            <Paragraph number="1.3">
              При оплате услуг Пользователь подтверждает согласие с условиями настоящей политики возврата.
            </Paragraph>
          </Section>

          {/* Section 2 */}
          <Section icon={<Clock className="w-5 h-5" />} number="2" title="Сроки возврата">
            <div className="grid gap-4 sm:grid-cols-2">
              <TimelineCard 
                title="Период подачи заявки" 
                value="14 дней" 
                description="с момента получения доступа к Сайту"
                color="green"
              />
              <TimelineCard 
                title="Срок обработки возврата" 
                value="3-14 рабочих дней" 
                description="после подтверждения заявки"
                color="blue"
              />
            </div>
          </Section>

          {/* Section 3 */}
          <Section icon={<CheckCircle className="w-5 h-5" />} number="3" title="Условия возврата">
            <Paragraph number="3.1">
              Возврат средств осуществляется при соблюдении следующих условий:
            </Paragraph>
            
            <div className="mt-4 space-y-3">
              <ConditionItem 
                icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                text="Заявка на возврат подана в течение 14 календарных дней с момента оплаты"
              />
              <ConditionItem 
                icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                text="Пользователь предоставил письменное заявление с мотивированными причинами отказа"
              />
              <ConditionItem 
                icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                text="Указаны корректные реквизиты для возврата средств"
              />
              <ConditionItem 
                icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                text="Администратор подтвердил мотивированные причины отказа"
              />
            </div>

            <Paragraph number="3.2" className="mt-6">
              Сумма возврата рассчитывается как разница между оплаченной суммой и стоимостью фактически 
              использованных услуг.
            </Paragraph>
          </Section>

          {/* Section 4 */}
          <Section icon={<XCircle className="w-5 h-5" />} number="4" title="Случаи, когда возврат не осуществляется">
            <div className="space-y-3">
              <ConditionItem 
                icon={<XCircle className="w-5 h-5 text-red-400" />}
                text="Заявка на возврат подана позднее 14 календарных дней с момента получения доступа"
              />
              <ConditionItem 
                icon={<XCircle className="w-5 h-5 text-red-400" />}
                text="Услуги полностью использованы Пользователем"
              />
              <ConditionItem 
                icon={<XCircle className="w-5 h-5 text-red-400" />}
                text="Нарушены условия Публичной оферты со стороны Пользователя"
              />
              <ConditionItem 
                icon={<XCircle className="w-5 h-5 text-red-400" />}
                text="Блокировка аккаунта произошла по причине нарушения правил Сервиса"
              />
              <ConditionItem 
                icon={<XCircle className="w-5 h-5 text-red-400" />}
                text="Бонусные средства, начисленные Сервисом (тестовый период)"
              />
            </div>
          </Section>

          {/* Section 5 */}
          <Section icon={<Mail className="w-5 h-5" />} number="5" title="Порядок подачи заявки на возврат">
            <div className="space-y-4">
              <StepItem number={1} title="Отправьте заявление">
                <p className="text-gray-400 text-sm">
                  Направьте письменное заявление на электронную почту:{" "}
                  <a href="mailto:shyrak.trz@gmail.com" className="text-cyan-400 hover:text-cyan-300">
                    shyrak.trz@gmail.com
                  </a>
                </p>
              </StepItem>
              
              <StepItem number={2} title="Укажите в заявлении">
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• ФИО / Наименование компании</li>
                  <li>• E-mail, привязанный к аккаунту</li>
                  <li>• Причины отказа от услуг</li>
                  <li>• Реквизиты для возврата средств</li>
                </ul>
              </StepItem>
              
              <StepItem number={3} title="Дождитесь подтверждения">
                <p className="text-gray-400 text-sm">
                  Администратор рассмотрит заявку и направит подтверждение на указанный e-mail
                </p>
              </StepItem>
              
              <StepItem number={4} title="Получите возврат">
                <p className="text-gray-400 text-sm">
                  После подтверждения средства будут возвращены на указанные реквизиты в течение 3-14 рабочих дней
                </p>
              </StepItem>
            </div>
          </Section>

          {/* Section 6 */}
          <Section icon={<AlertTriangle className="w-5 h-5" />} number="6" title="Особые условия">
            <Paragraph number="6.1">
              При расторжении договора по инициативе Администратора (блокировка за нарушение правил), 
              возврат средств не производится.
            </Paragraph>
            <Paragraph number="6.2">
              Бонусные средства и средства, начисленные в рамках тестового периода или акций, 
              возврату не подлежат.
            </Paragraph>
            <Paragraph number="6.3">
              В случае спорных ситуаций решение принимается Администратором в соответствии с 
              действующим законодательством Республики Казахстан.
            </Paragraph>
          </Section>

          {/* Contact Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#161616] border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Контакты для возврата</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <a href="mailto:shyrak.trz@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  shyrak.trz@gmail.com
                </a>
              </div>
              <div className="sm:border-l sm:border-white/10 sm:pl-4">
                <Link href="/company" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Все реквизиты компании →
                </Link>
              </div>
            </div>
          </div>
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
            <Link href="/payment" className="text-gray-400 hover:text-green-400 transition-colors text-sm">
              Процедура оплаты
            </Link>
            <Link href="/refund" className="text-orange-400 text-sm">
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
function Section({ icon, number, title, children }: { icon: React.ReactNode; number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-8">
      <h2 className="flex items-center gap-3 text-xl font-bold text-white mb-6">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600/30 to-orange-800/30 border border-orange-500/20 text-orange-400">
          {icon}
        </span>
        <span className="text-gray-500 font-mono text-sm mr-1">{number}.</span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Paragraph({ number, children, className = "" }: { number: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-gray-300 leading-relaxed ${className}`}>
      <span className="text-gray-500 font-mono text-sm mr-2">{number}</span>
      {children}
    </p>
  );
}

function TimelineCard({ title, value, description, color }: { 
  title: string; 
  value: string; 
  description: string;
  color: "green" | "blue";
}) {
  const colors = {
    green: "from-green-600/20 to-green-800/20 border-green-500/20 text-green-400",
    blue: "from-blue-600/20 to-blue-800/20 border-blue-500/20 text-blue-400"
  };
  
  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors[color]} border`}>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color === "green" ? "text-green-400" : "text-blue-400"}`}>{value}</p>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
  );
}

function ConditionItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <p className="text-gray-300">{text}</p>
    </div>
  );
}

function StepItem({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-600/30 to-orange-800/30 border border-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-medium mb-1">{title}</h4>
        {children}
      </div>
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

