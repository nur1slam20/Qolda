from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from models import Product, Order, OrderItem, User
from schemas import SellerStats, RevenuePoint
from auth import require_seller

router = APIRouter()

DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']


@router.get("/stats", response_model=SellerStats)
def get_seller_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    seller_products = db.query(Product).filter(Product.seller_id == current_user.id).all()
    seller_product_ids = [p.id for p in seller_products]
    total_products = len(seller_product_ids)

    empty = SellerStats(
        total_products=total_products,
        total_orders=0,
        total_revenue=0.0,
        month_revenue=0.0,
        prev_month_revenue=0.0,
        cancelled_orders=0,
        returned_orders=0,
        low_stock_count=sum(1 for p in seller_products if 0 < p.stock <= 10),
        revenue_by_day=[RevenuePoint(name=n, revenue=0) for n in DAY_NAMES],
        revenue_by_week=[RevenuePoint(name=f'Нед {i+1}', revenue=0) for i in range(4)],
    )

    if not seller_product_ids:
        return empty

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    prev_month_end = month_start - timedelta(seconds=1)
    prev_month_start = prev_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # All orders containing seller products
    order_id_rows = (
        db.query(OrderItem.order_id)
        .filter(OrderItem.product_id.in_(seller_product_ids))
        .distinct()
        .all()
    )
    all_order_ids = [r[0] for r in order_id_rows]
    all_orders = db.query(Order).filter(Order.id.in_(all_order_ids)).all() if all_order_ids else []

    total_orders = len(all_orders)
    total_revenue = sum(o.total_amount for o in all_orders)
    month_revenue = sum(o.total_amount for o in all_orders if o.created_at >= month_start)
    prev_month_revenue = sum(
        o.total_amount for o in all_orders
        if prev_month_start <= o.created_at <= prev_month_end
    )
    cancelled_orders = sum(1 for o in all_orders if o.status == 'cancelled')
    returned_orders  = sum(1 for o in all_orders if o.status == 'returned')

    low_stock_count = sum(1 for p in seller_products if 0 < p.stock <= 10)

    # Revenue by day — last 7 days
    revenue_by_day = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        rev = sum(o.total_amount for o in all_orders if day_start <= o.created_at <= day_end)
        revenue_by_day.append(RevenuePoint(name=DAY_NAMES[day.weekday()], revenue=round(rev, 2)))

    # Revenue by week — last 4 weeks
    revenue_by_week = []
    for i in range(3, -1, -1):
        week_end   = now - timedelta(weeks=i)
        week_start = week_end - timedelta(weeks=1)
        rev = sum(o.total_amount for o in all_orders if week_start <= o.created_at <= week_end)
        revenue_by_week.append(RevenuePoint(name=f'Нед {4 - i}', revenue=round(rev, 2)))

    return SellerStats(
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        month_revenue=round(month_revenue, 2),
        prev_month_revenue=round(prev_month_revenue, 2),
        cancelled_orders=cancelled_orders,
        returned_orders=returned_orders,
        low_stock_count=low_stock_count,
        revenue_by_day=revenue_by_day,
        revenue_by_week=revenue_by_week,
    )
