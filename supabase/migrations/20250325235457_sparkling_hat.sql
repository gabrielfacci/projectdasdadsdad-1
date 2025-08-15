/*
  # Fix License Management Functions
  
  1. Changes
    - Create validate_all_licenses_rpc function with proper parameter handling
    - Create update_user_license_status_v3 function with proper parameter handling
    - Add proper security settings
    - Add proper parameter validation
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Proper parameter validation
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS validate_all_licenses_rpc;
DROP FUNCTION IF EXISTS update_user_license_status_v3;

-- Create validate_all_licenses_rpc with proper parameter handling
CREATE OR REPLACE FUNCTION validate_all_licenses_rpc(p_email text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    -- Return empty array instead of raising error for null parameter
    RETURN '[]'::jsonb;
  END IF;

  -- Get user ID
  SELECT u.id INTO v_user_id
  FROM users u
  WHERE u.email = p_email;

  -- Return license info as JSONB array
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_code', p.product_code,
      'status', l.license_status
    )
  ) INTO v_result
  FROM licenses l
  JOIN products p ON p.id = l.product_id
  WHERE l.user_id = v_user_id;

  -- Return JSONB result (empty array if no licenses found)
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Create update_user_license_status_v3 with proper parameter handling
CREATE OR REPLACE FUNCTION update_user_license_status_v3(
  p_user_id uuid,
  p_has_license boolean
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

  -- Update user's license status and return result as JSONB
  WITH updated AS (
    UPDATE users u
    SET 
      has_active_license = p_has_license,
      last_license_check = now(),
      updated_at = now()
    WHERE u.id = p_user_id
    RETURNING u.id, u.has_active_license, u.last_license_check
  )
  SELECT jsonb_build_object(
    'id', updated.id,
    'has_active_license', updated.has_active_license,
    'last_license_check', updated.last_license_check
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
REVOKE ALL ON FUNCTION validate_all_licenses_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_license_status_v3(uuid, boolean) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO anon;
GRANT EXECUTE ON FUNCTION update_user_license_status_v3(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_license_status_v3(uuid, boolean) TO anon;

-- Add helpful comments
COMMENT ON FUNCTION validate_all_licenses_rpc(text) IS 'Returns all licenses for a user with their current status';
COMMENT ON FUNCTION update_user_license_status_v3(uuid, boolean) IS 'Updates a user''s license status';