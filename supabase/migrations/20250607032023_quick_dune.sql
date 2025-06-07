/*
  # Allow zero gauge difference in product types

  1. Changes
    - Remove the constraint that gauge_difference must be positive
    - Allow gauge_difference to be 0 or any non-negative integer
    - Update the check constraint to allow >= 0 instead of > 0

  2. Security
    - Maintains existing RLS policies
    - No changes to user permissions
*/

-- Allow gauge_difference to be 0 or positive
ALTER TABLE product_types 
DROP CONSTRAINT IF EXISTS product_types_gauge_difference_check;

-- Add new constraint allowing 0 and positive values
ALTER TABLE product_types 
ADD CONSTRAINT product_types_gauge_difference_check 
CHECK (gauge_difference >= 0);

-- Update the DispatchForm validation comment
COMMENT ON COLUMN product_types.gauge_difference IS 'Gauge difference value, can be 0 or any positive integer';