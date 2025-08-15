/*
  # Fix check_user_exists Function - Final Fix
  
  1. Changes
    - Drop and recreate function with proper parameter handling
    - Add explicit parameter validation
    - Grant execute to anon role
    - Set proper security context
    - Fix search path
    - Add proper error handling
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Parameter validation
    - Proper error handling
*/

-- Drop existing function if it exists
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
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email parameter is required';
  END IF;

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

  -- If no rows returned, return empty result
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;

-- Grant execute permissions to both authenticated and anonymous users
REVOKE ALL ON FUNCTION check_user_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION check_user_exists(text) IS 'Checks if a user exists and returns their basic profile information';

-- Ensure proper search path for all sessions
ALTER FUNCTION check_user_exists(text) SET search_path = public;