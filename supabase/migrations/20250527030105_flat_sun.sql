/*
  # Update dispatch quantity type

  1. Changes
    - Modify the `quantity` column in `dispatches` table from integer to double precision
    - This change allows storing decimal values for dispatch quantities

  2. Notes
    - Using double precision to ensure high accuracy for decimal quantities
    - Existing integer values will be automatically converted to double precision
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'dispatches' 
    AND column_name = 'quantity' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE dispatches 
    ALTER COLUMN quantity TYPE double precision;
  END IF;
END $$;