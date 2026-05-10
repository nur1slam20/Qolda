export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  is_seller: boolean
  created_at: string
}

export interface Product {
  id: number
  name_kz: string
  name_ru: string
  description_kz?: string
  description_ru?: string
  category: string
  subcategory?: string
  tags?: string
  price: number
  discount_price?: number
  image_url?: string
  stock: number
  avg_rating: number
  review_count: number
  seller_id?: number
  created_at: string
}

export interface ProductCreate {
  name_ru: string
  name_kz: string
  description_ru?: string
  description_kz?: string
  category: string
  subcategory?: string
  price: number
  discount_price?: number
  image_url?: string
  stock: number
}

export interface ProductList {
  items: Product[]
  total: number
  page: number
  pages: number
}

export interface Review {
  id: number
  user_id: number
  product_id: number
  rating: number
  text?: string
  created_at: string
  user_name?: string
}

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}

export interface Order {
  id: number
  user_id: number
  total_amount: number
  status: string
  delivery_address?: string
  customer_name?: string
  customer_phone?: string
  created_at: string
  items: OrderItem[]
}

export interface SellerOrder {
  id: number
  total_amount: number
  status: string
  delivery_address?: string
  customer_name?: string
  customer_phone?: string
  buyer_name: string
  buyer_email: string
  created_at: string
  items: OrderItem[]
}

export interface SellerStats {
  total_products: number
  total_orders: number
  total_revenue: number
}

export interface Recommendation {
  product: Product
  score: number
  method: string
  reason_tag: string
}

export interface PlagiarismMatch {
  product_id: number
  name_ru: string
  category: string
  similarity: number
}

export interface PlagiarismResult {
  product_id: number
  status: 'verified' | 'suspicious' | 'high_risk'
  max_similarity: number
  matches: PlagiarismMatch[]
}

export interface AdminStats {
  total_orders: number
  total_revenue: number
  total_users: number
  total_products: number
  top_products: { name: string; quantity: number }[]
  ctr_data: { date: string; shown: number; clicked: number; ctr: number }[]
  model_meta: Record<string, unknown>
}
