/*
  # Add product fields to dispatches table

  1. Changes
    - Add product_type column to dispatches table
    - Add gauge_difference column to dispatches table  
    - Add loading_charge column to dispatches table
    - Add tax_rate column to dispatches table

  2. Notes
    - product_type will store the selected product type (e.g., "40x3", "30x3", etc.)
    - gauge_difference will store the numeric gauge difference value
    - loading_charge will store the loading charge amount in rupees
    - tax_rate will store the selected tax rate (7, 12, or 18)
*/

-- Add new columns to dispatches table
ALTER TABLE dispatches
ADD COLUMN IF NOT EXISTS product_type text,
ADD COLUMN IF NOT EXISTS gauge_difference integer,
ADD COLUMN IF NOT EXISTS loading_charge decimal(10,2),
ADD COLUMN IF NOT EXISTS tax_rate decimal(4,2);