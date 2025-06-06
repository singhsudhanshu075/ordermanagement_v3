/*
  # Add last login tracking

  1. Changes
    - Add last_login column to auth.users table
    - Create function to update last_login timestamp
    - Create trigger to automatically update last_login on sign in

  2. Security
    - Function is security definer to ensure it can update auth.users
    - Only the trigger can call the function
*/

-- Add last_login column to auth.users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Create function to update last_login
CREATE OR REPLACE FUNCTION auth.handle_user_login()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users
  SET last_login = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_login on sign in
DROP TRIGGER IF EXISTS on_auth_sign_in ON auth.sessions;
CREATE TRIGGER on_auth_sign_in
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION auth.handle_user_login();