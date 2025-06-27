-- Migration: Add color selection fields to product_designs table
-- Run this script in your Supabase SQL editor to add support for creator color selections

-- Add new columns to support creator color selections
ALTER TABLE product_designs 
ADD COLUMN default_variant_id INTEGER,
ADD COLUMN default_color VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN product_designs.default_variant_id IS 'Printify variant ID selected by creator in Slack';
COMMENT ON COLUMN product_designs.default_color IS 'Color name selected by creator in Slack (e.g., "Black", "Navy", "Black / Black patch")';

-- The existing product_variants table handles all available size/color combinations for buyers
-- while these new fields store the creator's initial color choice for mockup display