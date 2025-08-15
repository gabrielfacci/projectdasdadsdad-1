/*
  # Fix RPC Function Names and Conflicts

  1. Changes
    - Drop ALL existing user profile functions to avoid conflicts
    - Create new functions with _rpc suffix and proper parameter handling
    - Add proper security settings and permissions
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Proper parameter validation
*/

-- Drop ALL existing functions first to avoid conflicts
DO $$ BEGIN
  -- Drop all versions of check_user_exists
  DROP FUNCTION IF EXISTS check_user_exists(text);
  DROP FUNCTION IF EXISTS check_user_exists_v2(text);
  DROP FUNCTION IF EXISTS check_user_exists_rpc(text);
  
  -- Drop all versions of update_user_profile
  DROP FUNCTION IF EXISTS update_user_profile(uuid, text, boolean);
  DROP FUNCTION IF EXISTS update_user_profile(text, boolean, uuid);
  DROP FUNCTION IF EXISTS update_user_profile_v2(uuid, text, boolean);
  DROP FUNCTION IF EXISTS update_user_profile_rpc(text, boolean, uuid);
  
  -- Drop all versions of get_user_id_by_email
  DROP FUNCTION IF EXISTS get_user_id_by_email(text);
  DROP FUNCTION IF EXISTS get_user_id_by_email_rpc(text);
  
  -- Drop all versions of validate_all_licenses
  DROP FUNCTION IF EXISTS validate_all_licenses(text);
  DROP FUNCTION IF EXISTS validate_all_licenses_rpc(text);
  
  -- Drop all versions of has_active_license
  DROP FUNCTION IF EXISTS has_active_license(text);
  DROP FUNCTION IF EXISTS has_active_license_rpc(text);
EXCEPTION WHEN OTHERS THEN END $$;

-- Create new functions with _rpc suffix
CREATE OR REPLACE FUNCTION check_user_exists_rpc(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email parameter is required';
  END IF;

  -- Get user info and convert to JSONB
  SELECT jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'name', u.name,
    'role', u.role,
    'onboarding_completed', u.onboarding_completed
  ) INTO v_result
  FROM users u
  WHERE u.email = p_email;

  -- Return JSONB result
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION get_user_id_by_email_rpc(p_email text)
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

CREATE OR REPLACE FUNCTION validate_all_licenses_rpc(p_email text)
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

CREATE OR REPLACE FUNCTION update_user_profile_rpc(
  p_user_id uuid,
  p_name text DEFAULT NULL,
  p_onboarding_completed boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Validate parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Update user profile and return as JSONB
  WITH updated AS (
    UPDATE users u
    SET
      name = COALESCE(p_name, u.name),
      onboarding_completed = COALESCE(p_onboarding_completed, u.onboarding_completed),
      updated_at = now()
    WHERE u.id = p_user_id
    RETURNING u.id, u.name, u.onboarding_completed
  )
  SELECT jsonb_build_object(
    'id', updated.id,
    'name', updated.name,
    'onboarding_completed', updated.onboarding_completed
  ) INTO v_result
  FROM updated;

  -- Check if user was found
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION has_active_license_rpc(p_email text)
RETURNS boolean
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

  -- Return whether user has any active license
  RETURN EXISTS (
    SELECT 1
    FROM licenses l
    WHERE l.user_id = v_user_id
    AND l.license_status = 'active'
  );
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION check_user_exists_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_id_by_email_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_all_licenses_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_profile_rpc(uuid, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION has_active_license_rpc(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION check_user_exists_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists_rpc(text) TO anon;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO anon;
GRANT EXECUTE ON FUNCTION update_user_profile_rpc(uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_license_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_license_rpc(text) TO anon;

-- Add helpful comments
COMMENT ON FUNCTION check_user_exists_rpc(text) IS 'Checks if a user exists and returns their basic profile information';
COMMENT ON FUNCTION get_user_id_by_email_rpc(text) IS 'Gets a user''s ID by their email address';
COMMENT ON FUNCTION validate_all_licenses_rpc(text) IS 'Returns all licenses for a user with their current status';
COMMENT ON FUNCTION update_user_profile_rpc(uuid, text, boolean) IS 'Updates a user''s profile information';
COMMENT ON FUNCTION has_active_license_rpc(text) IS 'Checks if a user has any active license';