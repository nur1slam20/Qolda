"""
Seed script: накрутить данные для продавца SAFF (id=23)
"""
import random
from datetime import datetime, timedelta
from database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
now = datetime.utcnow()
SAFF_ID = 23

# ── 1. PRODUCTS ────────────────────────────────────────────────────────────
products_data = [
    dict(name_ru="Nike Air Max 270", name_kz="Nike Air Max 270", category="Clothing",
         subcategory="Кроссовки", price=45000, discount_price=39900, stock=28,
         description_ru="Лёгкие кроссовки с воздушной подошвой", tags="nike,кроссовки,спорт"),
    dict(name_ru="Adidas Ultraboost 22", name_kz="Adidas Ultraboost 22", category="Clothing",
         subcategory="Кроссовки", price=52000, discount_price=47500, stock=3,
         description_ru="Беговые кроссовки с технологией Boost", tags="adidas,бег,кроссовки"),
    dict(name_ru="Рюкзак Fjallraven Kanken", name_kz="Fjallraven Kanken рюкзагы", category="Sports",
         subcategory="Рюкзаки", price=32000, discount_price=None, stock=15,
         description_ru="Классический городской рюкзак 16L", tags="рюкзак,школа,городской"),
    dict(name_ru="Наушники Sony WH-1000XM5", name_kz="Sony WH-1000XM5 құлаққап", category="Electronics",
         subcategory="Наушники", price=120000, discount_price=98000, stock=7,
         description_ru="Наушники с шумоподавлением, 30ч работы", tags="sony,наушники,bluetooth"),
    dict(name_ru="Samsung Galaxy Watch 6", name_kz="Samsung Galaxy Watch 6", category="Electronics",
         subcategory="Часы", price=89000, discount_price=79000, stock=0,
         description_ru="Умные часы с мониторингом здоровья", tags="samsung,часы,смарт"),
    dict(name_ru="Куртка Columbia Powder Lite", name_kz="Columbia Powder Lite куртка", category="Clothing",
         subcategory="Куртки", price=68000, discount_price=55000, stock=2,
         description_ru="Тёплая зимняя куртка", tags="columbia,куртка,зима"),
    dict(name_ru="Протеин Optimum Nutrition 2кг", name_kz="Optimum Nutrition протеин 2кг", category="Sports",
         subcategory="Спортпит", price=18500, discount_price=None, stock=42,
         description_ru="Сывороточный протеин Gold Standard", tags="протеин,спортпит,белок"),
    dict(name_ru="Коврик для йоги Gaiam 6мм", name_kz="Gaiam йога килемшесі 6мм", category="Sports",
         subcategory="Йога", price=9800, discount_price=7900, stock=19,
         description_ru="Нескользящий коврик для йоги", tags="йога,коврик,фитнес"),
    dict(name_ru="Термос Stanley Classic 1L", name_kz="Stanley Classic 1L термос", category="Home",
         subcategory="Посуда", price=16500, discount_price=None, stock=11,
         description_ru="Классический термос с пожизненной гарантией", tags="термос,stanley,туризм"),
    dict(name_ru="Велошлем Giro Syntax MIPS", name_kz="Giro Syntax MIPS велосипед дулығасы", category="Sports",
         subcategory="Велоспорт", price=24000, discount_price=None, stock=6,
         description_ru="Аэродинамический шлем для шоссейного велоспорта", tags="велошлем,giro"),
]

product_ids = []
for pd in products_data:
    combined = f"{pd['name_ru']} {pd['name_kz']} {pd['category']} {pd.get('description_ru','')} {pd.get('tags','')}"
    res = db.execute(text("""
        INSERT INTO products (name_ru, name_kz, description_ru, description_kz, category, subcategory,
            price, discount_price, stock, tags, seller_id, combined_text, avg_rating, review_count, created_at)
        VALUES (:name_ru, :name_kz, :desc, :desc, :cat, :subcat,
            :price, :disc, :stock, :tags, :seller_id, :combined, :rating, :reviews, :created_at)
        RETURNING id
    """), dict(
        name_ru=pd["name_ru"], name_kz=pd["name_kz"],
        desc=pd.get("description_ru", ""), cat=pd["category"],
        subcat=pd.get("subcategory"), price=pd["price"],
        disc=pd.get("discount_price"), stock=pd["stock"],
        tags=pd.get("tags", ""), seller_id=SAFF_ID,
        combined=combined.strip(),
        rating=round(random.uniform(3.9, 5.0), 1),
        reviews=random.randint(8, 150),
        created_at=now - timedelta(days=random.randint(10, 60)),
    ))
    pid = res.fetchone()[0]
    product_ids.append((pid, pd["price"], pd.get("discount_price")))

