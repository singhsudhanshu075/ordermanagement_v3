/*
  # Add product fields to dispatches table

  1. Changes
    - Add product_type column to dispatches table (text)
    - Add gauge_difference column to dispatches table (integer)
    - Add loading_charge column to dispatches table (decimal)
    - Add tax_rate column to dispatches table (decimal)

  2. Notes
    - These fields support the enhanced dispatch form functionality
    - product_type stores the selected product type (e.g., "40x3", "30x3", etc.)
    - gauge_difference stores the auto-filled gauge difference value
    - loading_charge stores the loading charge in rupees
    - tax_rate stores the tax rate percentage (7%, 12%, or 18%)
    - Uses IF NOT EXISTS to prevent errors if columns already exist
*/

-- Add product_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dispatches' AND column_name = 'product_type'
  ) THEN
    ALTER TABLE dispatches ADD COLUMN product_type text;
  END IF;
END $$;

-- Add gauge_difference column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dispatches' AND column_name = 'gauge_difference'
  ) THEN
    ALTER TABLE dispatches ADD COLUMN gauge_difference integer;
  END IF;
END $$;

-- Add loading_charge column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dispatches' AND column_name = 'loading_charge'
  ) THEN
    ALTER TABLE dispatches ADD COLUMN loading_charge decimal(10,2);
  END IF;
END $$;

-- Add tax_rate column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dispatches' AND column_name = 'tax_rate'
  ) THEN
    ALTER TABLE dispatches ADD COLUMN tax_rate decimal(4,2);
  END IF;
END $$;