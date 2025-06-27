import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface ProductDesign {
  id: string
  name: string
  description: string
  blueprint_id: number
  print_provider_id: number
  team_logo_image_id: string
  mockup_image_url: string | null
  base_price: number
  markup_percentage: number
  created_at: string
  created_by: string
  status: 'active' | 'archived'
  team_info: {
    name?: string
    sport?: string
    coach?: string
    [key: string]: any
  }
  product_type: string
  default_variant_id?: number | null  // Creator's selected color variant
  default_color?: string | null       // Creator's selected color name
}

export interface ProductVariant {
  id: string
  product_design_id: string
  printify_variant_id: number
  size: string
  color: string
  printify_price: number
  selling_price: number
  is_available: boolean
}

export interface CustomerOrder {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed'
  stripe_payment_intent_id: string | null
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered'
  printify_order_id: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_design_id: string
  variant_id: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface ShippingAddress {
  id: string
  order_id: string
  first_name: string
  last_name: string
  address1: string
  address2: string | null
  city: string
  state: string
  zip: string
  country: string
} 