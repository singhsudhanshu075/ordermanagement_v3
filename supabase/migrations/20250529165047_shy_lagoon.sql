-- Add payment_status column to payments table
ALTER TABLE payments ADD COLUMN payment_status text NOT NULL DEFAULT 'partial' CHECK (payment_status IN ('pending', 'partial', 'completed'));