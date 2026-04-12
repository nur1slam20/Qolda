from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Review, Product, User
from schemas import ReviewCreate, ReviewOut
from auth import require_user

router = APIRouter()


@router.post("", response_model=ReviewOut)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    existing = (
        db.query(Review)
        .filter(Review.user_id == current_user.id, Review.product_id == data.product_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")

    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review = Review(
        user_id=current_user.id,
        product_id=data.product_id,
        rating=data.rating,
        text=data.text,
    )
    db.add(review)
    db.flush()

    # Update product average rating
    reviews = db.query(Review).filter(Review.product_id == data.product_id).all()
    product.avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)
    product.review_count = len(reviews)

    db.commit()
    db.refresh(review)

    out = ReviewOut.model_validate(review)
    out.user_name = current_user.name
    return out


@router.get("/{product_id}", response_model=List[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    result = []
    for r in reviews:
        out = ReviewOut.model_validate(r)
        if r.user:
            out.user_name = r.user.name
        result.append(out)
    return result
