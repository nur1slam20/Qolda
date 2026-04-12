from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models import Product, Order, OrderItem, RecommendationLog, User
from schemas import RecommendationOut, ProductOut, ClickLog
from auth import get_current_user
from ml.trainer import get_model

router = APIRouter()

REASON_POPULAR = "Осы санатты жиі алады / Часто покупают в этой категории"


def _get_purchased_ids(user_id: int, db: Session) -> List[int]:
    rows = (
        db.query(OrderItem.product_id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.user_id == user_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]


def _popular_products(db: Session, limit: int, exclude_ids: List[int] = None) -> List[dict]:
    exclude = set(exclude_ids or [])
    top = (
        db.query(Product, func.count(OrderItem.id).label("cnt"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.count(OrderItem.id).desc())
        .all()
    )
    result = []
    for product, cnt in top:
        if product.id not in exclude:
            result.append({
                "product": ProductOut.model_validate(product),
                "score": float(cnt),
                "method": "popular",
                "reason_tag": REASON_POPULAR,
            })
        if len(result) >= limit:
            break
    # Fallback: fill from all products if not enough orders
    if len(result) < limit:
        all_prods = (
            db.query(Product)
            .filter(Product.id.notin_(exclude | {r["product"].id for r in result}))
            .order_by(Product.avg_rating.desc())
            .limit(limit - len(result))
            .all()
        )
        for p in all_prods:
            result.append({
                "product": ProductOut.model_validate(p),
                "score": p.avg_rating,
                "method": "popular",
                "reason_tag": REASON_POPULAR,
            })
    return result[:limit]


@router.get("/popular")
def popular_recommendations(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return _popular_products(db, limit)


@router.get("/{user_id}", response_model=List[RecommendationOut])
def user_recommendations(
    user_id: int,
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db),
):
    purchased_ids = _get_purchased_ids(user_id, db)
    model = get_model()

    recs = []
    if model and model.is_trained:
        raw = model.recommend(user_id, purchased_ids, top_n=limit)
        for item in raw:
            product = db.query(Product).filter(Product.id == item["product_id"]).first()
            if product:
                recs.append(RecommendationOut(
                    product=ProductOut.model_validate(product),
                    score=item["score"],
                    method=item["method"],
                    reason_tag=item["reason_tag"],
                ))
                # Log recommendation shown
                log = RecommendationLog(
                    user_id=user_id,
                    product_id=item["product_id"],
                    score=item["score"],
                    method=item["method"],
                )
                db.add(log)
        db.commit()

    # Fill with popular if needed
    if len(recs) < limit:
        shown_ids = purchased_ids + [r.product.id for r in recs]
        popular = _popular_products(db, limit - len(recs), exclude_ids=shown_ids)
        for p in popular:
            recs.append(RecommendationOut(**p))

    return recs[:limit]


@router.post("/click")
def log_click(data: ClickLog, db: Session = Depends(get_db)):
    log = (
        db.query(RecommendationLog)
        .filter(
            RecommendationLog.user_id == data.user_id,
            RecommendationLog.product_id == data.product_id,
        )
        .order_by(RecommendationLog.shown_at.desc())
        .first()
    )
    if log:
        log.clicked = True
        db.commit()
    return {"ok": True}
