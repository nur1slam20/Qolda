from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_seller: bool = False


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    is_seller: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Products ──────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name_ru: str
    name_kz: str
    description_ru: Optional[str] = None
    description_kz: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    image_url: Optional[str] = None
    stock: int = 100


class ProductOut(BaseModel):
    id: int
    name_kz: str
    name_ru: str
    description_kz: Optional[str] = None
    description_ru: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    tags: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    image_url: Optional[str] = None
    stock: int
    avg_rating: float
    review_count: int
    seller_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductList(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    pages: int


# ── Reviews ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    text: Optional[str] = None


class ReviewOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    text: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Orders ────────────────────────────────────────────────────────────────────

class CartItem(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: List[CartItem]
    delivery_address: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductOut] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    delivery_address: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


class SellerOrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    delivery_address: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    buyer_name: str
    buyer_email: str
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


# ── Seller ────────────────────────────────────────────────────────────────────

class OrderStatusUpdate(BaseModel):
    status: str


class PlagiarismMatch(BaseModel):
    product_id: int
    name_ru: str
    category: str
    similarity: float


class PlagiarismResult(BaseModel):
    product_id: int
    status: str  # verified | suspicious | high_risk
    max_similarity: float
    matches: List[PlagiarismMatch]


class SellerStats(BaseModel):
    total_products: int
    total_orders: int
    total_revenue: float


# ── Recommendations ───────────────────────────────────────────────────────────

class RecommendationOut(BaseModel):
    product: ProductOut
    score: float
    method: str
    reason_tag: str


class ClickLog(BaseModel):
    user_id: int
    product_id: int
    method: str


# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_users: int
    total_products: int
    top_products: List[dict]
    ctr_data: List[dict]
    model_meta: dict
