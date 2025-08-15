/*
  # Fix check_user_exists Function - Final Fix
  
  1. Fixes
    - Drop and recreate function with proper parameter handling
    - Add proper security settings
    - Grant correct permissions
    - Fix search path
    
  2. Changes
    - Adds explicit parameter handling
    - Grants execute to both authenticated and anon roles
    - Sets proper security context
*/

-- Drop existing function
DROP FUNCTION IF EXISTS check_user_exists(text);

-- Recreate with proper parameter handling and security
CREATE OR REPLACE FUNCTION check_user_exists(p_email text)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role user_role,
  onboarding_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return user info with proper table alias and parameter
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.onboarding_completed
  FROM users u
  WHERE u.email = p_email;
END;
$$;

-- Grant execute permissions to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION check_user_exists(text) IS 'Checks if a user exists and returns their basic profile information';

-- Ensure proper search path for all sessions
ALTER FUNCTION check_user_exists(text) SET search_path = public;