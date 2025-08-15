/*
  # Fix Database Functions
  
  1. Changes
    - Fix parameter handling in all functions
    - Add proper validation
    - Add proper error handling
    - Add proper security settings
    - Fix ambiguous column references
    
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
DROP FUNCTION IF EXISTS update_user_profile;

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

-- Recreate update_user_profile with proper parameter handling
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id uuid,
  p_name text,
  p_onboarding_completed boolean
)
RETURNS TABLE (
  id uuid,
  name text,
  onboarding_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Update user profile
  RETURN QUERY
  UPDATE users u
  SET
    name = COALESCE(p_name, u.name),
    onboarding_completed = COALESCE(p_onboarding_completed, u.onboarding_completed),
    updated_at = now()
  WHERE u.id = p_user_id
  RETURNING u.id, u.name, u.onboarding_completed;

  -- Check if user was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION check_user_exists(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_id_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_all_licenses(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_profile(uuid, text, boolean) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_all_licenses(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_all_licenses(text) TO anon;
GRANT EXECUTE ON FUNCTION update_user_profile(uuid, text, boolean) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION check_user_exists(text) IS 'Checks if a user exists and returns their basic profile information';
COMMENT ON FUNCTION get_user_id_by_email(text) IS 'Gets a user''s ID by their email address';
COMMENT ON FUNCTION validate_all_licenses(text) IS 'Returns all licenses for a user with their current status';
COMMENT ON FUNCTION update_user_profile(uuid, text, boolean) IS 'Updates a user''s profile information';