/*
  # Add product fields to dispatches table

  1. Changes
    - Add product_type column to dispatches table
    - Add gauge_difference column to dispatches table  
    - Add loading_charge column to dispatches table
    - Add tax_rate column to dispatches table

  2. Notes
    - These fields support the enhanced dispatch form functionality
    - product_type stores the selected product type (e.g., "40x3", "30x3", etc.)
    - gauge_difference stores the auto-filled gauge difference value
    - loading_charge stores the loading charge in rupees
    - tax_rate stores the tax rate percentage (7%, 12%, or 18%)
*/

-- Add new columns to dispatches table
ALTER TABLE dispatches
ADD COLUMN IF NOT EXISTS product_type text,
ADD COLUMN IF NOT EXISTS gauge_difference integer,
ADD COLUMN IF NOT EXISTS loading_charge decimal(10,2),
ADD COLUMN IF NOT EXISTS tax_rate decimal(4,2);