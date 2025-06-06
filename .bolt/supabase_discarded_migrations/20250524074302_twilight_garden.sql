/*
  # Add login tracking

  This migration creates a custom table to track user logins
  since we cannot directly modify the auth.users table.

  1. New Tables
    - `user_login_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `logged_in_at` (timestamptz) - Login timestamp
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create user_login_history table
CREATE TABLE IF NOT EXISTS user_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_in_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own login history"
  ON user_login_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to record login
CREATE OR REPLACE FUNCTION public.handle_new_user_login()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_login_history (user_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to record login on session creation
DROP TRIGGER IF EXISTS on_auth_sign_in ON auth.sessions;
CREATE TRIGGER on_auth_sign_in
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_login();