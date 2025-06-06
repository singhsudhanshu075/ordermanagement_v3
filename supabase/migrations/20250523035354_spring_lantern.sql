/*
  # Add price and commission fields

  1. Changes
    - Add price and commission columns to order_items table
    - Add dispatch_price column to dispatches table
    - Update RLS policies
*/

-- Add price and commission columns to order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS price decimal(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS commission decimal(10,2) NOT NULL DEFAULT 0.00;

-- Add dispatch_price column to dispatches
ALTER TABLE dispatches
ADD COLUMN IF NOT EXISTS dispatch_price decimal(10,2) NOT NULL DEFAULT 0.00;

-- Update RLS policies for order_items
CREATE POLICY "Users can update their order items"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));