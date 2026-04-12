from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from database import engine, SessionLocal, Base
import models  # noqa: F401 — registers all tables
from routers import auth, products, recommendations, orders, reviews, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

    # Load or train ML model
    db = SessionLocal()
    try:
        from ml.trainer import load_or_train
        load_or_train(db)
    except Exception as e:
        logger.warning(f"ML model init failed (will retry on first request): {e}")
    finally:
        db.close()

    yield


app = FastAPI(
    title="ShopAI — Intelligent E-Commerce API",
    description="Diploma thesis: hybrid ML recommendation system for online store",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/")
def root():
    return {"message": "ShopAI API is running", "docs": "/docs"}
