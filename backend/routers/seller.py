from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Product, Order, OrderItem, User
from schemas import SellerStats
from auth import require_seller

router = APIRouter()


@router.get("/stats", response_model=SellerStats)
def get_seller_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    seller_product_ids = [
        p.id for p in db.query(Product).filter(Product.seller_id == current_user.id).all()
    ]
    total_products = len(seller_product_ids)

    if not seller_product_ids:
        return SellerStats(total_products=0, total_orders=0, total_revenue=0.0)

    total_orders = (
        db.query(func.count(OrderItem.order_id.distinct()))
        .filter(OrderItem.product_id.in_(seller_product_ids))
        .scalar()
        or 0
    )

    total_revenue = (
        db.query(func.sum(OrderItem.price * OrderItem.quantity))
        .filter(OrderItem.product_id.in_(seller_product_ids))
        .scalar()
        or 0.0
    )

    return SellerStats(
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=round(float(total_revenue), 2),
    )
