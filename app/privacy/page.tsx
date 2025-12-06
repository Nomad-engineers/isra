"use client";

import Link from "next/link";
import { Shield, ArrowLeft, Database, Lock, Share2, CreditCard, UserCog, RefreshCw, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/20">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Политика конфиденциальности
      </h1>
              <p className="text-gray-400 text-sm mt-1">и обработки персональных данных</p>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Настоящая политика конфиденциальности и обработки персональных данных (далее — Политика) 
            регулирует порядок обработки и использования персональных и иных данных сайта{" "}
            <ExternalLink href="https://isra.kz">isra.kz</ExternalLink>, который принадлежит и 
            управляется <Link href="/company" className="text-cyan-400 hover:text-cyan-300">ИП Shyrak</Link> (далее — Оператор). 
            Действующая редакция настоящей Политики размещена по адресу:{" "}
            <ExternalLink href="https://isra.kz/privacy">https://isra.kz/privacy</ExternalLink>
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-10">
          {/* Section 1 */}
          <Section icon={<Database className="w-5 h-5" />} number="1" title="Термины">
            <Paragraph number="1.1">
              <Strong>Сайт</Strong> — сайт, расположенный в сети Интернет по адресу isra.kz. Все исключительные права 
              на Сайт и его отдельные элементы (включая программное обеспечение, дизайн) принадлежат Оператору в полном 
              объеме. Передача исключительных прав Пользователю не является предметом настоящей Политики.
            </Paragraph>
            <Paragraph number="1.2">
              <Strong>Пользователь</Strong> — лицо, использующее Сайт.
            </Paragraph>
            <Paragraph number="1.3">
              <Strong>Законодательство</Strong> — действующее законодательство Республики Казахстан.
            </Paragraph>
            <Paragraph number="1.4">
              <Strong>Персональные данные</Strong> — персональные данные Пользователя, которые Пользователь 
              предоставляет самостоятельно при регистрации или в процессе использования функционала Сайта.
            </Paragraph>
            <Paragraph number="1.5">
              <Strong>Данные</Strong> — иные данные о Пользователе (не входящие в понятие Персональных данных).
            </Paragraph>
            <Paragraph number="1.6">
              <Strong>Регистрация</Strong> — заполнение Пользователем Регистрационной формы, расположенной на Сайте, 
              путем указания необходимых сведений.
            </Paragraph>
            <Paragraph number="1.7">
              <Strong>Регистрационная форма</Strong> — форма, расположенная на Сайте, которую Пользователь должен 
              заполнить для возможности использования сайта в полном объеме.
            </Paragraph>
            <Paragraph number="1.8">
              <Strong>Услуга(и)</Strong> — услуги, предоставляемые Оператором на основании соглашения, в том числе 
              услуги по проведению онлайн-вебинаров.
            </Paragraph>
          </Section>

          {/* Section 2 */}
          <Section icon={<Database className="w-5 h-5" />} number="2" title="Сбор и обработка персональных данных">
            <Paragraph number="2.1">
              Оператор собирает и хранит только те Персональные данные, которые необходимы для оказания Услуг 
              Оператором и взаимодействия с Пользователем. Подробности описаны в{" "}
              <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Пользовательском соглашении</Link> и{" "}
              <Link href="/contract" className="text-cyan-400 hover:text-cyan-300">Публичной оферте</Link>.
            </Paragraph>

            <Paragraph number="2.2">
              Персональные данные могут использоваться в следующих целях:
            </Paragraph>
            <InfoList items={[
              "оказание Услуг Пользователю",
              "идентификация Пользователя",
              "взаимодействие с Пользователем",
              "направление Пользователю рекламных материалов, информации и запросов",
              "проведение статистических и иных исследований"
            ]} />

            <Paragraph number="2.3">
              Оператор в том числе обрабатывает следующие данные:
            </Paragraph>
            <InfoList items={[
              "фамилия, имя и отчество",
              "адрес электронной почты",
              "номер телефона (в т.ч. мобильного)"
            ]} />

            <Paragraph number="2.4">
              Пользователю запрещается указывать на Сайте персональные данные третьих лиц (за исключением условия 
              представления интересов этих лиц, имея документальное подтверждение третьих лиц на осуществление таких действий).
            </Paragraph>

            <InfoCard title="Файлы cookie" number="2.5">
              Когда пользователи посещают сайт isra.kz, мы отправляем на их компьютер один или несколько файлов cookie. 
              Это небольшой файл, содержащий наборы символов, который позволяет идентифицировать Ваш браузер и сохранять 
              его настройки. С помощью cookie мы улучшаем качество своих служб и отслеживаем тренды активности пользователей.
            </InfoCard>

            <InfoCard title="Информация из журналов" number="2.6">
              Когда Вы используете службы isra.kz, наши серверы автоматически записывают информацию, которую браузер 
              передает при посещении вебсайта. Такой журнал сервера обычно включает: Ваш запрос, адрес IP, тип и язык 
              браузера, дату и время запроса, а также один или несколько файлов cookie.
            </InfoCard>

            <InfoCard title="Сообщения пользователей" number="2.7">
              Мы можем сохранять сообщения электронной почты и другие письма, отправленные пользователями, 
              чтобы обрабатывать вопросы пользователей, отвечать на запросы и совершенствовать наши службы.
            </InfoCard>
          </Section>

          {/* Section 3 */}
          <Section icon={<Lock className="w-5 h-5" />} number="3" title="Порядок обработки персональных и иных данных">
            <Paragraph number="3.1">
              Оператор обязуется использовать Персональные данные в соответствии с Законом «О персональных данных» 
              Республики Казахстан и внутренними документами Оператора.
            </Paragraph>
            <Paragraph number="3.2">
              В отношении Персональных данных и иных Данных Пользователя сохраняется их конфиденциальность, 
              кроме случаев, когда указанные данные являются общедоступными.
            </Paragraph>
            <Paragraph number="3.3">
              Оператор имеет право сохранять архивную копию Персональных данных. Оператор имеет право хранить 
              Персональные данные и Данные на серверах вне территории Республики Казахстан.
            </Paragraph>

            <Paragraph number="3.4">
              Оператор имеет право передавать Персональные данные и Данные Пользователя без согласия Пользователя следующим лицам:
            </Paragraph>
            <InfoList items={[
              "государственным органам, в том числе органам дознания и следствия, и органам местного самоуправления по их мотивированному запросу",
              "в иных случаях, прямо предусмотренных действующим законодательством Республики Казахстан"
            ]} />

            <Paragraph number="3.5">
              Оператор имеет право передавать Персональные данные и Данные третьим лицам в следующих случаях:
            </Paragraph>
            <InfoList items={[
              "Пользователь выразил свое согласие на такие действия",
              "передача необходима в рамках использования Пользователем Сайта или оказания Услуг Пользователю"
            ]} />

            <Paragraph number="3.6">
              Оператор осуществляет автоматизированную обработку Персональных данных и Данных.
            </Paragraph>

            <Paragraph number="3.7">
              Оператор обрабатывает личную информацию только в тех целях, которые описаны в настоящей Политике:
            </Paragraph>
            <InfoList items={[
              "Предоставление пользователям наших продуктов и услуг",
              "Проверка, исследование и анализ, направленные на поддержание, защиту и совершенствование наших служб",
              "Обеспечение технической работы нашей сети",
              "Разработка новых служб"
            ]} />

            <Paragraph number="3.8">
              Если Оператору потребуется использовать личную информацию в целях, отличающихся от целей, 
              ради которых она была собрана, мы предварительно запросим у Пользователя разрешение.
            </Paragraph>
          </Section>

          {/* Section 4 */}
          <Section icon={<Shield className="w-5 h-5" />} number="4" title="Защита персональных данных">
            <Paragraph number="4.1">
              Оператор осуществляет надлежащую защиту Персональных и иных данных в соответствии с Законодательством 
              и принимает необходимые и достаточные организационные и технические меры для защиты Персональных данных.
            </Paragraph>
            <Paragraph number="4.2">
              Применяемые меры защиты в том числе позволяют защитить Персональные данные от неправомерного или 
              случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также 
              от иных неправомерных действий с ними третьих лиц.
            </Paragraph>

            <Paragraph number="4.3">
              Оператор принимает следующие меры для защиты персональных данных:
            </Paragraph>
            <InfoList items={[
              "Проводит внутренние проверки процессов сбора, хранения и обработки данных и мер безопасности",
              "Применяет меры по предотвращению несанкционированного доступа к системам, в которых хранится личная информация",
              "Ограничивает доступ к личной информации сотрудникам и подрядчикам, которым необходимо иметь эту информацию для управления, разработки и совершенствования служб",
              "Обязует сотрудников и подрядчиков соблюдать конфиденциальность и возможность дисциплинарных мер за нарушение обязательств по конфиденциальности"
            ]} accent="green" />
          </Section>

          {/* Section 5 */}
          <Section icon={<Share2 className="w-5 h-5" />} number="5" title="Передача персональных данных">
            <Paragraph number="5.1">
              Оператор может передать личную информацию другим компаниям или лицам, не относящимся к isra.kz, 
              в следующих особых обстоятельствах:
            </Paragraph>
            <InfoList items={[
              "С целью обработки личной информации от имени isra.kz нашими дочерними предприятиями, аффилированными компаниями и надежными предприятиями или лицами",
              "Если раскрытие подобной информации необходимо для соблюдения законодательства, выполнения судебного решения, обеспечения соблюдения Условий предоставления услуг или защиты прав, собственности или безопасности isra.kz, пользователей и общественности",
              "В случае слияния, приобретения или продажи активов компании"
            ]} />

            <Paragraph number="5.2">
              Оператор может предоставлять третьим лицам некоторую сводную информацию неличного характера, 
              которая не служит для идентификации пользователей.
            </Paragraph>
          </Section>

          {/* Section 6 */}
          <Section icon={<CreditCard className="w-5 h-5" />} number="6" title="Использование финансовой информации">
            <Paragraph number="6.1">
              Финансовая информация (например, данные счета в банке) используется Оператором исключительно 
              для предоставления счета на оплату заказанных услуг.
            </Paragraph>
            <Paragraph number="6.2">
              В случае если Пользователь расплачивается за услуги с помощью банковской карты, информация о ней 
              может быть перенаправлена провайдеру кредитной карты для осуществления платежа.
            </Paragraph>
            <Paragraph number="6.3">
              Разглашение финансовой информации может осуществляться только если этого требуют судебные или 
              аудиторские органы в случаях, предусмотренных законодательством.
            </Paragraph>
          </Section>

          {/* Section 7 */}
          <Section icon={<UserCog className="w-5 h-5" />} number="7" title="Изменение и удаление личной информации">
            <Paragraph number="7.1">
              Пользователь может в любое время изменить (обновить, дополнить) предоставленную им личную информацию 
              или её часть, воспользовавшись функцией редактирования данных в персональном разделе Сайта.
            </Paragraph>
            <Paragraph number="7.2">
              Пользователь также может удалить предоставленную им в рамках определенной учетной записи личную информацию, 
              связавшись с Администрацией Сайта по адресу электронной почты{" "}
              <a href="mailto:shyrak.trz@gmail.com" className="text-cyan-400 hover:text-cyan-300">shyrak.trz@gmail.com</a>. 
              При этом удаление аккаунта может повлечь невозможность использования некоторых Услуг Сайта.
            </Paragraph>
          </Section>

          {/* Section 8 */}
          <Section icon={<RefreshCw className="w-5 h-5" />} number="8" title="Изменение политики конфиденциальности">
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
              <p className="text-gray-300 leading-relaxed">
                Обратите внимание, что политика конфиденциальности может периодически изменяться. 
                Без Вашего согласия Ваши права, гарантированные настоящей политикой конфиденциальности, 
                не могут быть сокращены, и мы полагаем, что большинство изменений будут незначительными. 
                Тем не менее, все изменения политики конфиденциальности публикуются на этой странице, 
                а если эти изменения значительны, мы обеспечиваем их широкое освещение, включая, например, 
                уведомления по электронной почте.
              </p>
            </div>
          </Section>

          {/* Section 9 */}
          <Section icon={<CheckCircle2 className="w-5 h-5" />} number="9" title="Осуществление">
            <p className="text-gray-300 leading-relaxed">
              Isra.kz регулярно проверяет соответствие своей работы данной{" "}
              <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Политике конфиденциальности</Link>,{" "}
              <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">Пользовательскому соглашению</Link>,{" "}
              <Link href="/contract" className="text-cyan-400 hover:text-cyan-300">Оферте</Link> и{" "}
              <Link href="/refund" className="text-cyan-400 hover:text-cyan-300">Правилам возврата</Link>.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Если у Вас есть вопросы о политике конфиденциальности или о том, как isra.kz управляет личной информацией, 
              свяжитесь с нами через этот сайт. Согласно нашим правилам, при получении письменного запроса, 
              isra.kz обязана связаться с отправителем для решения данного вопроса.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Все вопросы о передаче личных данных, которые isra.kz и Пользователь не могут решить самостоятельно, 
              решаются с помощью соответствующих контролирующих органов, включая местные органы по защите данных.
            </p>
          </Section>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <nav className="flex flex-wrap gap-4 mb-6">
            <Link href="/privacy" className="text-cyan-400 text-sm">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
              Пользовательское соглашение
            </Link>
            <Link href="/contract" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
              Публичная оферта
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
    <section className="scroll-mt-8" id={`section-${number}`}>
      <h2 className="flex items-center gap-3 text-xl font-bold text-white mb-6">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-cyan-800/30 border border-cyan-500/20 text-cyan-400">
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

function InfoList({ items, accent = "cyan" }: { items: string[]; accent?: "cyan" | "green" }) {
  const dotColor = accent === "green" ? "text-green-400" : "text-cyan-400";
  return (
    <ul className="ml-6 my-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="text-gray-300 flex items-start gap-2">
          <span className={`${dotColor} mt-1.5`}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoCard({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 p-5 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-white/5">
      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
        <span className="text-gray-500 font-mono text-sm">{number}</span>
        {title}
      </h4>
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
