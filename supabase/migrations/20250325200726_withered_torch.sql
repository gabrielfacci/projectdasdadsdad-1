/*
  # Fix Database Functions Parameter Handling
  
  1. Changes
    - Fix parameter validation in check_user_exists
    - Fix parameter validation in get_user_id_by_email
    - Fix parameter validation in validate_all_licenses
    - Add proper error handling
    - Add proper security settings
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Proper parameter validation
    - Proper error handling
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS check_user_exists;
DROP FUNCTION IF EXISTS get_user_id_by_email;
DROP FUNCTION IF EXISTS validate_all_licenses;

-- Recreate check_user_exists with proper parameter handling
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
END;
$$;

-- Recreate get_user_id_by_email with proper parameter handling
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text)
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

-- Recreate validate_all_licenses with proper parameter handling
CREATE OR REPLACE FUNCTION validate_all_licenses(p_email text)
RETURNS TABLE (
  product_code text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email parameter is required';
  END IF;

  -- Get user ID
  SELECT u.id INTO v_user_id
  FROM users u
  WHERE u.email = p_email;

  -- Return license info with proper table aliases
  RETURN QUERY
  SELECT 
    p.product_code,
    l.license_status as status
  FROM licenses l
  JOIN products p ON p.id = l.product_id
  WHERE l.user_id = v_user_id;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION check_user_exists(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_id_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_all_licenses(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_all_licenses(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_all_licenses(text) TO anon;

-- Add helpful comments
COMMENT ON FUNCTION check_user_exists(text) IS 'Checks if a user exists and returns their basic profile information';
COMMENT ON FUNCTION get_user_id_by_email(text) IS 'Gets a user''s ID by their email address';
COMMENT ON FUNCTION validate_all_licenses(text) IS 'Returns all licenses for a user with their current status';