db.commit()
print(f"✓ Products: {len(product_ids)}")

# ── 2. ORDERS ──────────────────────────────────────────────────────────────
client_ids = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
names = {2:"Зарина",3:"Тимур",4:"Дана",5:"Нурлан",6:"Айгул",7:"Серик",
         8:"Гулнар",9:"Бауыржан",10:"Медина",11:"Аскар",12:"Сауле",
         13:"Ержан",14:"Камила",15:"Дамир"}
phones = {2:"771112233",3:"700223344",4:"707334455",5:"702445566",
          6:"705556677",7:"708667788",8:"771778899",9:"700889900",
          10:"707990011",11:"702001122",12:"705112233",13:"708223344",
          14:"771334455",15:"700445566"}
addresses = [
    "Алматы, ул. Абая 150, кв 12",
    "Алматы, пр. Достык 240, кв 3",
    "Астана, ул. Сейфуллина 45, кв 7",
    "Алматы, ул. Байзакова 280, кв 55",
    "Шымкент, пр. Кунаева 12, кв 8",
    "Алматы, мкр. Алмагуль, д.5 кв.18",
    "Алматы, ул. Тимирязева 42, кв 9",
]

statuses_pool = (
    ["completed"] * 16 +
    ["shipped"]   * 6  +
    ["processing"] * 5 +
    ["cancelled"]  * 6 +
    ["pending"]    * 3
)
random.shuffle(statuses_pool)

history_notes = {
    "pending":    "Заказ оформлен",
    "processing": "Передан продавцу",
    "shipped":    "Отправлен курьером",
    "completed":  "Доставлен и получен",
    "cancelled":  "Отменён",
}

for status in statuses_pool:
    buyer_id = random.choice(client_ids)
    days_ago = random.randint(1, 90)
    created_at = now - timedelta(days=days_ago, hours=random.randint(0, 23))

    n_items = random.randint(1, 3)
    selected_prods = random.sample(product_ids, min(n_items, len(product_ids)))

    total = sum((disc or price) * random.randint(1, 2) for _, price, disc in selected_prods)

    res = db.execute(text("""
        INSERT INTO orders (user_id, total_amount, status, delivery_address,
            customer_name, customer_phone, created_at)
        VALUES (:uid, :total, :status, :addr, :cname, :phone, :created_at)
        RETURNING id
    """), dict(
        uid=buyer_id, total=total, status=status,
        addr=random.choice(addresses),
        cname=names.get(buyer_id, "Клиент"),
        phone=phones.get(buyer_id, "700000000"),
        created_at=created_at,
    ))
    order_id = res.fetchone()[0]

    for pid, price, disc in selected_prods:
        qty = random.randint(1, 2)
        db.execute(text("""
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (:oid, :pid, :qty, :price)
        """), dict(oid=order_id, pid=pid, qty=qty, price=disc or price))

    # History
    chain = {
        "completed": ["pending", "processing", "shipped", "completed"],
        "shipped":   ["pending", "processing", "shipped"],
        "processing":["pending", "processing"],
        "cancelled": ["pending", "cancelled"],
        "pending":   ["pending"],
    }
    step_time = created_at
    for step in chain.get(status, ["pending"]):
        db.execute(text("""
            INSERT INTO order_status_history (order_id, status, changed_at)
            VALUES (:oid, :status, :ts)
        """), dict(oid=order_id, status=step, ts=step_time))
        step_time += timedelta(hours=random.randint(6, 24))

db.commit()
print(f"✓ Orders: {len(statuses_pool)}")

