import { useLangStore } from '../store/langStore'
import type { Lang } from '../store/langStore'

const t: Record<string, Record<Lang, string>> = {
  // Header
  search_placeholder: { ru: 'Поиск товаров...',       kz: 'Тауар іздеу...',          en: 'Search products...' },
  favorites:          { ru: 'Избранное',               kz: 'Таңдаулы',                en: 'Wishlist' },
  cart:               { ru: 'Корзина',                 kz: 'Себет',                   en: 'Cart' },
  logout:             { ru: 'Выйти',                   kz: 'Шығу',                    en: 'Log out' },
  login:              { ru: 'Войти',                   kz: 'Кіру',                    en: 'Log in' },
  register:           { ru: 'Регистрация',             kz: 'Тіркелу',                 en: 'Sign up' },
  my_orders:          { ru: 'Мои заказы',              kz: 'Тапсырыстарым',           en: 'My orders' },
  my_store:           { ru: 'Мой магазин',             kz: 'Дүкенім',                 en: 'My store' },
  cabinet:            { ru: 'Кабинет',                 kz: 'Кабинет',                 en: 'Dashboard' },
  admin_panel:        { ru: 'Admin панель',            kz: 'Admin панель',             en: 'Admin panel' },

  // Product card
  add_to_cart:        { ru: 'В корзину',               kz: 'Себетке',                 en: 'Add to cart' },
  buy_now:            { ru: 'Купить',                  kz: 'Сатып алу',               en: 'Buy now' },
  in_stock:           { ru: 'В наличии',               kz: 'Қолда бар',               en: 'In stock' },
  out_of_stock:       { ru: 'Нет в наличии',           kz: 'Қолда жоқ',               en: 'Out of stock' },
  reviews:            { ru: 'отзывов',                 kz: 'пікір',                   en: 'reviews' },

  // Cart
  your_cart:          { ru: 'Ваша корзина',            kz: 'Сіздің себетіңіз',        en: 'Your cart' },
  cart_empty:         { ru: 'Корзина пуста',           kz: 'Себет бос',               en: 'Cart is empty' },
  total:              { ru: 'Итого',                   kz: 'Жиыны',                   en: 'Total' },
  checkout:           { ru: 'Оформить заказ',          kz: 'Тапсырыс беру',           en: 'Checkout' },
  remove:             { ru: 'Удалить',                 kz: 'Жою',                     en: 'Remove' },

  // Home
  recommended:        { ru: 'Рекомендуем',             kz: 'Ұсынамыз',                en: 'Recommended' },
  all_products:       { ru: 'Все товары',              kz: 'Барлық тауар',            en: 'All products' },
  categories:         { ru: 'Категории',               kz: 'Санаттар',                en: 'Categories' },
  see_all:            { ru: 'Смотреть все',            kz: 'Барлығын көру',           en: 'See all' },

  // Orders / Profile
  orders:             { ru: 'Заказы',                  kz: 'Тапсырыстар',             en: 'Orders' },
  order_status:       { ru: 'Статус',                  kz: 'Күй',                     en: 'Status' },
  order_date:         { ru: 'Дата',                    kz: 'Күні',                    en: 'Date' },
  profile:            { ru: 'Профиль',                 kz: 'Профиль',                 en: 'Profile' },
  save:               { ru: 'Сохранить',               kz: 'Сақтау',                  en: 'Save' },
  cancel:             { ru: 'Отмена',                  kz: 'Болдырмау',               en: 'Cancel' },
  edit:               { ru: 'Редактировать',           kz: 'Өңдеу',                   en: 'Edit' },

  // Footer — brand
  footer_desc:        {
    ru: 'Умный маркетплейс — персонализированная торговая платформа на основе алгоритмов машинного обучения.',
    kz: 'Ақылды маркетплейс — машиналық оқыту алгоритмдеріне негізделген персонализацияланған сауда платформасы.',
    en: 'Smart marketplace — a personalised shopping platform powered by machine learning algorithms.',
  },

  // Footer — headings
  footer_categories:  { ru: 'Категории',               kz: 'Санаттар',                en: 'Categories' },
  footer_account:     { ru: 'Аккаунт',                 kz: 'Аккаунт',                 en: 'Account' },
  footer_sellers:     { ru: 'Продавцам',               kz: 'Сатушыларға',             en: 'For sellers' },

  // Footer — category labels
  cat_electronics:    { ru: 'Электроника',             kz: 'Электроника',             en: 'Electronics' },
  cat_clothing:       { ru: 'Одежда',                  kz: 'Киім',                    en: 'Clothing' },
  cat_books:          { ru: 'Книги',                   kz: 'Кітаптар',                en: 'Books' },
  cat_home:           { ru: 'Дом',                     kz: 'Үй',                      en: 'Home' },
  cat_sports:         { ru: 'Спорт',                   kz: 'Спорт',                   en: 'Sports' },

  // Footer — account links
  footer_profile:     { ru: 'Профиль',                 kz: 'Профиль',                 en: 'Profile' },
  footer_orders:      { ru: 'Мои заказы',              kz: 'Тапсырыстарым',           en: 'My orders' },
  footer_cart:        { ru: 'Корзина',                 kz: 'Себет',                   en: 'Cart' },
  footer_login:       { ru: 'Войти',                   kz: 'Кіру',                    en: 'Log in' },
  footer_register:    { ru: 'Регистрация',             kz: 'Тіркелу',                 en: 'Sign up' },

  // Footer — seller links
  footer_start_sell:  { ru: 'Начать продавать',        kz: 'Сату бастау',             en: 'Start selling' },
  footer_seller_cab:  { ru: 'Кабинет продавца',        kz: 'Сатушы кабинеті',         en: 'Seller dashboard' },
  footer_diploma:     { ru: 'Дипломный проект',        kz: 'Дипломдық жоба',          en: 'Diploma project' },
  footer_diploma_desc:{
    ru: 'Гибридная ML-система рекомендаций: Collaborative Filtering (SVD) + Content-Based (TF-IDF)',
    kz: 'Гибридті ML ұсыным жүйесі: Collaborative Filtering (SVD) + Content-Based (TF-IDF)',
    en: 'Hybrid ML recommendation system: Collaborative Filtering (SVD) + Content-Based (TF-IDF)',
  },

  // Footer — bottom
  footer_copyright:   { ru: 'Все права защищены',      kz: 'Барлық құқықтар қорғалған', en: 'All rights reserved' },
  footer_project:     { ru: 'Дипломный проект',        kz: 'Дипломдық жоба',          en: 'Diploma project' },
}

export function useT() {
  const lang = useLangStore(s => s.lang)
  return (key: string): string => t[key]?.[lang] ?? t[key]?.['ru'] ?? key
}
