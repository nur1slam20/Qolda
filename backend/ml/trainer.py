"""
Model training, persistence, and hot-reload utilities.

The trained HybridRecommender is kept in memory (_model) and
optionally persisted to disk as a pickle file.
"""
import os
import pickle
import logging
from datetime import datetime
from typing import Optional

import pandas as pd
from sqlalchemy.orm import Session

from ml.recommender import HybridRecommender

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_model.pkl")
META_PATH = os.path.join(os.path.dirname(__file__), "model_meta.pkl")

_model: Optional[HybridRecommender] = None
_meta: dict = {}


def get_model() -> Optional[HybridRecommender]:
    return _model


def get_model_meta() -> dict:
    return _meta


# ── Data loading ──────────────────────────────────────────────────────────────

def _load_dataframes(db: Session):
    from models import Product, Order, OrderItem, Review

    # Products
    products = db.query(Product).all()
    products_df = pd.DataFrame([
        {
            "id": p.id,
            "combined_text": p.combined_text or (
                f"{p.name_ru} {p.category} {p.subcategory or ''} "
                f"{p.description_ru or ''} {p.tags or ''}"
            ),
            "category": p.category,
        }
        for p in products
    ])

    # Explicit ratings from reviews
    reviews = db.query(Review).all()
    ratings_rows = [
        {
            "user_id": str(r.user_id),
            "product_id": str(r.product_id),
            "rating": float(r.rating),
        }
        for r in reviews
    ]

    # Implicit ratings from purchases (rating = 4.0 if not already reviewed)
    reviewed_pairs = {(r.user_id, r.product_id) for r in reviews}
    items = db.query(OrderItem).join(OrderItem.order).all()
    for item in items:
        user_id = item.order.user_id
        if (user_id, item.product_id) not in reviewed_pairs:
            ratings_rows.append({
                "user_id": str(user_id),
                "product_id": str(item.product_id),
                "rating": 4.0,
            })

    ratings_df = (
        pd.DataFrame(ratings_rows)
        if ratings_rows
        else pd.DataFrame(columns=["user_id", "product_id", "rating"])
    )
    return products_df, ratings_df


# ── Public API ────────────────────────────────────────────────────────────────

def load_or_train(db: Session):
    """Load model from disk if available, else train fresh."""
    global _model, _meta
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                _model = pickle.load(f)
            if os.path.exists(META_PATH):
                with open(META_PATH, "rb") as f:
                    _meta = pickle.load(f)
            logger.info("ML model loaded from disk (trained at %s)", _meta.get("last_trained_at"))
            return _meta
        except Exception as e:
            logger.warning("Could not load model from disk: %s. Retraining...", e)

    return train_model(db)


def train_model(db: Session) -> dict:
    """Train a new HybridRecommender and persist it."""
    global _model, _meta
    logger.info("Training ML recommendation model...")

    products_df, ratings_df = _load_dataframes(db)
    if products_df.empty:
        logger.warning("No products found — skipping ML training.")
        return {}

    _model = HybridRecommender(collab_weight=0.6, content_weight=0.4)
    _model.fit(products_df, ratings_df)

    _meta = {
        "last_trained_at": datetime.utcnow().isoformat(),
        "num_products": len(products_df),
        "num_users": ratings_df["user_id"].nunique() if len(ratings_df) else 0,
        "num_ratings": len(ratings_df),
        "collab_available": _model.collab_model.is_fitted,
    }

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(_model, f)
    with open(META_PATH, "wb") as f:
        pickle.dump(_meta, f)

    logger.info(
        "Model trained: %d products, %d ratings, collab=%s",
        _meta["num_products"],
        _meta["num_ratings"],
        _meta["collab_available"],
    )
    return _meta
