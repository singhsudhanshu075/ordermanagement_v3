/*
  # Update quantity fields to support decimals

  1. Changes
    - Modify quantity columns in orders table to use double precision
    - Modify quantity columns in dispatches table to use double precision
    - Remove default values from dispatches table for quantity and price
    
  2. Notes
    - Using double precision for better decimal handling
    - Existing integer values will be automatically converted
*/

-- Update orders table
ALTER TABLE orders 
  ALTER COLUMN total_quantity TYPE double precision,
  ALTER COLUMN remaining_quantity TYPE double precision;

-- Update dispatches table
ALTER TABLE dispatches 
  ALTER COLUMN quantity TYPE double precision,
  ALTER COLUMN quantity DROP DEFAULT,
  ALTER COLUMN dispatch_price DROP DEFAULT;

-- Update orders items table
ALTER TABLE orders_items
  ALTER COLUMN quantity TYPE double precision;