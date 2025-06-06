/*
  # Create orders and dispatches tables

  1. New Tables
    - `orders`
      - `id` (text, primary key) - Custom order ID (e.g., S123456789)
      - `type` (text) - 'sale' or 'purchase'
      - `date` (date) - Order date
      - `customer` (text, nullable) - Customer name for sales
      - `supplier` (text, nullable) - Supplier name for purchases
      - `total_quantity` (integer) - Total order quantity
      - `remaining_quantity` (integer) - Remaining quantity to dispatch
      - `status` (text) - Order status (pending, partial, completed, cancelled)
      - `notes` (text, nullable) - Optional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid) - Reference to auth.users

    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (text) - Reference to orders
      - `name` (text) - Item name
      - `quantity` (integer) - Item quantity
      - `unit` (text) - Unit of measurement

    - `dispatches`
      - `id` (uuid, primary key)
      - `order_id` (text) - Reference to orders
      - `date` (date) - Dispatch date
      - `quantity` (integer) - Dispatch quantity
      - `notes` (text, nullable) - Optional notes
      - `created_at` (timestamptz)
      - `user_id` (uuid) - Reference to auth.users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create orders table
CREATE TABLE orders (
  id text PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('sale', 'purchase')),
  date date NOT NULL,
  customer text,
  supplier text,
  total_quantity integer NOT NULL,
  remaining_quantity integer NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'partial', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Create order_items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL,
  unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create dispatches table
CREATE TABLE dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  date date NOT NULL,
  quantity integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "Users can view their order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Create policies for dispatches
CREATE POLICY "Users can view their dispatches"
  ON dispatches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dispatches"
  ON dispatches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);