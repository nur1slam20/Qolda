import os
from pathlib import Path
from dotenv import load_dotenv

# Загружаем .env самым первым делом, до всех импортов
load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=True)

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import httpx

from database import engine, SessionLocal, Base, migrate_db
import models  # noqa: F401 — registers all tables
from routers import auth, products, recommendations, orders, reviews, admin, seller, ai, delivery, messages

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables then run safe column migrations
    Base.metadata.create_all(bind=engine)
    migrate_db()
    logger.info("Database tables created/verified")

    db = SessionLocal()
    try:
        # Auto-seed if database is empty (first deployment)
        from models import Product as ProductModel
        if db.query(ProductModel).count() == 0:
            logger.info("Empty database — running seed data...")
            try:
                from seed.seed_data import run as seed_run
                seed_run()
                logger.info("Seed data inserted successfully")
            except Exception as e:
                logger.warning(f"Auto-seed failed: {e}")

        # Load or train ML model
        try:
            from ml.trainer import load_or_train
            load_or_train(db)
        except Exception as e:
            logger.warning(f"ML model init failed (will retry on first request): {e}")
    finally:
        db.close()

    yield


# ── CORS ──────────────────────────────────────────────────────────────────────
_cors_env = os.getenv("CORS_ORIGINS", "*")
if _cors_env.strip() == "*":
    _origins = ["*"]
    _credentials = False          # browser blocks credentials with wildcard origin
else:
    _origins = [o.strip() for o in _cors_env.split(",")]
    _credentials = True

app = FastAPI(
    title="QOLDA — E-Commerce API",
    description="Diploma thesis: e-commerce platform with seller dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(seller.router, prefix="/api/seller", tags=["seller"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(delivery.router, prefix="/api/delivery-services", tags=["delivery"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])


@app.get("/")
def root():
    return {"message": "QOLDA API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/address/suggest")
async def address_suggest(q: str = Query(..., min_length=2)):
    key = os.getenv("TWOGIS_API_KEY", "")
    url = (
        f"https://catalog.api.2gis.com/3.0/items/geocode"
        f"?q={q}&key={key}&locale=ru_KZ&fields=items.full_name&limit=10"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=5)
        data = resp.json()
    items = data.get("result", {}).get("items", [])
    results = [item.get("full_name") or item.get("name", "") for item in items if item.get("full_name") or item.get("name")]

    # Фильтруем: оставляем только те адреса, где есть хотя бы одно слово из запроса
    words = [w for w in q.lower().split() if len(w) > 2]
    if words:
        filtered = [r for r in results if any(w in r.lower() for w in words)]
        return filtered[:6] if filtered else results[:6]

    return results[:6]
