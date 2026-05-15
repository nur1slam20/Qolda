from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer
from typing import List, Optional
from pydantic import BaseModel

from database import get_db, SessionLocal
from models import Order, OrderItem, Product, User, RecommendationLog
from schemas import AdminStats, UserOut, ProductOut, SellerOrderOut, OrderItemOut
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


# ── User management ───────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).all()


class UserRoleUpdate(BaseModel):
    is_seller: Optional[bool] = None
    is_admin: Optional[bool] = None


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user_role(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.is_seller is not None:
        user.is_seller = data.is_seller
    if data.is_admin is not None:
        user.is_admin = data.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"status": "deleted"}


# ── Product management ────────────────────────────────────────────────────────

@router.get("/products", response_model=List[ProductOut])
def get_all_products(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Product).order_by(Product.created_at.desc()).limit(200).all()


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"status": "deleted"}


# ── Order management ──────────────────────────────────────────────────────────

class AdminOrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    buyer_name: str
    buyer_email: str
    created_at: str
    items_count: int

    model_config = {"from_attributes": False}


@router.get("/orders")
def get_all_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Order)
    if status:
        q = q.filter(Order.status == status)
    orders = q.order_by(Order.created_at.desc()).limit(200).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "total_amount": o.total_amount,
            "status": o.status,
            "customer_name": o.customer_name,
            "customer_phone": o.customer_phone,
            "delivery_address": o.delivery_address,
            "buyer_name": o.user.name,
            "buyer_email": o.user.email,
            "created_at": o.created_at.isoformat(),
            "items_count": len(o.items),
        })
    return result


@router.patch("/orders/{order_id}/status")
def admin_update_order_status(
    order_id: int,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data["status"]
    db.commit()
    return {"status": "updated"}
