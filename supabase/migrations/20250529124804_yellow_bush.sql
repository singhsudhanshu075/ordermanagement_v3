/*
  # Add payments functionality
  
  1. Changes:
    - Add payment_status to orders table
    - Create payments table
    - Add triggers to automatically update payment status
*/

-- Add payment_status to orders
ALTER TABLE orders
ADD COLUMN payment_status text NOT NULL DEFAULT 'pending'
CHECK (payment_status IN ('pending', 'partial', 'completed'));

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_date date NOT NULL,
  payment_mode text NOT NULL,
  reference_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update payment status
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_amount decimal(10,2);
  paid_amount decimal(10,2);
  new_status text;
BEGIN
  -- Calculate total order amount
  SELECT SUM((quantity + commission) * price)
  INTO total_amount
  FROM order_items
  WHERE order_id = NEW.order_id;

  -- Calculate total paid amount
  SELECT COALESCE(SUM(amount), 0)
  INTO paid_amount
  FROM payments
  WHERE order_id = NEW.order_id;

  -- Determine new status
  IF paid_amount >= total_amount THEN
    new_status := 'completed';
  ELSIF paid_amount > 0 THEN
    new_status := 'partial';
  ELSE
    new_status := 'pending';
  END IF;

  -- Update order status
  UPDATE orders
  SET payment_status = new_status
  WHERE id = NEW.order_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payment status updates
CREATE TRIGGER update_payment_status
  AFTER INSERT OR UPDATE OR DELETE
  ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_order_payment_status();