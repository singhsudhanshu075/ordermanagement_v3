/*
  # Add Product Types Table

  1. New Tables
    - `product_types`
      - `id` (uuid, primary key)
      - `name` (text, unique per user)
      - `gauge_difference` (integer)
      - `type` (text, 'sale', 'purchase', or 'both')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on `product_types` table
    - Add policies for authenticated users to manage their own product types

  3. Data
    - Pre-populate with existing product types from the application
*/

-- Create product_types table
CREATE TABLE IF NOT EXISTS product_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gauge_difference integer NOT NULL,
  type text NOT NULL CHECK (type IN ('sale', 'purchase', 'both')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Enable RLS
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own product types"
  ON product_types
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product types"
  ON product_types
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product types"
  ON product_types
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product types"
  ON product_types
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_types_user_id ON product_types(user_id);
CREATE INDEX IF NOT EXISTS idx_product_types_type ON product_types(type);
CREATE INDEX IF NOT EXISTS idx_product_types_name ON product_types(name);

-- Insert default product types (these will be available for all users initially)
-- Note: In a real application, you might want to create these per user or have a seeding mechanism
INSERT INTO product_types (name, gauge_difference, type, user_id) 
SELECT 
  product_name,
  gauge_diff,
  product_type,
  auth.uid()
FROM (
  VALUES 
    ('40x3', 7800, 'both'),
    ('30x3', 7800, 'both'),
    ('32x3', 7500, 'both'),
    ('35x5', 7200, 'both'),
    ('35x4', 7500, 'both'),
    ('40x5', 7000, 'both'),
    ('40x6', 7000, 'both'),
    ('50x5', 6400, 'both'),
    ('65x5', 6400, 'both'),
    ('75x5', 6400, 'both'),
    ('50x6', 6100, 'both'),
    ('65x6', 6100, 'both'),
    ('75x6', 6100, 'both'),
    ('65x8', 6400, 'both'),
    ('75x8', 6400, 'both'),
    ('65x10', 6700, 'both'),
    ('75x10', 6700, 'both'),
    ('50x4', 7500, 'both'),
    ('40x4', 7500, 'both'),
    ('45x4', 7800, 'both'),
    ('45x5', 7200, 'both')
) AS default_products(product_name, gauge_diff, product_type)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (name, user_id) DO NOTHING;