# ── 3. MESSAGES ───────────────────────────────────────────────────────────
conversations = [
    (2, [
        (2,       "Здравствуйте! Есть ли Nike Air Max 270 в размере 43?"),
        (SAFF_ID, "Добрый день! Да, размеры 42–45 в наличии."),
        (2,       "Отлично! Возможна ли доставка сегодня?"),
        (SAFF_ID, "Да, доставим до 18:00. Оформляйте заказ!"),
        (2,       "Спасибо, уже оформил!"),
        (SAFF_ID, "Принято! Курьер свяжется за час до доставки."),
        (2,       "Получил, отличные кроссовки!"),
        (SAFF_ID, "Рады слышать! Оставьте отзыв пожалуйста 😊"),
    ]),
    (3, [
        (3,       "Добрый день! Sony WH-1000XM5 — это оригинал?"),
        (SAFF_ID, "Да, 100% оригинал, есть чек и гарантия 1 год."),
        (3,       "Можно ли проверить перед покупкой?"),
        (SAFF_ID, "Конечно! Закажите с возможностью возврата."),
        (3,       "Хорошо, оформлю онлайн тогда."),
        (SAFF_ID, "Отлично! Если что, пишите."),
        (3,       "Получил товар, всё отлично! Спасибо!"),
        (SAFF_ID, "Рады слышать! 🙌"),
    ]),
    (4, [
        (4,       "Куртка Columbia — есть размер L?"),
        (SAFF_ID, "Да, L есть, осталось 2 штуки."),
        (4,       "А скидка ещё действует?"),
        (SAFF_ID, "Да, 55 000₸ вместо 68 000₸, до конца недели."),
        (4,       "Беру! Спасибо"),
        (SAFF_ID, "Оформляйте, доставим завтра!"),
    ]),
    (5, [
        (5,       "Здравствуйте, протеин Optimum — какой вкус есть?"),
        (SAFF_ID, "Добрый день! Шоколад, ваниль и клубника."),
        (5,       "Шоколад в наличии?"),
        (SAFF_ID, "Да, 15 штук на складе."),
        (5,       "Возьму 2 шт! Когда привезёте?"),
        (SAFF_ID, "Завтра до обеда доставим."),
        (5,       "Отлично, жду!"),
        (SAFF_ID, "Принято! Спасибо за заказ 💪"),
    ]),
    (6, [
        (6,       "Рюкзак Kanken — это оригинал?"),
        (SAFF_ID, "Да, оригинальный Fjallraven, привезён из Европы."),
        (6,       "Подойдёт для учёбы?"),
        (SAFF_ID, "Идеально! Многие берут для школы и универа."),
        (6,       "Оформлю сегодня, спасибо!"),
    ]),
    (7, [
        (7,       "Galaxy Watch 6 — есть в наличии?"),
        (SAFF_ID, "К сожалению, сейчас нет, ожидаем поставку через неделю."),
        (7,       "Можно ли оставить предзаказ?"),
        (SAFF_ID, "Да! Напишите номер, сообщим как появится."),
        (7,       "+7 777 123 4567"),
        (SAFF_ID, "Записали! Спасибо за интерес 🙏"),
    ]),
    (8, [
        (8,       "Термос Stanley — есть гарантия?"),
        (SAFF_ID, "Да, пожизненная гарантия от производителя!"),
        (8,       "Серьёзно? Пожизненная?"),
        (SAFF_ID, "Да, это фирменная политика Stanley 😊"),
        (8,       "Тогда беру! Это подарок на день рождения."),
        (SAFF_ID, "Отличный выбор! Упакуем в подарочную упаковку."),
        (8,       "Вау, спасибо!"),
        (SAFF_ID, "Всегда пожалуйста! Доставим завтра."),
        (8,       "Подарок очень понравился, спасибо!"),
        (SAFF_ID, "Рады стараться! 🎁"),
    ]),
    (9, [
        (9,       "Велошлем Giro — подойдёт для горного байка?"),
        (SAFF_ID, "Он больше для шоссе. Для горного нужен MTB шлем."),
        (9,       "У вас есть MTB шлемы?"),
        (SAFF_ID, "Пока нет, но скоро добавим. Напишу вам!"),
        (9,       "Окей, спасибо за честность!"),
    ]),
    (10, [
        (10,      "Наушники Sony работают с iPhone?"),
        (SAFF_ID, "Да, совместимы через Bluetooth или 3.5мм."),
        (10,      "Шумоподавление реально работает?"),
        (SAFF_ID, "Одно из лучших! 30 часов автономно."),
        (10,      "Есть ли рассрочка?"),
        (SAFF_ID, "Да, через Kaspi — 0-0-24!"),
        (10,      "Идеально, оформляю!"),
        (SAFF_ID, "Отлично! Доставим в течение 2 дней."),
    ]),
    (11, [
        (11,      "Коврик для йоги — какая толщина?"),
        (SAFF_ID, "6 мм, нескользящее покрытие с обеих сторон."),
        (11,      "Для горячей йоги подойдёт?"),
        (SAFF_ID, "Да, материал термостойкий."),
        (11,      "Беру! Спасибо за быстрый ответ"),
        (SAFF_ID, "Пожалуйста! Доставим завтра 🧘"),
    ]),
]

base_time = now - timedelta(days=28)
for client_id, msgs in conversations:
    t = base_time + timedelta(days=random.randint(0, 20), hours=random.randint(9, 21))
    for sender_id, txt in msgs:
        receiver_id = client_id if sender_id == SAFF_ID else SAFF_ID
        db.execute(text("""
            INSERT INTO messages (sender_id, receiver_id, text, is_read, created_at)
            VALUES (:sid, :rid, :txt, true, :ts)
        """), dict(sid=sender_id, rid=receiver_id, txt=txt, ts=t))
        t += timedelta(minutes=random.randint(3, 90))

db.commit()
print(f"✓ Messages: {len(conversations)} conversations")
print("All done!")
db.close()
