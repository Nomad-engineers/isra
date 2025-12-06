"use client";

import Link from "next/link";
import { Building2, ArrowLeft, User, Briefcase, MapPin, Phone, Mail, Calendar, FileCheck, BadgeCheck } from "lucide-react";

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-800/20 border border-amber-500/20">
              <Building2 className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Реквизиты компании
              </h1>
              <p className="text-gray-400 text-sm mt-1">ИП Shyrak</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Main Company Info Card */}
          <InfoSection icon={<Building2 className="w-5 h-5" />} title="Основная информация">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem label="Наименование компании" value="Shyrak" />
              <InfoItem label="ИИН" value="010424501157" mono />
              <InfoItem label="Банк" value="АО «Народный Банк Казахстана»" />
              <InfoItem label="БИК" value="HSBKKZKX" mono />
              <InfoItem label="Номер счета (ИИК)" value="KZ34601A161003101771" mono />
              <InfoItem label="Валюта счета" value="KZT" />
              <InfoItem label="Код бенефициара (Кбе)" value="19" mono />
            </div>
          </InfoSection>

          {/* Individual Entrepreneur Info */}
          <InfoSection icon={<User className="w-5 h-5" />} title="Информация об индивидуальном предпринимателе">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem label="ФИО" value="ЖАҚСЫБАЕВ БЕКЗАТ МАРАТҰЛЫ" />
              <InfoItem label="ИИН" value="010424501157" mono />
              <InfoItem label="Талон" value="№KZ49TWQ03651117" mono />
              <InfoItem label="Наименование конечного получателя" value="Shyrak" />
              <InfoItem label="Наименование принимающей организации" value="УГД по г. Тараз" />
              <InfoItem label="Входящий регистрационный номер уведомления" value="KZ74UWQ05893451" mono className="sm:col-span-2" />
            </div>
          </InfoSection>

          {/* Business Activity */}
          <InfoSection icon={<Briefcase className="w-5 h-5" />} title="Деятельность">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem label="Вид предпринимательства" value="Личное" />
              <InfoItem label="Наименование индивидуального предпринимателя" value="Shyrak" />
              <InfoItem label="Вид осуществляемой деятельности (ОКЭД)" value="62021" mono />
              <InfoItem label="Основной ОКЭД" value="62020" mono />
              <div className="sm:col-span-2">
                <InfoItem 
                  label="Вторичный ОКЭД" 
                  value="62011 (Разработка программного обеспечения), 62012, 85200" 
                />
              </div>
            </div>
          </InfoSection>

          {/* Contact Info */}
          <InfoSection icon={<MapPin className="w-5 h-5" />} title="Контактная информация">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-sm">Юридический адрес</p>
                  <p className="text-gray-200">Республика Казахстан, Жамбылская область, г. Тараз, переулок 5 Жолшы Сыздыкова, 7</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-sm">Телефон</p>
                  <a href="tel:+77718034447" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    +7 771 803 4447
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-sm">E-mail</p>
                  <a href="mailto:bekzat.zhm@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    bekzat.zhm@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </InfoSection>

          {/* Registration Data */}
          <InfoSection icon={<Calendar className="w-5 h-5" />} title="Данные о регистрации">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem label="Первичная регистрация" value="28.05.2020" />
              <InfoItem label="На рынке" value="4 года" highlight />
            </div>
            
            {/* Verification badges */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-gray-500 text-sm mb-3">Проверено:</p>
              <div className="flex flex-wrap gap-3">
                <VerificationBadge 
                  name="Национальное бюро статистики" 
                  date="09.09.2024" 
                />
                <VerificationBadge 
                  name="Комитет государственных доходов" 
                  date="01.01.2024" 
                />
              </div>
            </div>
          </InfoSection>

          {/* Legal Documents Links */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#161616] border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Юридические документы</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DocumentLink href="/contract" title="Публичная оферта" description="Договор на оказание услуг" />
              <DocumentLink href="/privacy" title="Политика конфиденциальности" description="Защита персональных данных" />
              <DocumentLink href="/payment" title="Процедура оплаты" description="Порядок оплаты услуг" />
              <DocumentLink href="/refund" title="Политика возврата" description="Условия возврата средств" />
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
            <Link href="/company" className="text-amber-400 text-sm">
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
function InfoSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="p-6 rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#161616] border border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600/30 to-amber-800/30 border border-amber-500/20 text-amber-400">
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoItem({ label, value, mono = false, highlight = false, className = "" }: { 
  label: string; 
  value: string; 
  mono?: boolean;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className={`${mono ? "font-mono" : ""} ${highlight ? "text-amber-400 font-semibold" : "text-gray-200"}`}>
        {value}
      </p>
    </div>
  );
}

function VerificationBadge({ name, date }: { name: string; date: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
      <BadgeCheck className="w-4 h-4 text-green-400" />
      <div>
        <p className="text-gray-300 text-sm">{name}</p>
        <p className="text-gray-500 text-xs">{date}</p>
      </div>
    </div>
  );
}

function DocumentLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link 
      href={href} 
      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
    >
      <p className="text-gray-200 group-hover:text-white transition-colors">{title}</p>
      <p className="text-gray-500 text-sm">{description}</p>
    </Link>
  );
}

