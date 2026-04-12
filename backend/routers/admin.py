from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer

from database import get_db, SessionLocal
from models import Order, OrderItem, Product, User, RecommendationLog
from schemas import AdminStats
from auth import require_admin
from ml.trainer import train_model, get_model_meta

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0
    total_users = db.query(User).count()
    total_products = db.query(Product).count()

    # Top 10 products by sales count
    top_raw = (
        db.query(Product.name_ru, func.sum(OrderItem.quantity).label("qty"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(10)
        .all()
    )
    top_products = [{"name": r[0], "quantity": int(r[1])} for r in top_raw]

    # CTR by day (last 30 days)
    ctr_raw = (
        db.query(
            func.date(RecommendationLog.shown_at).label("date"),
            func.count(RecommendationLog.id).label("shown"),
            func.sum(cast(RecommendationLog.clicked, Integer)).label("clicked"),
        )
        .group_by(func.date(RecommendationLog.shown_at))
        .order_by(func.date(RecommendationLog.shown_at))
        .limit(30)
        .all()
    )
    ctr_data = []
    for row in ctr_raw:
        shown = int(row[1])
        clicked = int(row[2] or 0)
        ctr_data.append({
            "date": str(row[0]),
            "shown": shown,
            "clicked": clicked,
            "ctr": round(clicked / shown * 100, 1) if shown else 0,
        })

    model_meta = get_model_meta() or {}
    return AdminStats(
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        total_users=total_users,
        total_products=total_products,
        top_products=top_products,
        ctr_data=ctr_data,
        model_meta=model_meta,
    )


@router.post("/retrain")
def retrain_model(
    _: User = Depends(require_admin),
):
    db = SessionLocal()
    try:
        meta = train_model(db)
        return {"status": "ok", "meta": meta}
    finally:
        db.close()
