/*
  # Fix User Functions - Final Fix
  
  1. Changes
    - Fix check_user_exists function with proper parameter handling
    - Fix get_user_id_by_email function with proper parameter handling
    - Add proper error handling
    - Add proper security settings
    - Add proper parameter validation
    - Add proper return types
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Parameter validation
    - Proper error handling
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS check_user_exists;
DROP FUNCTION IF EXISTS get_user_id_by_email;

-- Recreate check_user_exists with proper parameter handling
CREATE OR REPLACE FUNCTION check_user_exists(p_email text DEFAULT NULL)
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

-- Recreate get_user_id_by_email with proper parameter handling
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email parameter is required';
  END IF;

  -- Return user ID with proper table alias
  RETURN (
    SELECT u.id 
    FROM users u 
    WHERE u.email = p_email
  );
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION check_user_exists(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_id_by_email(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO anon;

-- Add helpful comments
COMMENT ON FUNCTION check_user_exists(text) IS 'Checks if a user exists and returns their basic profile information';
COMMENT ON FUNCTION get_user_id_by_email(text) IS 'Gets a user''s ID by their email address';