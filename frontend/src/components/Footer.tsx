import { Link } from 'react-router-dom'
import { useState } from 'react'
import FooterModal from './FooterModal'

interface FooterItem {
  label: string
  to?: string
  content?: React.ReactNode
}

function Section({ title, items, onOpen }: {
  title: string
  items: FooterItem[]
  onOpen: (item: FooterItem) => void
}) {
  return (
    <div>
      <h4 className="text-white font-bold text-sm mb-4 pb-3 border-b border-white/10">{title}</h4>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            {item.content ? (
              <button
                onClick={() => onOpen(item)}
                className="text-sm text-gray-400 hover:text-[#F5A623] transition-colors text-left"
              >
                {item.label}
              </button>
            ) : (
              <Link to={item.to ?? '/'} className="text-sm text-gray-400 hover:text-[#F5A623] transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-300 text-sm leading-relaxed">{children}</p>
)
const H = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[#F5A623] font-bold text-sm mt-4 mb-1">{children}</h4>
)
const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 text-sm text-gray-300"><span className="text-[#F5A623] mt-0.5">•</span><span>{children}</span></li>
)

export default function Footer() {
  const [modal, setModal] = useState<FooterItem | null>(null)
  const [email, setEmail] = useState('')

  const COMPANY: FooterItem[] = [
    {
      label: 'О компании',
      content: <>
        <P>QOLDA — современный казахстанский маркетплейс нового поколения, построенный на базе технологий машинного обучения. Наша миссия — сделать онлайн-шопинг в Казахстане умным, удобным и персонализированным.</P>
        <H>Наша история</H>
        <P>Проект стартовал как дипломная работа в 2024 году и вырос в полноценную платформу с тысячами товаров и сотнями продавцов. Мы объединяем покупателей и продавцов по всему Казахстану.</P>
        <H>Технологии</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Гибридная ML-система рекомендаций (SVD + TF-IDF)</Li>
          <Li>Коллаборативная и контентная фильтрация</Li>
          <Li>Персонализация в реальном времени</Li>
          <Li>Современный стек: React, FastAPI, PostgreSQL</Li>
        </ul>
      </>
    },
    {
      label: 'Новости',
      content: <>
        <P>Следите за последними обновлениями платформы QOLDA — новые функции, акции и события.</P>
        <H>Последние новости</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Май 2026 — запуск новой системы ML-рекомендаций v2.0</Li>
          <Li>Апрель 2026 — добавлены сезонные категории и акционные баннеры</Li>
          <Li>Март 2026 — тёмная тема и многоязычность (РУ / ҚАЗ / EN)</Li>
          <Li>Февраль 2026 — кабинет продавца с аналитикой и AI-ассистентом</Li>
        </ul>
        <H>Планы</H>
        <P>В ближайших обновлениях — мобильное приложение, интеграция с Kaspi Pay и расширение доставки по регионам.</P>
      </>
    },
    {
      label: 'Партнёрам',
      content: <>
        <P>QOLDA открыт для партнёрства с брендами, дистрибьюторами и логистическими компаниями Казахстана.</P>
        <H>Форматы сотрудничества</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Размещение товаров на маркетплейсе</Li>
          <Li>Совместные маркетинговые кампании и акции</Li>
          <Li>Интеграция логистических сервисов</Li>
          <Li>Аренда рекламных площадей на платформе</Li>
          <Li>API-интеграция для автоматической выгрузки каталога</Li>
        </ul>
        <H>Контакты для партнёров</H>
        <P>Напишите нам: <span className="text-[#F5A623]">partners@qolda.kz</span></P>
      </>
    },
    {
      label: 'Вакансии',
      content: <>
        <P>Мы строим команду профессионалов, которые хотят менять e-commerce в Казахстане.</P>
        <H>Открытые позиции</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Frontend-разработчик (React / TypeScript) — Алматы / удалённо</Li>
          <Li>Backend-разработчик (Python / FastAPI) — Алматы / удалённо</Li>
          <Li>ML-инженер (рекомендательные системы) — Алматы</Li>
          <Li>UI/UX дизайнер — удалённо</Li>
          <Li>Менеджер по работе с продавцами — Алматы, Астана</Li>
        </ul>
        <H>Как откликнуться</H>
        <P>Отправьте резюме на <span className="text-[#F5A623]">hr@qolda.kz</span> с указанием желаемой позиции.</P>
      </>
    },
    {
      label: 'Политика конфиденциальности',
      content: <>
        <P>QOLDA серьёзно относится к защите персональных данных своих пользователей.</P>
        <H>Что мы собираем</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Имя, email и контактные данные при регистрации</Li>
          <Li>История покупок и просмотров для улучшения рекомендаций</Li>
          <Li>Технические данные: IP-адрес, тип браузера, устройство</Li>
        </ul>
        <H>Как мы используем данные</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Персонализация рекомендаций товаров</Li>
          <Li>Обработка заказов и уведомления о доставке</Li>
          <Li>Улучшение качества сервиса и ML-моделей</Li>
        </ul>
        <H>Ваши права</H>
        <P>Вы вправе запросить удаление своих данных в любое время, написав на <span className="text-[#F5A623]">privacy@qolda.kz</span>.</P>
      </>
    },
    {
      label: 'Правила продаж',
      content: <>
        <P>Все продавцы на QOLDA обязаны соблюдать правила платформы для обеспечения качественного сервиса.</P>
        <H>Требования к продавцам</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Достоверное описание товара и актуальные фотографии</Li>
          <Li>Соответствие цены указанной на странице товара</Li>
          <Li>Своевременная обработка заказов (до 24 часов)</Li>
          <Li>Обеспечение гарантии и поддержка возврата</Li>
        </ul>
        <H>Комиссия платформы</H>
        <P>QOLDA берёт комиссию от 3% до 8% в зависимости от категории товара. Выплаты продавцам производятся еженедельно.</P>
      </>
    },
    {
      label: 'Сервисные центры',
      content: <>
        <P>QOLDA сотрудничает с авторизованными сервисными центрами по всему Казахстану.</P>
        <H>Города присутствия</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Алматы — 5 центров (Алмалы, Бостандық, Ауэзов р-н)</Li>
          <Li>Астана — 3 центра (Есіл, Сарыарқа р-н)</Li>
          <Li>Шымкент — 2 центра</Li>
          <Li>Қарағанды — 1 центр</Li>
          <Li>Атырау — 1 центр</Li>
        </ul>
        <H>Услуги</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Гарантийный и послегарантийный ремонт</Li>
          <Li>Диагностика и консультация</Li>
          <Li>Замена комплектующих с оригинальными запчастями</Li>
        </ul>
      </>
    },
  ]

  const BUYERS_LEFT: FooterItem[] = [
    {
      label: 'Как оформить заказ',
      content: <>
        <P>Оформить заказ на QOLDA очень просто — следуйте этим шагам:</P>
        <H>Пошаговая инструкция</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Найдите нужный товар через поиск или категории</Li>
          <Li>Нажмите «В корзину» или «Купить сейчас»</Li>
          <Li>Перейдите в корзину и проверьте состав заказа</Li>
          <Li>Выберите адрес доставки или пункт самовывоза</Li>
          <Li>Выберите способ оплаты и подтвердите заказ</Li>
        </ul>
        <H>После оформления</H>
        <P>Вы получите уведомление на email с номером заказа. Отслеживать статус можно в разделе «Мои заказы».</P>
      </>
    },
    {
      label: 'Способы оплаты',
      content: <>
        <P>QOLDA поддерживает несколько удобных способов оплаты.</P>
        <H>Доступные методы</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Банковская карта (Visa, Mastercard, МИР)</Li>
          <Li>Kaspi Pay — моментальная оплата через Kaspi</Li>
          <Li>Наличные при получении (для некоторых регионов)</Li>
          <Li>Kaspi рассрочка — 0-0-12 для товаров от 10 000 ₸</Li>
          <Li>Банковский перевод для юридических лиц</Li>
        </ul>
        <H>Безопасность платежей</H>
        <P>Все транзакции защищены SSL-шифрованием. Данные карт не хранятся на серверах QOLDA.</P>
      </>
    },
    {
      label: 'Доставка',
      content: <>
        <P>Мы доставляем заказы по всему Казахстану.</P>
        <H>Сроки и стоимость</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Алматы, Астана — 1–2 дня, бесплатно от 5 000 ₸</Li>
          <Li>Областные центры — 2–3 дня, от 990 ₸</Li>
          <Li>Районы и сёла — 3–7 дней, от 1 490 ₸</Li>
          <Li>Экспресс-доставка по Алматы — 2–4 часа, 1 990 ₸</Li>
        </ul>
        <H>Партнёры по доставке</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Казпочта — по всему Казахстану</Li>
          <Li>СДЭК — крупные города</Li>
          <Li>DPD Kazakhstan</Li>
        </ul>
      </>
    },
    {
      label: 'Статус заказа',
      content: <>
        <P>Вы можете отслеживать свой заказ в личном кабинете в разделе «Мои заказы».</P>
        <H>Статусы заказа</H>
        <ul className="space-y-1.5 mt-2">
          <Li><b className="text-yellow-400">Принят</b> — заказ получен, ожидает подтверждения продавца</Li>
          <Li><b className="text-blue-400">Собирается</b> — продавец готовит товар к отправке</Li>
          <Li><b className="text-purple-400">В пути</b> — товар передан в службу доставки</Li>
          <Li><b className="text-emerald-400">Доставлен</b> — товар получен покупателем</Li>
          <Li><b className="text-red-400">Отменён</b> — заказ отменён по запросу</Li>
        </ul>
        <H>Уведомления</H>
        <P>При каждом изменении статуса вы получаете уведомление на email. Включите push-уведомления в профиле.</P>
      </>
    },
    {
      label: 'Обмен, возврат, гарантия',
      content: <>
        <P>QOLDA гарантирует удобный возврат и обмен товаров.</P>
        <H>Условия возврата</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Товар надлежащего качества — в течение 14 дней</Li>
          <Li>Ненадлежащего качества — в течение 30 дней</Li>
          <Li>Товар должен быть в оригинальной упаковке</Li>
          <Li>Наличие чека или подтверждения заказа обязательно</Li>
        </ul>
        <H>Гарантия</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Электроника — 12 месяцев официальной гарантии</Li>
          <Li>Бытовая техника — 24 месяца</Li>
          <Li>Одежда и аксессуары — обмен в течение 7 дней</Li>
        </ul>
        <H>Как оформить возврат</H>
        <P>Перейдите в «Мои заказы», выберите нужный заказ и нажмите «Вернуть товар». Деньги вернутся в течение 3–5 рабочих дней.</P>
      </>
    },
    {
      label: 'Бонусная программа',
      content: <>
        <P>Зарабатывайте баллы за каждую покупку и тратьте их на следующие заказы.</P>
        <H>Как работают баллы</H>
        <ul className="space-y-1.5 mt-2">
          <Li>1 ₸ = 1 балл за обычную покупку</Li>
          <Li>2 ₸ = 1 балл за покупку по рекомендации ML-системы</Li>
          <Li>Бонус за первый заказ — 500 баллов</Li>
          <Li>Баллы за отзыв — 100 баллов</Li>
        </ul>
        <H>Уровни</H>
        <ul className="space-y-1.5 mt-2">
          <Li><b className="text-gray-300">Стандарт</b> — 0–9 999 баллов</Li>
          <Li><b className="text-yellow-400">Золотой</b> — 10 000–49 999 баллов (+5% кешбэк)</Li>
          <Li><b className="text-cyan-400">Платиновый</b> — от 50 000 баллов (+10% кешбэк)</Li>
        </ul>
      </>
    },
  ]

  const BUYERS_RIGHT: FooterItem[] = [
    {
      label: 'Юридическим лицам',
      content: <>
        <P>QOLDA предлагает специальные условия для корпоративных клиентов и юридических лиц.</P>
        <H>Преимущества</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Закрывающие документы (счёт-фактура, акт, накладная)</Li>
          <Li>НДС-счета для компаний-плательщиков</Li>
          <Li>Отсрочка платежа до 30 дней (для аккредитованных)</Li>
          <Li>Персональный менеджер для крупных заказов</Li>
          <Li>Скидки от объёма закупки от 5%</Li>
        </ul>
        <H>Как подключиться</H>
        <P>Напишите на <span className="text-[#F5A623]">b2b@qolda.kz</span> или позвоните на корпоративную линию.</P>
      </>
    },
    {
      label: 'Корпоративный отдел',
      content: <>
        <P>Корпоративный отдел QOLDA помогает компаниям выстроить эффективные закупки.</P>
        <H>Услуги</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Тендерные закупки и конкурсные предложения</Li>
          <Li>Комплектация офисов и предприятий</Li>
          <Li>Корпоративные подарки и брендинг</Li>
          <Li>IT-оснащение и электроника для бизнеса</Li>
        </ul>
        <H>Контакт</H>
        <P>Телефон корпоративного отдела: <span className="text-[#F5A623]">+7 (727) 000-01-00</span></P>
        <P>Email: <span className="text-[#F5A623]">corporate@qolda.kz</span></P>
      </>
    },
    {
      label: 'Помощь',
      content: <>
        <P>Служба поддержки QOLDA работает ежедневно с 09:00 до 22:00 по времени Алматы.</P>
        <H>Как с нами связаться</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Телефон: 8-800-08-07-021 (бесплатно)</Li>
          <Li>Email: support@qolda.kz</Li>
          <Li>Чат на сайте — ответ в течение 5 минут</Li>
          <Li>Telegram-бот: @QoldaSupport</Li>
        </ul>
        <H>Частые вопросы</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Как отменить заказ? — В разделе «Мои заказы» до отправки</Li>
          <Li>Забыл пароль? — Нажмите «Забыли пароль» на странице входа</Li>
          <Li>Как стать продавцом? — Зарегистрируйтесь и заполните анкету продавца</Li>
        </ul>
      </>
    },
    {
      label: 'Обратная связь',
      content: <>
        <P>Ваше мнение помогает нам становиться лучше. Мы ценим каждый отзыв.</P>
        <H>Каналы обратной связи</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Форма отзыва на странице товара (видна всем покупателям)</Li>
          <Li>Email: feedback@qolda.kz</Li>
          <Li>Telegram: @QoldaFeedback</Li>
          <Li>Опросы после получения заказа (приходят на email)</Li>
        </ul>
        <H>Жалобы и предложения</H>
        <P>Если у вас возникли проблемы с продавцом или качеством товара, напишите на <span className="text-[#F5A623]">claims@qolda.kz</span> — мы рассмотрим обращение в течение 24 часов.</P>
      </>
    },
    {
      label: 'Стать продавцом',
      content: <>
        <P>Начните продавать на QOLDA и получите доступ к тысячам покупателей по всему Казахстану.</P>
        <H>Шаги для старта</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Зарегистрируйтесь или войдите в аккаунт</Li>
          <Li>Заполните анкету продавца (ИИН/БИН, контакты)</Li>
          <Li>Добавьте товары с фото и описанием</Li>
          <Li>Пройдите модерацию (1–2 рабочих дня)</Li>
          <Li>Начните принимать заказы!</Li>
        </ul>
        <H>Что вы получаете</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Личный кабинет с аналитикой продаж</Li>
          <Li>AI-ассистент для описания товаров</Li>
          <Li>Попадание в ML-рекомендации покупателям</Li>
          <Li>Еженедельные выплаты на счёт</Li>
        </ul>
      </>
    },
    {
      label: 'Кабинет продавца',
      content: <>
        <P>Кабинет продавца QOLDA — полноценный инструмент управления вашим магазином.</P>
        <H>Возможности</H>
        <ul className="space-y-1.5 mt-2">
          <Li>Управление товарами (добавление, редактирование, архивация)</Li>
          <Li>Обработка заказов и статусы доставки</Li>
          <Li>Аналитика продаж: выручка, топ-товары, динамика</Li>
          <Li>AI-генерация описаний и SEO-оптимизация</Li>
          <Li>Чат с покупателями</Li>
          <Li>Управление складом и остатками</Li>
        </ul>
        <H>Доступ</H>
        <P>Перейдите в кабинет продавца через меню профиля или по ссылке <span className="text-[#F5A623]">/seller/dashboard</span>.</P>
      </>
    },
  ]

  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-16">
      {/* Top logo bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-6 flex-wrap">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#004B57] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">Q</span>
            </div>
            <span className="text-white text-xl font-black tracking-tight">QOLDA</span>
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <span className="text-white/40 text-xs font-semibold">CLUB</span>
          <div className="h-5 w-px bg-white/10" />
          <span className="text-white/40 text-xs font-mono font-semibold">&lt;tech&gt;</span>
          <div className="h-5 w-px bg-white/10" />
          <span className="text-white/40 text-xs font-semibold">GROUP</span>
        </div>
      </div>

      {/* Main columns */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <Section title="Компания"       items={COMPANY}       onOpen={setModal} />
        <Section title="Покупателям"    items={BUYERS_LEFT}   onOpen={setModal} />
        <Section title=" "              items={BUYERS_RIGHT}  onOpen={setModal} />

        {/* Contacts */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 pb-3 border-b border-white/10">Оставайтесь на связи</h4>
          <a href="tel:+77270000000" className="block text-white font-bold text-sm hover:text-[#F5A623] transition-colors mb-1">
            8-800-08-07-021
          </a>
          <p className="text-xs text-gray-500 mb-4">(с 10:00 до 22:00)</p>
          <p className="text-sm text-gray-400 mb-3">Адреса магазинов</p>

          {/* Socials */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { label: 'VK', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.72-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.677-1.253.677-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.408 4 7.932c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.848c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.168-3.607 2.168-3.607.119-.254.322-.491.762-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.712-.576.712z"/></svg> },
              { label: 'YT', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
              { label: 'TG', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
              { label: 'IG', icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
            ].map(s => (
              <a key={s.label} href="#" className="w-8 h-8 bg-white/10 hover:bg-[#F5A623] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200">
                {s.icon}
              </a>
            ))}
          </div>

          {/* Email subscribe */}
          <p className="text-xs text-gray-400 mb-2 font-medium">Следите за новинками и акциями:</p>
          <form onSubmit={e => { e.preventDefault(); setEmail('') }} className="flex overflow-hidden rounded-lg border border-white/10 focus-within:border-[#F5A623]/50 transition-colors">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Введите email и подпишитесь"
              className="flex-1 bg-white/5 text-sm text-gray-300 placeholder-gray-600 px-3 py-2.5 focus:outline-none min-w-0"
            />
            <button type="submit" className="bg-white/10 hover:bg-[#F5A623] px-3 text-gray-400 hover:text-white transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
          <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
            Подписываясь, вы соглашаетесь с условиями политики конфиденциальности.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© 2026 QOLDA — Дипломный проект</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setModal(COMPANY[4])} className="hover:text-gray-400 transition-colors">Политика конфиденциальности</button>
            <button onClick={() => setModal(COMPANY[5])} className="hover:text-gray-400 transition-colors">Правила продаж</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <FooterModal
          title={modal.label}
          content={modal.content}
          onClose={() => setModal(null)}
        />
      )}
    </footer>
  )
}
