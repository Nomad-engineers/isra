"use client";

import Link from "next/link";
import { FileText, Building2, Calendar, ArrowLeft, Users, CreditCard, Scale, Clock, Bell, FileCheck } from "lucide-react";

export default function ContractPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/20">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Публичная оферта
              </h1>
              <p className="text-gray-400 text-sm mt-1">Договор на оказание услуг</p>
            </div>
          </div>
          <p className="text-lg text-gray-300">
            на оказание услуг Сервиса &quot;Isra.kz&quot;
          </p>
        </header>

        {/* Company Info Card */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#161616] border border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">ИП «Shyrak»</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-gray-400">
                <span className="text-gray-500">Юр. адрес:</span>{" "}
                <span className="text-gray-300">Казахстан, Тараз, ПЕРЕУЛОК 5 ЖОЛШЫ СЫЗДЫКОВА, дом 7</span>
              </p>
              <p className="text-gray-400">
                <span className="text-gray-500">БИН/ИИН:</span>{" "}
                <span className="text-gray-300 font-mono">010424501157</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">
                <span className="text-gray-500">ИИК:</span>{" "}
                <span className="text-gray-300 font-mono">KZ34601A161003101771</span>
              </p>
              <p className="text-gray-400">
                <span className="text-gray-500">Банк:</span>{" "}
                <span className="text-gray-300">АО «Народный Банк Казахстана»</span>
              </p>
              <p className="text-gray-400">
                <span className="text-gray-500">БИК:</span>{" "}
                <span className="text-gray-300 font-mono">HSBKKZKX</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Дата публикации: <span className="text-gray-300">11.09.2024</span></span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-10">
          {/* Section 1 */}
          <Section icon={<FileCheck className="w-5 h-5" />} number="1" title="Основные положения">
            <Paragraph number="1.1">
              Настоящий документ представляет собой официальное предложение ИП Shyrak (далее — <Strong>«Исполнитель»</Strong>) 
              заключить договор на оказание услуг с физическим или юридическим лицом (далее — <Strong>«Заказчик»</Strong>) 
              на изложенных ниже условиях.
            </Paragraph>
            <Paragraph number="1.2">
              В соответствии с п. 1 ст. 395 Гражданского кодекса Республики Казахстан, этот документ является публичной офертой. 
              Заказчик, который принимает условия оферты и осуществляет оплату услуг Исполнителя, заключает договор в порядке, 
              установленном настоящей Офертой.
            </Paragraph>
          </Section>

          {/* Section 2 */}
          <Section icon={<FileText className="w-5 h-5" />} number="2" title="Термины и определения">
            <DefinitionList>
              <Definition term="Публичная оферта / Оферта">
                текст настоящего документа с его приложениями, изменениями и дополнениями, размещённый на веб-ресурсе 
                Организатора и доступный в сети Интернет по адресу: <ExternalLink href="https://isra.kz">https://isra.kz</ExternalLink>
              </Definition>
              <Definition term="Договор">
                соглашение на оказание услуг на условиях, изложенных в настоящей Оферте
              </Definition>
              <Definition term="Акцепт Оферты">
                полное и безоговорочное согласие с условиями Оферты путём регистрации Пользователя на сайте Сервиса, 
                что заключает Договор между Пользователем и Организатором
              </Definition>
              <Definition term="Пользователь">
                физическое или юридическое лицо, которое может принять Оферту для заключения Договора или уже принявшее 
                Оферту для выполнения условий Договора
              </Definition>
              <Definition term="Сайт Сервиса / Сервис">
                автоматизированная онлайн-платформа, доступная по адресу: <ExternalLink href="https://isra.kz">https://isra.kz</ExternalLink>
              </Definition>
              <Definition term="Администрация Сервиса">
                представители Организатора (сотрудники или лица, действующие по доверенности), которые управляют работой Сервиса
              </Definition>
              <Definition term="Вебинар / Онлайн-семинар">
                онлайн-событие, аналог веб-конференции с участием нескольких участников
              </Definition>
              <Definition term="Автовебинар">
                онлайн-событие, представляющее собой заранее записанный вебинар с возможностью автоматического воспроизведения 
                и интерактивного взаимодействия с участниками в режиме реального времени
              </Definition>
              <Definition term="Виртуальная комната">
                виртуальная площадка, где проводится вебинар
              </Definition>
              <Definition term="Сценарий комнаты">
                набор действий, выполняемых в процессе вебинара
              </Definition>
              <Definition term="Чат">
                система обмена сообщениями между участниками вебинара
              </Definition>
              <Definition term="Личный кабинет">
                раздел на Сайте, где Пользователь может просматривать информацию о своих подключённых услугах и лицевом счёте
              </Definition>
              <Definition term="Лицевой счет">
                информация о денежных средствах Пользователя, внесённых и использованных в рамках оплаты услуг по условиям Договора
              </Definition>
              <Definition term="Баланс лицевого счёта">
                общая сумма на счёте, доступная для оплаты услуг. Состоит из основного (внесённые средства) и бонусного балансов
              </Definition>
              <Definition term="Тестовый период">
                при регистрации Пользователю начисляется 1000 единиц на счет для использования Услуг Сервиса
              </Definition>
            </DefinitionList>

            <SubSection title="Услуги Сервиса">
              <ServiceCard title="Услуга «Вебинары»">
                <p className="text-gray-300 mb-3">
                  Предоставление возможности создавать до 10 виртуальных комнат для проведения вебинаров.
                </p>
                <FeatureList items={[
                  "Доступ участников вебинара (открытый)",
                  "Организация чатов между участниками",
                  "Отображение баннеров Пользователя",
                  "Запись сценария вебинара (чаты, баннеры)",
                  "Автоматическое воспроизведение сценария"
                ]} />
              </ServiceCard>

              <ServiceCard title="Услуга «Автовебинары»">
                <p className="text-gray-300 mb-3">
                  Предоставление возможности создания и проведения автовебинаров с использованием предварительно записанных материалов.
                </p>
                <FeatureList items={[
                  "Загрузка записанных вебинаров для автоматического воспроизведения",
                  "Настройка расписания для проведения автовебинаров",
                  "Интерактивные элементы для участников (чаты, баннеры)",
                  "Сохранение и аналитика активности участников"
                ]} />
              </ServiceCard>
            </SubSection>
          </Section>

          {/* Section 3 */}
          <Section icon={<Users className="w-5 h-5" />} number="3" title="Использование онлайн сервиса">
            <Paragraph number="3.1">
              Для получения услуги Администратора Пользователь по своему желанию выбирает тарифный план, проводит регистрацию 
              путем предоставления данных компании и производит оплату.
            </Paragraph>
            <Paragraph number="3.2">
              Оплата Пользователя означает безоговорочное и полное согласие с условиями Договора. День оплаты Пользователем 
              Услуг считается днем заключения Договора на срок, указанный в пакете услуг.
            </Paragraph>
            <Paragraph number="3.3">
              Перечень услуг и их стоимость опубликованы на сайте Исполнителя по адресу:{" "}
              <ExternalLink href="https://isra.kz">https://isra.kz</ExternalLink>
            </Paragraph>
          </Section>

          {/* Section 4 */}
          <Section icon={<FileText className="w-5 h-5" />} number="4" title="Регистрация на сайте, конфиденциальность и защита персональных данных">
            <Paragraph number="4.1">
              Данные компании содержат в себе следующую информацию:
            </Paragraph>
            <InfoList items={[
              "Наименование юридического лица",
              "Адрес электронной почты (E-mail)",
              "Пароль и логин для входа в личный кабинет",
              "Юридический адрес",
              "БИН"
            ]} />

            <Paragraph number="4.2">
              При необходимости Пользователь имеет право редактировать внесенные данные о компании в личном кабинете.
            </Paragraph>
            <Paragraph number="4.3">
              Администратор обязуется не разглашать полученную от Пользователя информацию. Не считается нарушением обязательств 
              разглашение информации в соответствии с обоснованными требованиями, согласно действующему законодательству Республики Казахстан.
            </Paragraph>
            <Paragraph number="4.4">
              <Strong>Обязанность по сохранению конфиденциальности:</Strong> Стороны обязуются сохранять конфиденциальность всей информации, 
              полученной в рамках выполнения настоящего Договора.
            </Paragraph>
            <Paragraph number="4.5">
              <Strong>Согласие на обработку персональных данных:</Strong> Заказчик соглашается на обработку его персональных данных 
              в соответствии с законодательством Республики Казахстан «О персональных данных и их защите».
            </Paragraph>
            <Paragraph number="4.6">
              <Strong>Меры безопасности данных:</Strong> Мы принимаем все необходимые меры безопасности для предотвращения 
              несанкционированного доступа, изменения, разглашения или уничтожения данных.
            </Paragraph>
          </Section>

          {/* Section 5 */}
          <Section icon={<Scale className="w-5 h-5" />} number="5" title="Права и обязанности сторон">
            <SubSection title="5.1. Права и обязанности Организатора">
              <InfoList items={[
                "Организатор обязуется поддерживать Сервис в рабочем состоянии и обеспечивать его доступность Пользователю через Интернет",
                "Организатор обязуется сохранять конфиденциальность персональных данных и материалов, загруженных Пользователем",
                "Если Пользователь нарушает условия настоящей Оферты, Организатор вправе ограничить доступ к Сервису или Услугам",
                "Организатор оставляет за собой право изменять настоящую Оферту, уведомляя об изменениях через обновление информации на сайте",
                "Организатор может вносить изменения в функционал Сервиса без предварительного уведомления Пользователя",
                "Организатор имеет право приостановить действие учетных записей Пользователей, неактивных в течение года"
              ]} accent="purple" />
            </SubSection>

            <SubSection title="5.2. Права и обязанности Пользователя">
              <InfoList items={[
                "Пользователь обязуется соблюдать условия настоящей Оферты",
                "Пользователь должен следовать Правилам оказания технической поддержки",
                "В случае ухода баланса в отрицательные значения, Пользователь обязан пополнить счет в течение трех рабочих дней",
                "Пользователь не имеет права создавать несколько учетных записей для получения дополнительных тестовых периодов",
                "Пользователь несет полную ответственность за любые действия, совершенные с его учетной записью",
                "Пользователь обязуется не публиковать материалы, нарушающие законодательство Республики Казахстан",
                "Пользователь несет ответственность за сохранность своих учетных данных"
              ]} accent="cyan" />
            </SubSection>
          </Section>

          {/* Section 6 */}
          <Section icon={<CreditCard className="w-5 h-5" />} number="6" title="Порядок оплаты">
            <Paragraph number="6.1">
              Оплата производится на счет Администратора банковскими картами или иными безналичными способами после 
              проведения регистрации по тарифным планам: <ExternalLink href="https://isra.kz">https://isra.kz</ExternalLink>
            </Paragraph>
            <Paragraph number="6.2">
              Услуги предоставляются при условии 100% предоплаты.
            </Paragraph>
            <Paragraph number="6.3">
              Администратор самостоятельно контролирует срок истечения предоставления Услуг.
            </Paragraph>
            <Paragraph number="6.4">
              За правильность платежей ответственность лежит на Пользователе.
            </Paragraph>
          </Section>

          {/* Section 7 */}
          <Section icon={<Scale className="w-5 h-5" />} number="7" title="Ответственность сторон, разрешение споров">
            <Paragraph number="7.1">
              За неисполнение или ненадлежащее исполнение своих обязательств Стороны несут ответственность в соответствии 
              с действующим законодательством Республики Казахстан.
            </Paragraph>
            <Paragraph number="7.2">
              Все споры, возникающие между Сторонами при исполнении настоящей Оферты, разрешаются путем мирных переговоров, 
              а в случае не достижения согласия между Сторонами, спор рассматривается в судебном порядке в соответствии 
              с действующим законодательством Республики Казахстан в арбитражном суде по месту регистрации Администратора.
            </Paragraph>
          </Section>

          {/* Section 8 */}
          <Section icon={<Clock className="w-5 h-5" />} number="8" title="Срок действия договора и его расторжение">
            <Paragraph number="8.1">
              Публичная оферта вступает в силу с момента акцепта Оферты и действует в течение срока предоставления доступа 
              к Сайту Администратора.
            </Paragraph>
            <Paragraph number="8.2">
              Администратор имеет право блокировать доступ к серверу в следующих случаях:
            </Paragraph>
            <InfoList items={[
              "При получении распоряжений государственных органов Республики Казахстан",
              "При нарушении авторских и смежных прав",
              "При мотивированном обращении третьих лиц при нарушении их прав",
              "При обнаружении запрещенной законодательством информации, размещенной Пользователем"
            ]} accent="red" />
            <Paragraph number="8.3">
              Пользователь имеет право отказаться от пользования предоставленными Услугами в течение 14 (четырнадцати) 
              календарных дней с даты получения доступа к Сайту путем направления письменного заявления от Пользователя 
              на e-mail Администратора с объяснением реальных мотивированных причин отказа.
            </Paragraph>
            <Paragraph number="8.4">
              Возврат денежных средств производится Администратором за минусом денежной суммы за фактически оказанные 
              Услуги в течение 14 (четырнадцати) календарных дней на реквизиты Пользователя после подтверждения 
              Администратором мотивированных причин отказа от Услуг.
            </Paragraph>
          </Section>

          {/* Section 9 */}
          <Section icon={<Bell className="w-5 h-5" />} number="9" title="Уведомления">
            <Paragraph number="9.1">
              Все уведомления, запросы, претензии и иные обращения, связанные с исполнением настоящего Договора, 
              должны направляться Заказчиком на электронный адрес Исполнителя:{" "}
              <a href="mailto:shyrak.trz@gmail.com" className="text-cyan-400 hover:text-cyan-300">shyrak.trz@gmail.com</a>. 
              В обращении Заказчик обязан указать подробное описание возникших вопросов или проблем.
            </Paragraph>
          </Section>

          {/* Section 10 */}
          <Section icon={<FileCheck className="w-5 h-5" />} number="10" title="Заключительные положения">
            <Paragraph number="10.1">
              Заказчик подтверждает, что ознакомлен с условиями настоящей Оферты и принимает их в полном объеме.
            </Paragraph>
            <Paragraph number="10.2">
              Настоящая Оферта, все приложения к ней, а также изменения и дополнения, сделанные Исполнителем, 
              являются единым и полным соглашением между Сторонами.
            </Paragraph>
            <Paragraph number="10.3">
              Заказчик не вправе передавать свои права и обязательства по настоящему Договору третьим лицам 
              без предварительного письменного согласия Исполнителя.
            </Paragraph>
            <Paragraph number="10.4">
              Во всем остальном, что не предусмотрено условиями настоящего Договора, Стороны руководствуются 
              действующим законодательством Республики Казахстан.
            </Paragraph>
          </Section>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <nav className="flex flex-wrap gap-4 mb-6">
            <Link href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
              Политика конфиденциальности
            </Link>
            <Link href="/contract" className="text-purple-400 text-sm">
              Публичная оферта
            </Link>
            <Link href="/payment" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
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
function Section({ icon, number, title, children }: { icon: React.ReactNode; number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-8">
      <h2 className="flex items-center gap-3 text-xl font-bold text-white mb-6">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-800/30 border border-purple-500/20 text-purple-400">
          {icon}
        </span>
        <span className="text-gray-500 font-mono text-sm mr-1">{number}.</span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        {title}
      </h3>
      <div className="pl-4">{children}</div>
    </div>
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

function DefinitionList({ children }: { children: React.ReactNode }) {
  return <dl className="space-y-3 mt-4">{children}</dl>;
}

function Definition({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="pl-4 border-l-2 border-purple-500/30 py-2">
      <dt className="text-purple-300 font-medium mb-1">{term}</dt>
      <dd className="text-gray-400 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

function InfoList({ items, accent = "cyan" }: { items: string[]; accent?: "cyan" | "purple" | "red" }) {
  const dotColors = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    red: "text-red-400"
  };
  return (
    <ul className="ml-6 my-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-gray-300 flex items-start gap-2">
          <span className={`${dotColors[accent]} mt-1.5`}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ServiceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-white/5">
      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
          <span className="text-green-400 mt-0.5">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

