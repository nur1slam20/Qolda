from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import DeliveryService, Order, OrderItem, OrderStatusHistory, Product, User
from schemas import OrderCreate, OrderOut, OrderItemOut, SellerOrderOut, OrderStatusUpdate, OrderStatusHistoryItem
from auth import require_user, require_seller

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

    delivery_cost = 0.0
    if data.delivery_service_id:
        svc = db.query(DeliveryService).filter(DeliveryService.id == data.delivery_service_id).first()
        if svc:
            delivery_cost = svc.price

    order = Order(
        user_id=current_user.id,
        total_amount=round(total + delivery_cost, 2),
        status="processing",
        delivery_address=data.delivery_address,
        customer_name=data.customer_name or current_user.name,
        customer_phone=data.customer_phone,
        delivery_service_id=data.delivery_service_id,
        delivery_cost=delivery_cost,
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

    db.add(OrderStatusHistory(order_id=order.id, status="processing"))
    db.commit()
    db.refresh(order)
    return OrderOut.model_validate(order)


@router.get("/seller", response_model=List[SellerOrderOut])
def get_seller_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    # Find all products belonging to this seller
    seller_product_ids = [
        p.id for p in db.query(Product).filter(Product.seller_id == current_user.id).all()
    ]

    if not seller_product_ids:
        return []

    # Find orders that contain at least one seller product
    order_id_rows = (
        db.query(OrderItem.order_id)
        .filter(OrderItem.product_id.in_(seller_product_ids))
        .distinct()
        .all()
    )
    order_ids = [r[0] for r in order_id_rows]

    orders = (
        db.query(Order)
        .filter(Order.id.in_(order_ids))
        .order_by(Order.created_at.desc())
        .all()
    )

    result = []
    for order in orders:
        result.append(SellerOrderOut(
            id=order.id,
            total_amount=order.total_amount,
            status=order.status,
            delivery_address=order.delivery_address,
            customer_name=order.customer_name or order.user.name,
            customer_phone=order.customer_phone,
            buyer_name=order.user.name,
            buyer_email=order.user.email,
            created_at=order.created_at,
            items=[OrderItemOut.model_validate(item) for item in order.items],
        ))

    return result


ALLOWED_STATUSES = {"processing", "pending", "shipped", "completed", "cancelled"}


@router.patch("/{order_id}/status", response_model=SellerOrderOut)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller),
):
    if data.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    seller_product_ids = {
        p.id for p in db.query(Product).filter(Product.seller_id == current_user.id).all()
    }
    order_product_ids = {item.product_id for item in order.items}
    if not seller_product_ids & order_product_ids and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")

    order.status = data.status
    db.add(OrderStatusHistory(order_id=order.id, status=data.status))
    db.commit()
    db.refresh(order)

    return SellerOrderOut(
        id=order.id,
        total_amount=order.total_amount,
        status=order.status,
        delivery_address=order.delivery_address,
        customer_name=order.customer_name or order.user.name,
        customer_phone=order.customer_phone,
        buyer_name=order.user.name,
        buyer_email=order.user.email,
        created_at=order.created_at,
        items=[OrderItemOut.model_validate(item) for item in order.items],
    )


@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if order.status in ("completed", "shipped", "cancelled"):
        raise HTTPException(status_code=400, detail="Cannot cancel order with status: " + order.status)
    order.status = "cancelled"
    db.add(OrderStatusHistory(order_id=order.id, status="cancelled"))
    db.commit()
    db.refresh(order)
    return OrderOut.model_validate(order)


@router.get("/{order_id}/history", response_model=List[OrderStatusHistoryItem])
def get_order_history(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    return (
        db.query(OrderStatusHistory)
        .filter(OrderStatusHistory.order_id == order_id)
        .order_by(OrderStatusHistory.changed_at)
        .all()
    )


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
