from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean,
    ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    is_seller = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    views = relationship("ProductView", back_populates="user")
    rec_logs = relationship("RecommendationLog", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name_kz = Column(String(500), nullable=False)
    name_ru = Column(String(500), nullable=False)
    description_kz = Column(Text)
    description_ru = Column(Text)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100))
    tags = Column(String(1000))
    price = Column(Float, nullable=False)
    discount_price = Column(Float)
    image_url = Column(String(1000))
    stock = Column(Integer, default=100)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    combined_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    views = relationship("ProductView", back_populates="product")
    rec_logs = relationship("RecommendationLog", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending")
    delivery_address = Column(Text)
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class ProductView(Base):
    __tablename__ = "product_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="views")
    product = relationship("Product", back_populates="views")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_user_product_review"),)

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")


class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    score = Column(Float)
    method = Column(String(50))
    shown_at = Column(DateTime, default=datetime.utcnow)
    clicked = Column(Boolean, default=False)

    user = relationship("User", back_populates="rec_logs")
    product = relationship("Product", back_populates="rec_logs")
