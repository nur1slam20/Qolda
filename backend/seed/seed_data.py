"""
Seed script: inserts 50 products, 20 users, 200 orders, 150 reviews.
Run from /backend directory:
    python -m seed.seed_data
"""
import sys
import os
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
import models
from auth import get_password_hash
from ml.trainer import train_model

random.seed(42)

# ── Product data ──────────────────────────────────────────────────────────────

PRODUCTS = [
    # ─── Electronics (10) ─────────────────────────────────────────────────────
    {
        "name_kz": "Samsung Galaxy A54 смартфоны",
        "name_ru": "Смартфон Samsung Galaxy A54",
        "description_kz": "6.4 дюймдік Super AMOLED экран, 5000 mAh батарея, 128 ГБ жады",
        "description_ru": "Экран Super AMOLED 6.4\", батарея 5000 мАч, память 128 ГБ, камера 50 МП",
        "category": "Electronics",
        "subcategory": "Smartphones",
        "tags": "samsung galaxy smartphone android 5g",
        "price": 199990,
        "discount_price": 179990,
        "image_url": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
        "stock": 45,
    },
    {
        "name_kz": "Apple iPhone 15 128GB смартфоны",
        "name_ru": "Смартфон Apple iPhone 15 128GB",
        "description_kz": "A16 Bionic чипі, Dynamic Island, 48 МП камера, USB-C",
        "description_ru": "Чип A16 Bionic, Dynamic Island, камера 48 МП, USB-C разъём",
        "category": "Electronics",
        "subcategory": "Smartphones",
        "tags": "apple iphone ios smartphone premium",
        "price": 449990,
        "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
        "stock": 30,
    },
    {
        "name_kz": "Apple MacBook Pro 14 M3 ноутбугы",
        "name_ru": "Ноутбук Apple MacBook Pro 14 M3",
        "description_kz": "Apple M3 чипі, 16 ГБ RAM, 512 ГБ SSD, Liquid Retina XDR дисплей",
        "description_ru": "Чип Apple M3, 16 ГБ RAM, 512 ГБ SSD, дисплей Liquid Retina XDR",
        "category": "Electronics",
        "subcategory": "Laptops",
        "tags": "apple macbook laptop m3 professional macos",
        "price": 899990,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        "stock": 15,
    },
    {
        "name_kz": "Lenovo IdeaPad 3 ноутбугы",
        "name_ru": "Ноутбук Lenovo IdeaPad 3",
        "description_kz": "Intel Core i5, 8 ГБ RAM, 256 ГБ SSD, 15.6 дюйм FHD дисплей",
        "description_ru": "Intel Core i5, 8 ГБ RAM, 256 ГБ SSD, дисплей 15.6\" FHD",
        "category": "Electronics",
        "subcategory": "Laptops",
        "tags": "lenovo ideapad laptop windows intel student budget",
        "price": 289990,
        "discount_price": 259990,
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
        "stock": 25,
    },
    {
        "name_kz": "Sony WH-1000XM5 сымсыз құлаққаптар",
        "name_ru": "Беспроводные наушники Sony WH-1000XM5",
        "description_kz": "Бас шуылды болдырмау, 30 сағат жұмыс уақыты, Hi-Res Audio",
        "description_ru": "Шумоподавление, 30 часов работы, Hi-Res Audio, складная конструкция",
        "category": "Electronics",
        "subcategory": "Audio",
        "tags": "sony headphones noise cancelling wireless audio premium",
        "price": 159990,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        "stock": 35,
    },
    {
        "name_kz": "Samsung 55\" 4K QLED телевизоры",
        "name_ru": "Телевизор Samsung 55\" 4K QLED",
        "description_kz": "4K QLED технологиясы, Smart TV, HDR10+, 120 Гц жаңару жылдамдығы",
        "description_ru": "Технология 4K QLED, Smart TV, HDR10+, частота обновления 120 Гц",
        "category": "Electronics",
        "subcategory": "TVs",
        "tags": "samsung television 4k qled smart tv hdr",
        "price": 399990,
        "discount_price": 349990,
        "image_url": "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400",
        "stock": 20,
    },
    {
        "name_kz": "Apple Watch Series 9 смарт сағаты",
        "name_ru": "Смарт-часы Apple Watch Series 9",
        "description_kz": "S9 чипі, Always-On Retina дисплей, денсаулық мониторингі, GPS",
        "description_ru": "Чип S9, дисплей Always-On Retina, мониторинг здоровья, GPS",
        "category": "Electronics",
        "subcategory": "Wearables",
        "tags": "apple watch smartwatch fitness health gps",
        "price": 249990,
        "image_url": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
        "stock": 28,
    },
    {
        "name_kz": "Xiaomi Mi Band 8 фитнес-білезігі",
        "name_ru": "Фитнес-браслет Xiaomi Mi Band 8",
        "description_kz": "1.62 дюймдік AMOLED дисплей, 16 күн жұмыс уақыты, 150+ спорт режимі",
        "description_ru": "Дисплей AMOLED 1.62\", 16 дней работы, 150+ режимов спорта",
        "category": "Electronics",
        "subcategory": "Wearables",
        "tags": "xiaomi mi band fitness bracelet heart rate sleep tracking",
        "price": 24990,
        "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?w=400",
        "stock": 80,
    },
    {
        "name_kz": "Canon EOS R50 кинокамерасы",
        "name_ru": "Фотоаппарат Canon EOS R50",
        "description_kz": "24.2 МП матрица, 4K бейне, RF байонеті, 15 кадр/с серия",
        "description_ru": "Матрица 24.2 МП, видео 4K, байонет RF, серийная съёмка 15 к/с",
        "category": "Electronics",
        "subcategory": "Cameras",
        "tags": "canon camera mirrorless photography 4k rf",
        "price": 499990,
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
        "stock": 12,
    },
    {
        "name_kz": "iPad Air 5 Wi-Fi 64GB планшеті",
        "name_ru": "Планшет iPad Air 5 Wi-Fi 64GB",
        "description_kz": "M1 чипі, 10.9 дюймдік Liquid Retina, Touch ID, USB-C",
        "description_ru": "Чип M1, дисплей Liquid Retina 10.9\", Touch ID, USB-C",
        "category": "Electronics",
        "subcategory": "Tablets",
        "tags": "apple ipad tablet m1 pencil productivity",
        "price": 349990,
        "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
        "stock": 22,
    },

    # ─── Clothing (10) ────────────────────────────────────────────────────────
    {
        "name_kz": "Adidas Ultraboost 22 жүгіру кроссовкалары",
        "name_ru": "Кроссовки для бега Adidas Ultraboost 22",
        "description_kz": "BOOST технологиясы, Continental резеңке подошва, Primeknit+ жоғарғы бөлігі",
        "description_ru": "Технология BOOST, подошва Continental резина, верх Primeknit+",
        "category": "Clothing",
        "subcategory": "Footwear",
        "tags": "adidas ultraboost running shoes sport sneakers",
        "price": 89990,
        "discount_price": 74990,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        "stock": 50,
    },
    {
        "name_kz": "Nike Air Max 270 спорт аяқ киімі",
        "name_ru": "Кроссовки Nike Air Max 270",
        "description_kz": "Max Air 270 амортизациясы, мешка материал, 270° Air бірлігі",
        "description_ru": "Амортизация Max Air 270, сетчатый верх, блок воздуха 270°",
        "category": "Clothing",
        "subcategory": "Footwear",
        "tags": "nike air max sneakers sport casual lifestyle",
        "price": 79990,
        "image_url": "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400",
        "stock": 60,
    },
    {
        "name_kz": "Levi's 501 Original джинсы",
        "name_ru": "Джинсы Levi's 501 Original",
        "description_kz": "Классикалық прямой крой, 100% мақта, тас жуылған эффект",
        "description_ru": "Классический прямой крой, 100% хлопок, эффект стирки с камнями",
        "category": "Clothing",
        "subcategory": "Pants",
        "tags": "levis 501 jeans denim classic cotton casual",
        "price": 39990,
        "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400",
        "stock": 70,
    },
    {
        "name_kz": "Zara классикалық пальто",
        "name_ru": "Классическое пальто Zara",
        "description_kz": "Ваулды тоқыма, двубортты дизайн, бүйір қалталар",
        "description_ru": "Шерстяное плетение, двубортный дизайн, боковые карманы",
        "category": "Clothing",
        "subcategory": "Outerwear",
        "tags": "zara coat wool classic overcoat fashion",
        "price": 59990,
        "discount_price": 44990,
        "image_url": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
        "stock": 30,
    },
    {
        "name_kz": "Under Armour жаттығу костюмі",
        "name_ru": "Спортивный костюм Under Armour",
        "description_kz": "UA RUSH технологиясы, тершіктен шығаратын материал, бейсек + шалбар",
        "description_ru": "Технология UA RUSH, влагоотводящий материал, куртка + штаны",
        "category": "Clothing",
        "subcategory": "Sportswear",
        "tags": "under armour sportswear training athletic gym fitness",
        "price": 49990,
        "image_url": "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=400",
        "stock": 40,
    },
    {
        "name_kz": "Champion худи классикалық",
        "name_ru": "Худи классическое Champion",
        "description_kz": "Флисті ішкі жиек, кенгуру қалтасы, қабырғалы манжеталар",
        "description_ru": "Флисовая подкладка, карман-кенгуру, рифлёные манжеты",
        "category": "Clothing",
        "subcategory": "Hoodies",
        "tags": "champion hoodie sweatshirt casual cotton fleece",
        "price": 19990,
        "image_url": "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400",
        "stock": 90,
    },
    {
        "name_kz": "Columbia Arcadia II жаңбыр куртка",
        "name_ru": "Куртка-дождевик Columbia Arcadia II",
        "description_kz": "Omni-Tech су өткізбейтін мембрана, реттелетін капюшон, жарым-жартылай сыртқы қалталар",
        "description_ru": "Мембрана Omni-Tech водонепроницаемая, регулируемый капюшон",
        "category": "Clothing",
        "subcategory": "Outerwear",
        "tags": "columbia rain jacket waterproof outdoor hiking",
        "price": 44990,
        "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
        "stock": 35,
    },
    {
        "name_kz": "New Balance 574 кроссовкалары",
        "name_ru": "Кроссовки New Balance 574",
        "description_kz": "ENCAP технологиясы, тері мен замшадан, күнделікті киюге арналған",
        "description_ru": "Технология ENCAP, кожа и замша, для повседневной носки",
        "category": "Clothing",
        "subcategory": "Footwear",
        "tags": "new balance 574 lifestyle sneakers casual leather",
        "price": 54990,
        "image_url": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400",
        "stock": 55,
    },
    {
        "name_kz": "Tommy Hilfiger поло көйлегі",
        "name_ru": "Поло Tommy Hilfiger",
        "description_kz": "100% мақта пике, классикалық логотип, Regular Fit",
        "description_ru": "100% хлопок пике, классический логотип, Regular Fit",
        "category": "Clothing",
        "subcategory": "Tops",
        "tags": "tommy hilfiger polo shirt cotton classic preppy",
        "price": 24990,
        "image_url": "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400",
        "stock": 65,
    },
    {
        "name_kz": "Puma Essential Logo флис кофтасы",
        "name_ru": "Флисовая кофта Puma Essential Logo",
        "description_kz": "Микрофлис материалы, Puma брендінің логотипі, Regular Fit",
        "description_ru": "Материал микрофлис, фирменный логотип Puma, Regular Fit",
        "category": "Clothing",
        "subcategory": "Sweatshirts",
        "tags": "puma fleece sweatshirt comfortable casual sport",
        "price": 17990,
        "image_url": "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=400",
        "stock": 75,
    },

    # ─── Books (10) ───────────────────────────────────────────────────────────
    {
        "name_kz": "«Көшпенділер» Ілияс Есенберлін кітабы",
        "name_ru": "Книга «Кочевники» Ильяс Есенберлин",
        "description_kz": "Қазақ халқының тарихы туралы эпикалық роман-трилогия. Қазақ классикасы.",
        "description_ru": "Эпическая роман-трилогия об истории казахского народа. Классика казахской литературы.",
        "category": "Books",
        "subcategory": "Fiction",
        "tags": "kazakh literature history novel epic classic esenberglin",
        "price": 4990,
        "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        "stock": 100,
    },
    {
        "name_kz": "«Бай мен кедей» Роберт Кийосаки",
        "name_ru": "«Богатый папа, бедный папа» Роберт Кийосаки",
        "description_kz": "Қаржылық сауаттылық туралы мотивациялық бестселлер кітап",
        "description_ru": "Мотивационный бестселлер о финансовой грамотности и инвестициях",
        "category": "Books",
        "subcategory": "Non-Fiction",
        "tags": "kiyosaki rich dad poor dad finance investment self help bestseller",
        "price": 3490,
        "image_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
        "stock": 120,
    },
    {
        "name_kz": "«1984» Джордж Оруэлл романы",
        "name_ru": "Роман «1984» Джордж Оруэлл",
        "description_kz": "Дистопиялық антиутопиялық роман, тоталитаризм туралы классика",
        "description_ru": "Дистопический роман об антиутопическом будущем и тоталитаризме",
        "category": "Books",
        "subcategory": "Fiction",
        "tags": "orwell 1984 dystopia political classic fiction english",
        "price": 2990,
        "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
        "stock": 90,
    },
    {
        "name_kz": "«Атомдық дағдылар» Джеймс Клир",
        "name_ru": "«Атомные привычки» Джеймс Клир",
        "description_kz": "Өмірді өзгертетін шағын дағдылар жүйесі туралы бестселлер",
        "description_ru": "Бестселлер о системе маленьких привычек, меняющих жизнь",
        "category": "Books",
        "subcategory": "Self-Help",
        "tags": "atomic habits james clear productivity self improvement bestseller",
        "price": 3990,
        "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        "stock": 110,
    },
    {
        "name_kz": "«Python-мен машиналық оқыту»",
        "name_ru": "«Машинное обучение на Python»",
        "description_kz": "ML алгоритмдері, scikit-learn, нейрондық желілер туралы толық нұсқаулық",
        "description_ru": "Полное руководство по ML алгоритмам, scikit-learn и нейронным сетям",
        "category": "Books",
        "subcategory": "Technology",
        "tags": "python machine learning programming data science sklearn neural network",
        "price": 6990,
        "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
        "stock": 60,
    },
    {
        "name_kz": "«Жылдам ойла, баяу шеш» Даниэль Канеман",
        "name_ru": "«Думай медленно, решай быстро» Даниэль Канеман",
        "description_kz": "Нобель сыйлығының лауреаты психология мен экономика жайлы",
        "description_ru": "Нобелевский лауреат о психологии принятия решений и поведенческой экономике",
        "category": "Books",
        "subcategory": "Psychology",
        "tags": "kahneman thinking psychology cognitive bias behavioral economics",
        "price": 4490,
        "image_url": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
        "stock": 80,
    },
    {
        "name_kz": "«Дон Кихот» Сервантес",
        "name_ru": "«Дон Кихот» Сервантес",
        "description_kz": "Дүниежүзілік әдебиеттің ең ұлы шығармасы, классикалық роман",
        "description_ru": "Величайшее произведение мировой литературы, классический роман",
        "category": "Books",
        "subcategory": "Fiction",
        "tags": "cervantes don quixote classic world literature novel",
        "price": 3490,
        "image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
        "stock": 70,
    },
    {
        "name_kz": "«Дизайн ойлау» Тим Браун",
        "name_ru": "«Дизайн-мышление» Тим Браун",
        "description_kz": "IDEO компаниясының генеральным директорының инновациялар туралы кітабы",
        "description_ru": "Книга гендиректора IDEO об инновациях через дизайн-мышление",
        "category": "Books",
        "subcategory": "Business",
        "tags": "design thinking innovation ideo business creativity",
        "price": 5490,
        "image_url": "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400",
        "stock": 50,
    },
    {
        "name_kz": "«Гарри Поттер және философ тасы»",
        "name_ru": "«Гарри Поттер и философский камень»",
        "description_kz": "Дж.К.Роулингтің атақты балаларға арналған сиқырлы романы",
        "description_ru": "Знаменитый роман Дж.К.Роулинг о юном волшебнике",
        "category": "Books",
        "subcategory": "Fiction",
        "tags": "harry potter rowling fantasy magic children fiction",
        "price": 2990,
        "image_url": "https://images.unsplash.com/photo-1598618443855-232ee0f819f6?w=400",
        "stock": 95,
    },
    {
        "name_kz": "«Стив Джобс» Уолтер Айзексон",
        "name_ru": "«Стив Джобс» Уолтер Айзексон",
        "description_kz": "Apple негізін қалаушының өмірбаяны, инновация мен шығармашылық туралы",
        "description_ru": "Биография основателя Apple об инновациях, перфекционизме и творчестве",
        "category": "Books",
        "subcategory": "Biography",
        "tags": "steve jobs apple biography isaacson innovation tech",
        "price": 4990,
        "image_url": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400",
        "stock": 75,
    },

    # ─── Home & Garden (10) ───────────────────────────────────────────────────
    {
        "name_kz": "Dyson V15 Detect сымсыз шаңсорғыш",
        "name_ru": "Беспроводной пылесос Dyson V15 Detect",
        "description_kz": "Лазерлік шаң анықтау, 60 минут жұмыс, HEPA сүзгі",
        "description_ru": "Лазерное обнаружение пыли, 60 минут работы, фильтр HEPA",
        "category": "Home",
        "subcategory": "Appliances",
        "tags": "dyson vacuum cleaner cordless hepa home cleaning",
        "price": 299990,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "stock": 18,
    },
    {
        "name_kz": "Xiaomi Robot Vacuum E10 роботы",
        "name_ru": "Робот-пылесос Xiaomi Robot Vacuum E10",
        "description_kz": "2500 Па сору күші, Mi Home қолданбасы, автоматты зарядтау",
        "description_ru": "Всасывание 2500 Па, приложение Mi Home, автозарядка",
        "category": "Home",
        "subcategory": "Appliances",
        "tags": "xiaomi robot vacuum smart home cleaning automatic wifi",
        "price": 79990,
        "discount_price": 69990,
        "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400",
        "stock": 25,
    },
    {
        "name_kz": "Tefal Cook4Me+ Express мультиварка",
        "name_ru": "Мультиварка Tefal Cook4Me+ Express",
        "description_kz": "6 литр, 150-ден астам рецепт, қысымды пісіру, LCD экран",
        "description_ru": "6 литров, более 150 рецептов, скороварка, LCD-экран",
        "category": "Home",
        "subcategory": "Kitchen",
        "tags": "tefal multicooker pressure cooker kitchen recipe smart",
        "price": 89990,
        "image_url": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400",
        "stock": 30,
    },
    {
        "name_kz": "De'Longhi Magnifica Evo кофемашинасы",
        "name_ru": "Кофемашина De'Longhi Magnifica Evo",
        "description_kz": "Автоматты кофемашина, кіріктірілген диірмен, сүтті қаймақтандырғыш",
        "description_ru": "Автоматическая, встроенная кофемолка, автоматический капучинатор",
        "category": "Home",
        "subcategory": "Kitchen",
        "tags": "delonghi coffee machine espresso automatic grinder cappuccino",
        "price": 249990,
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        "stock": 14,
    },
    {
        "name_kz": "IKEA SÖDERHAMN диван",
        "name_ru": "Диван IKEA SÖDERHAMN",
        "description_kz": "3 орынды диван, алынатын жапқыш, заманауи дизайн",
        "description_ru": "3-местный диван, съёмный чехол, современный дизайн",
        "category": "Home",
        "subcategory": "Furniture",
        "tags": "ikea sofa couch furniture living room modern",
        "price": 199990,
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
        "stock": 10,
    },
    {
        "name_kz": "Philips Hue ақылды шам жиыны",
        "name_ru": "Набор умных ламп Philips Hue",
        "description_kz": "4 ақылды шам + bridge, 16 млн түс, Alexa/Google үйімен үйлесімді",
        "description_ru": "4 умные лампы + bridge, 16 млн цветов, Alexa/Google Home",
        "category": "Home",
        "subcategory": "Smart Home",
        "tags": "philips hue smart light bulb rgb wifi alexa google home",
        "price": 49990,
        "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400",
        "stock": 40,
    },
    {
        "name_kz": "Instant Pot Duo 7-in-1 мультиварка",
        "name_ru": "Мультиварка Instant Pot Duo 7-in-1",
        "description_kz": "Қысымды плита, баяу пісіру, рис, буда, тостерге арналған 7 функция",
        "description_ru": "7 функций: скороварка, мультиварка, рис, пар, соте и др.",
        "category": "Home",
        "subcategory": "Kitchen",
        "tags": "instant pot multicooker pressure cooker 7in1 kitchen",
        "price": 44990,
        "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        "stock": 35,
    },
    {
        "name_kz": "Bosch TDA5070GB үтігі",
        "name_ru": "Утюг Bosch TDA5070GB",
        "description_kz": "Бу жүйесі, антикальция жүйесі, жылдам қызу, 2700 Вт",
        "description_ru": "Паровая система, антикальциевая защита, быстрый нагрев, 2700 Вт",
        "category": "Home",
        "subcategory": "Appliances",
        "tags": "bosch iron steam clothes laundry home",
        "price": 29990,
        "image_url": "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=400",
        "stock": 45,
    },
    {
        "name_kz": "Weber Spirit II E-310 мангалы",
        "name_ru": "Газовый гриль Weber Spirit II E-310",
        "description_kz": "3 жанарғы, GS4 пісіру жүйесі, iGrill термометрмен үйлесімді",
        "description_ru": "3 горелки, система приготовления GS4, совместим с термометром iGrill",
        "category": "Home",
        "subcategory": "Garden",
        "tags": "weber grill bbq gas outdoor cooking garden patio",
        "price": 199990,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "stock": 8,
    },
    {
        "name_kz": "Xiaomi Smart Air Purifier 4 Pro ауа тазартқышы",
        "name_ru": "Очиститель воздуха Xiaomi Smart Air Purifier 4 Pro",
        "description_kz": "HEPA сүзгі, PM2.5 датчик, 600 кв.м³/сағат, Mi Home",
        "description_ru": "Фильтр HEPA, датчик PM2.5, производительность 600 м³/ч, Mi Home",
        "category": "Home",
        "subcategory": "Smart Home",
        "tags": "xiaomi air purifier hepa smart home pm25 filter wifi",
        "price": 69990,
        "discount_price": 59990,
        "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
        "stock": 22,
    },

    # ─── Sports (10) ──────────────────────────────────────────────────────────
    {
        "name_kz": "Lululemon Align йога жиыны",
        "name_ru": "Коврик для йоги Lululemon Align",
        "description_kz": "5 мм қалыңдық, натуральный каучук, тайып кетпейтін бет",
        "description_ru": "Толщина 5 мм, натуральный каучук, нескользящая поверхность",
        "category": "Sports",
        "subcategory": "Yoga",
        "tags": "yoga mat lululemon fitness exercise pilates meditation",
        "price": 24990,
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        "stock": 60,
    },
    {
        "name_kz": "Bowflex SelectTech 552 гантелі",
        "name_ru": "Гантели Bowflex SelectTech 552",
        "description_kz": "2.3-24 кг, 15 ауыр салмақ, ауыспалы диск жүйесі",
        "description_ru": "2.3-24 кг, 15 весов, система сменных дисков",
        "category": "Sports",
        "subcategory": "Weights",
        "tags": "bowflex dumbbell adjustable weights gym fitness strength training",
        "price": 149990,
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
        "stock": 20,
    },
    {
        "name_kz": "Trek FX 2 Disc велосипеді",
        "name_ru": "Велосипед Trek FX 2 Disc",
        "description_kz": "Гибридты велосипед, дискілі тежегіш, алюминий рамасы, 24 жылдамдық",
        "description_ru": "Гибридный велосипед, дисковые тормоза, алюминиевая рама, 24 скорости",
        "category": "Sports",
        "subcategory": "Cycling",
        "tags": "trek bicycle hybrid disc brake cycling fitness outdoor",
        "price": 299990,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "stock": 10,
    },
    {
        "name_kz": "Wilson Pro Staff теннис ракеткасы",
        "name_ru": "Теннисная ракетка Wilson Pro Staff",
        "description_kz": "Carbon fibre рама, 97 кв.см, Roger Federer моделі",
        "description_ru": "Рама из углеродного волокна, 97 кв.см, модель Роджера Федерера",
        "category": "Sports",
        "subcategory": "Tennis",
        "tags": "wilson tennis racket carbon fiber federer pro",
        "price": 89990,
        "image_url": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
        "stock": 25,
    },
    {
        "name_kz": "Speedo Biofuse 2.0 жүзу көзілдірігі",
        "name_ru": "Очки для плавания Speedo Biofuse 2.0",
        "description_kz": "Биогибкий силикон, туман болдырмайтын линза, UV қорғаныс",
        "description_ru": "Биогибкий силикон, линзы с антизапотеванием, защита UV",
        "category": "Sports",
        "subcategory": "Swimming",
        "tags": "speedo swimming goggles pool uv anti fog biofuse",
        "price": 8990,
        "image_url": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400",
        "stock": 80,
    },
    {
        "name_kz": "Garmin Forerunner 255 жүгіру сағаты",
        "name_ru": "Беговые часы Garmin Forerunner 255",
        "description_kz": "GPS, жүрек соғу жиілігі, жаттығу жоспары, 14 күн батарея",
        "description_ru": "GPS, пульсометр, план тренировок, аккумулятор 14 дней",
        "category": "Sports",
        "subcategory": "Wearables",
        "tags": "garmin forerunner running gps heart rate fitness sports watch",
        "price": 199990,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        "stock": 18,
    },
    {
        "name_kz": "NordicTrack EXP 7i жүгіру жолағы",
        "name_ru": "Беговая дорожка NordicTrack EXP 7i",
        "description_kz": "10\" сенсорлы экран, iFit мазмұны, 14 км/с жылдамдық",
        "description_ru": "Сенсорный экран 10\", контент iFit, скорость до 14 км/ч",
        "category": "Sports",
        "subcategory": "Cardio",
        "tags": "nordictrack treadmill running indoor fitness cardio ifit",
        "price": 499990,
        "image_url": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400",
        "stock": 7,
    },
    {
        "name_kz": "Decathlon Kipsta футбол допы",
        "name_ru": "Футбольный мяч Decathlon Kipsta",
        "description_kz": "FIFA Basic сертификаты, PU қабық, 5 өлшем",
        "description_ru": "Сертификат FIFA Basic, покрытие из ПУ, размер 5",
        "category": "Sports",
        "subcategory": "Ball Sports",
        "tags": "decathlon football soccer ball fifa outdoor sport",
        "price": 9990,
        "image_url": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
        "stock": 100,
    },
    {
        "name_kz": "TRX HOME2 System кедергілі жаттығу",
        "name_ru": "TRX HOME2 System тренажёр",
        "description_kz": "Суспензионды жаттығу, денені толық дамытатын кешенді жаттығу",
        "description_ru": "Подвесные тренировки, комплексная проработка всего тела",
        "category": "Sports",
        "subcategory": "Strength",
        "tags": "trx suspension trainer home gym bodyweight strength fitness",
        "price": 49990,
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        "stock": 30,
    },
    {
        "name_kz": "Head Radical Pro сквош ракеткасы",
        "name_ru": "Ракетка для сквоша Head Radical Pro",
        "description_kz": "Graphene 360+ технологиясы, 135 г салмақ, жоғары маневрлілік",
        "description_ru": "Технология Graphene 360+, вес 135 г, высокая манёвренность",
        "category": "Sports",
        "subcategory": "Racket Sports",
        "tags": "head squash racket graphene sport racquet",
        "price": 39990,
        "image_url": "https://images.unsplash.com/photo-1553709256-3b7649eb2f64?w=400",
        "stock": 20,
    },
]

