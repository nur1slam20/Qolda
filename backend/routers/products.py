from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

from database import get_db
from models import Product, ProductView, User
from schemas import ProductOut, ProductList
from auth import get_current_user

router = APIRouter()

CATEGORIES = ["Electronics", "Clothing", "Books", "Home", "Sports"]


@router.get("", response_model=ProductList)
def list_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort: Optional[str] = "newest",  # newest | price_asc | price_desc | rating | popular
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if min_rating is not None:
        query = query.filter(Product.avg_rating >= min_rating)

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.avg_rating.desc())
    elif sort == "popular":
        query = query.order_by(Product.review_count.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    total = query.count()
    pages = (total + limit - 1) // limit
    items = query.offset((page - 1) * limit).limit(limit).all()

    return ProductList(
        items=[ProductOut.model_validate(p) for p in items],
        total=total,
        page=page,
        pages=pages,
    )


@router.get("/search", response_model=ProductList)
def search_products(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    like = f"%{q}%"
    query = db.query(Product).filter(
        or_(
            Product.name_ru.ilike(like),
            Product.name_kz.ilike(like),
            Product.description_ru.ilike(like),
            Product.category.ilike(like),
            Product.tags.ilike(like),
        )
    )
    total = query.count()
    pages = (total + limit - 1) // limit
    items = query.offset((page - 1) * limit).limit(limit).all()
    return ProductList(
        items=[ProductOut.model_validate(p) for p in items],
        total=total,
        page=page,
        pages=pages,
    )


@router.get("/categories")
def get_categories():
    return CATEGORIES


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Log view for implicit feedback
    if current_user:
        view = ProductView(user_id=current_user.id, product_id=product_id)
        db.add(view)
        db.commit()

    return ProductOut.model_validate(product)
