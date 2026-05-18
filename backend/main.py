import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import logging

from database import engine, SessionLocal, Base, migrate_db
import models  # noqa: F401 — registers all tables
from limiter import limiter
from routers import auth, products, recommendations, orders, reviews, admin, seller, ai, delivery, messages
from routers import wishlist, cart, notifications, promo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    migrate_db()
    logger.info("Database tables created/verified")

    db = SessionLocal()
    try:
<<<<<<< main
=======
        # Auto-seed if database is empty (first deployment)
>>>>>>> main
        from models import Product as ProductModel
        if db.query(ProductModel).count() == 0:
            logger.info("Empty database — running seed data...")
            try:
                from seed.seed_data import run as seed_run
                seed_run()
                logger.info("Seed data inserted successfully")
            except Exception as e:
                logger.warning(f"Auto-seed failed: {e}")

<<<<<<< main
=======
        # Load or train ML model
>>>>>>> main
        try:
            from ml.trainer import load_or_train
            load_or_train(db)
        except Exception as e:
            logger.warning(f"ML model init failed (will retry on first request): {e}")
    finally:
        db.close()

    yield


# ── CORS ──────────────────────────────────────────────────────────────────────
_cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
if _cors_env.strip() == "*":
    _origins = ["*"]
<<<<<<< main
    _credentials = False
=======
    _credentials = False          # browser blocks credentials with wildcard origin
>>>>>>> main
else:
    _origins = [o.strip() for o in _cors_env.split(",")]
    _credentials = True

app = FastAPI(
    title="QOLDA — E-Commerce API",
    description="Diploma thesis: e-commerce platform with seller dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Rate Limiting ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,            prefix="/api/auth",             tags=["auth"])
app.include_router(products.router,        prefix="/api/products",         tags=["products"])
app.include_router(recommendations.router, prefix="/api/recommendations",  tags=["recommendations"])
app.include_router(orders.router,          prefix="/api/orders",           tags=["orders"])
app.include_router(reviews.router,         prefix="/api/reviews",          tags=["reviews"])
app.include_router(admin.router,           prefix="/api/admin",            tags=["admin"])
app.include_router(seller.router,          prefix="/api/seller",           tags=["seller"])
app.include_router(ai.router,              prefix="/api/ai",               tags=["ai"])
app.include_router(delivery.router,        prefix="/api/delivery-services", tags=["delivery"])
app.include_router(messages.router,        prefix="/api/messages",         tags=["messages"])
app.include_router(wishlist.router,        prefix="/api/wishlist",         tags=["wishlist"])
app.include_router(cart.router,            prefix="/api/cart",             tags=["cart"])
app.include_router(notifications.router,   prefix="/api/notifications",    tags=["notifications"])
app.include_router(promo.router,           prefix="/api/promo",            tags=["promo"])


@app.get("/")
def root():
    return {"message": "QOLDA API is running", "docs": "/docs"}
<<<<<<< main


@app.get("/health")
def health():
    return {"status": "ok"}
=======
>>>>>>> main
