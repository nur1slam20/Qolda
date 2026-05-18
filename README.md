# QolDa — Intelligent E-Commerce with Hybrid ML Recommendations

**Дипломдық жоба / Дипломный проект**

> «Creation of an intelligent recommendation management system for an online store using machine learning methods»

---

## Architecture

```
shopAI/
├── backend/          FastAPI + SQLAlchemy + PostgreSQL + scikit-learn
│   ├── routers/      REST API endpoints
│   ├── ml/           Hybrid ML recommendation engine
│   └── seed/         Database seeder (50 products, 20 users, 200 orders)
└── frontend/         React + TypeScript + Tailwind CSS
    └── src/
        ├── pages/    8 full pages
        ├── components/
        ├── api/      Axios API layer
        └── store/    Zustand state (cart, user)
```

---

## ML Recommendation System

### Method 1 — Content-Based Filtering (TF-IDF + Cosine Similarity)

Each product has a `combined_text` field:
```
name_ru + category + subcategory + description_ru + tags
```

1. Vectorize with `TfidfVectorizer` (bigrams, 10k features)
2. Build cosine similarity matrix (products × products)
3. For a user's purchased products → find top-N most similar unowned products
4. Aggregate with **max-pooling** across all purchased items

```python
tfidf = TfidfVectorizer(ngram_range=(1,2), max_features=10_000)
matrix = tfidf.fit_transform(products['combined_text'])
cosine_sim = cosine_similarity(matrix, matrix)
```

### Method 2 — Collaborative Filtering (SVD)

Uses the **user × product rating matrix**:
- Explicit ratings from reviews (1–5 ★)
- Implicit ratings from purchases (treated as 4.0)

```python
from surprise import SVD, Dataset, Reader
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(ratings_df[['user_id', 'product_id', 'rating']], reader)
model = SVD(n_factors=50, n_epochs=20, random_state=42)
model.fit(data.build_full_trainset())
prediction = model.predict(user_id, product_id)
```

### Method 3 — Hybrid Fusion

```
final_score = 0.6 × collaborative_score + 0.4 × content_score
```

**Cold-start rule:**
- `< 3 purchases` → Content-Based only (or popular products fallback)
- `≥ 3 purchases` → Full Hybrid (both models normalized to [0,1] then fused)

**Reason tags (bilingual):**
- `"Сіздің сатып алуларыңызға ұқсас / Похоже на ваши покупки"`
- `"Сізге ұқсас клиенттер алды / Клиенты как вы тоже брали"`
- `"Осы санатты жиі алады / Часто покупают в этой категории"`

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (running on localhost:5432)

### Backend

```bash
cd backend

# Create .env from template
cp .env.example .env
# Edit DATABASE_URL, SECRET_KEY as needed

# Install dependencies
pip install -r requirements.txt

# Seed database + train ML model
python -m seed.seed_data

# Start API server
uvicorn main:app --reload --port 8000
```

The server will auto-train the ML model on first startup if no pickle exists.

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend

npm install
npm run dev
```

Opens at http://localhost:5173

---

## Demo Accounts

| Role  | Email                | Password   |
|-------|----------------------|------------|
| User  | aidar@example.com    | password123|
| Admin | admin@shopai.kz      | admin123   |

---

## API Endpoints

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | /api/auth/register                | Register new user              |
| POST   | /api/auth/login                   | Login, returns JWT             |
| GET    | /api/products                     | List with filters              |
| GET    | /api/products/search?q=           | Full-text search               |
| GET    | /api/products/{id}                | Product detail + log view      |
| GET    | /api/recommendations/{user_id}    | **Hybrid ML recommendations**  |
| GET    | /api/recommendations/popular      | Popular fallback               |
| POST   | /api/recommendations/click        | Log recommendation click (CTR) |
| POST   | /api/orders                       | Create order                   |
| GET    | /api/orders/{user_id}             | Order history                  |
| POST   | /api/reviews                      | Leave review + rating          |
| GET    | /api/reviews/{product_id}         | Product reviews                |
| GET    | /api/admin/stats                  | Dashboard stats + CTR          |
| POST   | /api/admin/retrain                | Retrain ML model               |

---

## Pages

| Route              | Page                | Description                                    |
|--------------------|---------------------|------------------------------------------------|
| `/`                | Home                | Hero, popular products, ML recommendations     |
| `/category/:name`  | Category            | Product grid with filters and sorting          |
| `/search?q=`       | Search              | Full-text search results                       |
| `/product/:id`     | Product Detail      | Images, reviews, similar products              |
| `/cart`            | Cart                | Cart management                                |
| `/checkout`        | Checkout            | Address form, order confirmation               |
| `/orders`          | Orders              | Order history with expandable items            |
| `/profile`         | Profile             | User info + full ML recommendation list        |
| `/admin`           | Admin Dashboard     | Sales metrics, charts, model controls          |

---

## Database Schema

```
User          id, name, email, password_hash, is_admin, created_at
Product       id, name_kz, name_ru, description_*, category, subcategory,
              tags, price, discount_price, image_url, stock,
              avg_rating, review_count, combined_text
Order         id, user_id, total_amount, status, delivery_address, created_at
OrderItem     id, order_id, product_id, quantity, price
Review        id, user_id, product_id, rating (1-5), text, created_at
ProductView   id, user_id, product_id, viewed_at  [implicit signal]
RecommendationLog  id, user_id, product_id, score, method, shown_at, clicked
```

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | React 18, TypeScript, Tailwind CSS, Vite                |
| State      | Zustand (cart + user), React Router v6                  |
| Backend    | Python 3, FastAPI, SQLAlchemy 2.0                       |
| Database   | PostgreSQL                                              |
| ML         | scikit-learn (TF-IDF, Cosine), scikit-surprise (SVD)    |
| Auth       | JWT (python-jose), bcrypt (passlib)                     |
| Charts     | Recharts                                                |
