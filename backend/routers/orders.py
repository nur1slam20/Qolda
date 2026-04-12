from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Order, OrderItem, Product, User
from schemas import OrderCreate, OrderOut
from auth import require_user

router = APIRouter()


@router.post("", response_model=OrderOut)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    total = 0.0
    order_items = []

    for cart_item in data.items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name_ru}"
            )
        effective_price = product.discount_price or product.price
        total += effective_price * cart_item.quantity
        order_items.append((product, cart_item.quantity, effective_price))

    order = Order(
        user_id=current_user.id,
        total_amount=round(total, 2),
        status="processing",
        delivery_address=data.delivery_address,
    )
    db.add(order)
    db.flush()

    for product, qty, price in order_items:
        item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            price=price,
        )
        db.add(item)
        product.stock -= qty

    db.commit()
    db.refresh(order)
    return OrderOut.model_validate(order)


@router.get("/{user_id}", response_model=List[OrderOut])
def get_user_orders(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderOut.model_validate(o) for o in orders]
