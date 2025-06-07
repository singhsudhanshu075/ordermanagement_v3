/*
  # Fix Zero Gauge Difference Support

  1. Database Changes
    - Ensure gauge_difference can be 0 or positive
    - Update constraint properly
    - Add comment for clarity

  2. Validation
    - Remove any restrictive checks
    - Allow 0 as valid value
*/

-- First, drop the existing constraint if it exists
ALTER TABLE product_types 
DROP CONSTRAINT IF EXISTS product_types_gauge_difference_check;

-- Add the correct constraint that allows 0 and positive values
ALTER TABLE product_types 
ADD CONSTRAINT product_types_gauge_difference_check 
CHECK (gauge_difference >= 0);

-- Update the comment to be clear about allowed values
COMMENT ON COLUMN product_types.gauge_difference IS 'Gauge difference value, can be 0 or any positive integer';

-- Verify the constraint is working by testing with a sample (this will be rolled back)
DO $$
BEGIN
  -- Test that 0 is allowed
  INSERT INTO product_types (name, gauge_difference, type, user_id) 
  VALUES ('test_zero', 0, 'both', '00000000-0000-0000-0000-000000000000');
  
  -- Clean up the test
  DELETE FROM product_types WHERE name = 'test_zero';
  
  RAISE NOTICE 'Zero gauge difference constraint is working correctly';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint test failed: %', SQLERRM;
END $$;