# ── User data ─────────────────────────────────────────────────────────────────

USERS = [
    {"name": "Айдар Бекұлы",      "email": "aidar@example.com"},
    {"name": "Зарина Нұрова",     "email": "zarina@example.com"},
    {"name": "Тимур Сейтқали",    "email": "timur@example.com"},
    {"name": "Дана Ахметова",     "email": "dana@example.com"},
    {"name": "Нұрлан Ержанов",    "email": "nurlan@example.com"},
    {"name": "Айгүл Мусаева",     "email": "aigul@example.com"},
    {"name": "Серік Омаров",      "email": "serik@example.com"},
    {"name": "Гүлнар Тоқтарова",  "email": "gulnar@example.com"},
    {"name": "Бауыржан Қасымов",  "email": "bauyr@example.com"},
    {"name": "Медина Жакупова",   "email": "medina@example.com"},
    {"name": "Асқар Имамов",      "email": "askar@example.com"},
    {"name": "Сәуле Бердиева",    "email": "saule@example.com"},
    {"name": "Ержан Сатыбалды",   "email": "erzhan@example.com"},
    {"name": "Камила Аширбекова", "email": "kamila@example.com"},
    {"name": "Дамир Нурмаханов",  "email": "damir@example.com"},
    {"name": "Арайлым Бейсова",   "email": "arailym@example.com"},
    {"name": "Аман Тілеубаев",    "email": "aman@example.com"},
    {"name": "Самал Молдабаева",  "email": "samal@example.com"},
    {"name": "Ринат Зиябеков",    "email": "rinat@example.com"},
    {"name": "Диас Сулейменов",   "email": "dias@example.com"},
]

