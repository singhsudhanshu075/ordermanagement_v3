/*
  # Admin Roles and Enhanced RLS Policies

  1. New Tables
    - `user_roles` - Stores user role assignments (user, admin)
    
  2. Security Changes
    - Update all existing RLS policies to allow admin access
    - Add role-based access control
    - Create function to check if user is admin
    
  3. Admin Features
    - Admins can view/manage all data across all users
    - Regular users can only access their own data
    - Role assignment system for future scalability
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles (only admins can manage roles)
CREATE POLICY "Admins can view all user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can create user roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update user roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete user roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Create function to check if user is admin or owns the data
CREATE OR REPLACE FUNCTION is_admin_or_owner(data_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    auth.uid() = data_user_id OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Function to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign role to new users
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_role();

-- Update RLS policies for all existing tables

-- Orders table
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

CREATE POLICY "Users can view their orders or admins can view all"
  ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

CREATE POLICY "Users can create their orders or admins can create any"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can update their orders or admins can update any"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_owner(user_id))
  WITH CHECK (is_admin_or_owner(user_id));

-- Order Items table
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can update their order items" ON order_items;

CREATE POLICY "Users can view their order items or admins can view all"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND is_admin_or_owner(orders.user_id)
    )
  );

CREATE POLICY "Users can create order items or admins can create any"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND is_admin_or_owner(orders.user_id)
    )
  );

CREATE POLICY "Users can update their order items or admins can update any"
  ON order_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND is_admin_or_owner(orders.user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND is_admin_or_owner(orders.user_id)
    )
  );

-- Dispatches table
DROP POLICY IF EXISTS "Users can view their dispatches" ON dispatches;
DROP POLICY IF EXISTS "Users can create their own dispatches" ON dispatches;

CREATE POLICY "Users can view their dispatches or admins can view all"
  ON dispatches
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

CREATE POLICY "Users can create their dispatches or admins can create any"
  ON dispatches
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_owner(user_id));

-- Payments table
DROP POLICY IF EXISTS "Users can view their payments" ON payments;
DROP POLICY IF EXISTS "Users can create their payments" ON payments;

CREATE POLICY "Users can view their payments or admins can view all"
  ON payments
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

CREATE POLICY "Users can create their payments or admins can create any"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_owner(user_id));

-- Products table
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can create their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

CREATE POLICY "Users can view their products or admins can view all"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

CREATE POLICY "Users can create their products or admins can create any"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can update their products or admins can update any"
  ON products
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_owner(user_id))
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can delete their products or admins can delete any"
  ON products
  FOR DELETE
  TO authenticated
  USING (is_admin_or_owner(user_id));

-- Customers table
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

CREATE POLICY "Users can view their customers or admins can view all"
  ON customers
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

CREATE POLICY "Users can create their customers or admins can create any"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can update their customers or admins can update any"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_owner(user_id))
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can delete their customers or admins can delete any"
  ON customers
  FOR DELETE
  TO authenticated
  USING (is_admin_or_owner(user_id));

-- Suppliers table
DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can create their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

CREATE POLICY "Users can view their suppliers or admins can view all"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

CREATE POLICY "Users can create their suppliers or admins can create any"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can update their suppliers or admins can update any"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_owner(user_id))
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can delete their suppliers or admins can delete any"
  ON suppliers
  FOR DELETE
  TO authenticated
  USING (is_admin_or_owner(user_id));

-- Product Types table
DROP POLICY IF EXISTS "Users can view their own product types" ON product_types;
DROP POLICY IF EXISTS "Users can create their own product types" ON product_types;
DROP POLICY IF EXISTS "Users can update their own product types" ON product_types;
DROP POLICY IF EXISTS "Users can delete their own product types" ON product_types;

CREATE POLICY "Users can view their product types or admins can view all"
  ON product_types
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

CREATE POLICY "Users can create their product types or admins can create any"
  ON product_types
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can update their product types or admins can update any"
  ON product_types
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_owner(user_id))
  WITH CHECK (is_admin_or_owner(user_id));

CREATE POLICY "Users can delete their product types or admins can delete any"
  ON product_types
  FOR DELETE
  TO authenticated
  USING (is_admin_or_owner(user_id));

-- User Login History table
DROP POLICY IF EXISTS "Users can view their own login history" ON user_login_history;

CREATE POLICY "Users can view their login history or admins can view all"
  ON user_login_history
  FOR SELECT
  TO authenticated
  USING (is_admin_or_owner(user_id));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user_role() TO authenticated;

-- Create a view for easy role checking (optional)
CREATE OR REPLACE VIEW user_roles_view AS
SELECT 
  ur.user_id,
  ur.role,
  au.email,
  ur.created_at,
  ur.updated_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id;

-- Grant access to the view
GRANT SELECT ON user_roles_view TO authenticated;