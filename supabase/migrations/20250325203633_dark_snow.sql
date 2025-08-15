/*
  # Fix User Management Functions
  
  1. Changes
    - Drop and recreate functions with proper parameter handling
    - Fix return types to use JSONB
    - Add proper security settings
    - Add proper parameter validation
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Proper parameter validation
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS check_user_exists_v2(text);
DROP FUNCTION IF EXISTS update_user_profile_v2(uuid, text, boolean);

-- Create check_user_exists_v2 with proper parameter handling
CREATE OR REPLACE FUNCTION check_user_exists_v2(p_email text)
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

-- Create update_user_profile_v2 with proper parameter handling
CREATE OR REPLACE FUNCTION update_user_profile_v2(
  p_user_id uuid,
  p_name text,
  p_onboarding_completed boolean
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

-- Grant execute permissions
REVOKE ALL ON FUNCTION check_user_exists_v2(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_profile_v2(uuid, text, boolean) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION check_user_exists_v2(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists_v2(text) TO anon;
GRANT EXECUTE ON FUNCTION update_user_profile_v2(uuid, text, boolean) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION check_user_exists_v2(text) IS 'JSON wrapper for checking if a user exists';
COMMENT ON FUNCTION update_user_profile_v2(uuid, text, boolean) IS 'JSON wrapper for updating user profile';