REVIEW_TEXTS = [
    "Өте жақсы тауар, ұсынамын!",
    "Сапалы өнім, жеткізу жылдам болды.",
    "Суреттегідей, ризамын.",
    "Баға мен сапа арақатынасы жақсы.",
    "Отличный товар, рекомендую всем!",
    "Качество на высоте, быстрая доставка.",
    "Соответствует описанию, доволен покупкой.",
    "Хорошее соотношение цены и качества.",
    "Очень доволен покупкой, спасибо!",
    "Пришло быстро, упаковка целая.",
    "Тауар күтілгендей, рақмет!",
    "Жақсы сапа, тез жеткізді.",
    "Достаточно хорошее качество.",
    "Рекомендую, всё как на картинке.",
    "Ұнады, бағасы да қолайлы.",
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(models.Product).count() > 0:
            print("Database already seeded. Skipping.")
            # Still train ML model if needed
            from ml.trainer import load_or_train
            load_or_train(db)
            return

        print("Seeding database...")

        # ── Users ──────────────────────────────────────────────────────────
        user_objs = []
        for u in USERS:
            user = models.User(
                name=u["name"],
                email=u["email"],
                password_hash=get_password_hash("password123"),
            )
            db.add(user)
            user_objs.append(user)

        # Admin user
        admin = models.User(
            name="Админ",
            email="admin@shopai.kz",
            password_hash=get_password_hash("admin123"),
            is_admin=True,
        )
        db.add(admin)
        db.flush()
        print(f"Created {len(user_objs) + 1} users")

        # ── Products ───────────────────────────────────────────────────────
        product_objs = []
        for p in PRODUCTS:
            combined = (
                f"{p['name_ru']} {p['name_kz']} {p['category']} "
                f"{p.get('subcategory', '')} {p['description_ru']} {p['tags']}"
            )
            product = models.Product(
                name_kz=p["name_kz"],
                name_ru=p["name_ru"],
                description_kz=p["description_kz"],
                description_ru=p["description_ru"],
                category=p["category"],
                subcategory=p.get("subcategory"),
                tags=p.get("tags"),
                price=p["price"],
                discount_price=p.get("discount_price"),
                image_url=p.get("image_url"),
                stock=p.get("stock", 50),
                combined_text=combined,
            )
            db.add(product)
            product_objs.append(product)

        db.flush()
        print(f"Created {len(product_objs)} products")

        # ── Orders (200) ───────────────────────────────────────────────────
        statuses = ["delivered", "delivered", "delivered", "shipped", "processing"]
        order_count = 0

        for _ in range(200):
            user = random.choice(user_objs)
            num_items = random.randint(1, 4)
            chosen_products = random.sample(product_objs, min(num_items, len(product_objs)))

            days_ago = random.randint(1, 180)
            order_date = datetime.utcnow() - timedelta(days=days_ago)

            total = 0.0
            order = models.Order(
                user_id=user.id,
                total_amount=0,
                status=random.choice(statuses),
                delivery_address=f"Алматы, ул. Абая {random.randint(1, 200)}, кв. {random.randint(1, 100)}",
                created_at=order_date,
            )
            db.add(order)
            db.flush()

            for product in chosen_products:
                qty = random.randint(1, 3)
                price = product.discount_price or product.price
                total += price * qty
                item = models.OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=qty,
                    price=price,
                )
                db.add(item)

            order.total_amount = round(total, 2)
            order_count += 1

        db.flush()
        print(f"Created {order_count} orders")

        # ── Reviews (150) ─────────────────────────────────────────────────
        reviewed_pairs = set()
        review_count = 0

        for _ in range(150):
            user = random.choice(user_objs)
            product = random.choice(product_objs)
            key = (user.id, product.id)
            if key in reviewed_pairs:
                continue
            reviewed_pairs.add(key)

            rating = random.choices([5, 4, 4, 3, 2, 1], weights=[40, 30, 15, 8, 4, 3])[0]
            review = models.Review(
                user_id=user.id,
                product_id=product.id,
                rating=rating,
                text=random.choice(REVIEW_TEXTS),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 160)),
            )
            db.add(review)
            review_count += 1

        db.flush()
        print(f"Created {review_count} reviews")

        # ── Update product avg ratings ─────────────────────────────────────
        for product in product_objs:
            reviews = db.query(models.Review).filter(
                models.Review.product_id == product.id
            ).all()
            if reviews:
                product.avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)
                product.review_count = len(reviews)

        db.commit()
        print("Database seeded successfully!")

        # ── Train ML model ─────────────────────────────────────────────────
        print("Training ML recommendation model on seed data...")
        train_model(db)
        print("Done!")

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
