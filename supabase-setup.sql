-- MiM Youth Sports Storefront Database Schema
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Product Designs (created from Slack bot)
CREATE TABLE product_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    blueprint_id INTEGER NOT NULL,
    print_provider_id INTEGER NOT NULL,
    team_logo_image_id VARCHAR(255) NOT NULL,
    mockup_image_url VARCHAR(500),
    base_price DECIMAL(10,2) NOT NULL,
    markup_percentage DECIMAL(5,2) DEFAULT 50.00,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    team_info JSONB DEFAULT '{}',
    product_type VARCHAR(100) DEFAULT 'apparel'
);

-- Product Variants (sizes, colors available for each design)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_design_id UUID REFERENCES product_designs(id) ON DELETE CASCADE,
    printify_variant_id INTEGER NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    printify_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT true
);

-- Customer Orders
CREATE TABLE customer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    stripe_payment_intent_id VARCHAR(255),
    fulfillment_status VARCHAR(50) DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered')),
    printify_order_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES customer_orders(id) ON DELETE CASCADE,
    product_design_id UUID REFERENCES product_designs(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- Shipping Addresses
CREATE TABLE shipping_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES customer_orders(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    address1 VARCHAR(255),
    address2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(2) DEFAULT 'US'
);

-- Indexes for performance
CREATE INDEX idx_product_designs_status ON product_designs(status);
CREATE INDEX idx_product_designs_created_by ON product_designs(created_by);
CREATE INDEX idx_customer_orders_email ON customer_orders(email);
CREATE INDEX idx_customer_orders_payment_status ON customer_orders(payment_status);
CREATE INDEX idx_customer_orders_fulfillment_status ON customer_orders(fulfillment_status);
CREATE INDEX idx_order_items_product_design_id ON order_items(product_design_id);

-- Row Level Security (RLS) Policies
ALTER TABLE product_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Public read access for product designs and variants
CREATE POLICY "Public can read active product designs" ON product_designs
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public can read product variants" ON product_variants
    FOR SELECT USING (true);

-- Customers can only access their own orders (once we implement auth)
-- For now, allow public read/write for demo purposes
CREATE POLICY "Allow public access to orders" ON customer_orders
    FOR ALL USING (true);

CREATE POLICY "Allow public access to order items" ON order_items
    FOR ALL USING (true);

CREATE POLICY "Allow public access to shipping addresses" ON shipping_addresses
    FOR ALL USING (true);

-- Allow service role to do everything (for backend operations)
CREATE POLICY "Service role can do everything on product_designs" ON product_designs
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can do everything on product_variants" ON product_variants
    FOR ALL TO service_role USING (true);

-- Sample data (optional - remove in production)
INSERT INTO product_designs (name, description, blueprint_id, print_provider_id, team_logo_image_id, mockup_image_url, base_price, team_info, product_type) VALUES
('Eagles Soccer Team Shirt', 'Custom soccer team shirt with Eagles logo', 157, 3, 'sample_logo_123', 'https://example.com/mockup1.jpg', 20.00, '{"name": "Eagles", "sport": "Soccer", "coach": "Coach Smith"}', 'apparel'),
('Tigers Baseball Cap', 'Custom baseball cap for Tigers team', 1446, 8, 'sample_logo_456', 'https://example.com/mockup2.jpg', 25.00, '{"name": "Tigers", "sport": "Baseball", "coach": "Coach Johnson"}', 'hat');

COMMENT ON TABLE product_designs IS 'Custom product designs created through Slack bot';
COMMENT ON TABLE customer_orders IS 'Customer orders from the storefront';
COMMENT ON TABLE order_items IS 'Individual items within customer orders';
COMMENT ON TABLE shipping_addresses IS 'Shipping addresses for orders';
COMMENT ON TABLE product_variants IS 'Available size/color variants for products'; 