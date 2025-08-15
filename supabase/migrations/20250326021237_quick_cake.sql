-- Drop existing functions
DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS get_user_id_by_email_rpc(text);
  DROP FUNCTION IF EXISTS validate_all_licenses_rpc(text);
  DROP FUNCTION IF EXISTS update_user_license_status_v3(uuid, boolean);
  DROP FUNCTION IF EXISTS update_user_profile_rpc(uuid, text, boolean);
EXCEPTION WHEN OTHERS THEN END $$;

-- Create get_user_id_by_email_rpc with proper parameter handling
CREATE OR REPLACE FUNCTION get_user_id_by_email_rpc(
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object(
      'error', 'Email parameter is required',
      'success', false
    );
  END IF;

  -- Get user ID
  SELECT u.id INTO v_user_id
  FROM users u
  WHERE u.email = p_email;

  -- Return result
  IF v_user_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'id', v_user_id,
      'success', true
    );
  ELSE
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;
END;
$$;

-- Create validate_all_licenses_rpc with proper parameter handling
CREATE OR REPLACE FUNCTION validate_all_licenses_rpc(
  p_email text DEFAULT NULL
)
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
    RETURN jsonb_build_object(
      'error', 'Email parameter is required',
      'success', false
    );
  END IF;

  -- Get user ID
  SELECT u.id INTO v_user_id
  FROM users u
  WHERE u.email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;

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

  -- Return success response
  RETURN jsonb_build_object(
    'licenses', COALESCE(v_result, '[]'::jsonb),
    'success', true
  );
END;
$$;

-- Create update_user_license_status_v3 with improved parameter handling
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
  v_user_exists boolean;
BEGIN
  -- Validate user_id parameter
  IF p_user_id IS NULL OR p_user_id = '00000000-0000-0000-0000-000000000000' THEN
    RETURN jsonb_build_object(
      'error', 'Invalid user ID provided',
      'success', false
    );
  END IF;

  -- Check if user exists first
  SELECT EXISTS (
    SELECT 1 FROM users u WHERE u.id = p_user_id
  ) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;

  -- Update user's license status and return result as JSONB
  WITH updated AS (
    UPDATE users u
    SET 
      has_active_license = COALESCE(p_has_license, false),
      last_license_check = now(),
      updated_at = now()
    WHERE u.id = p_user_id
    RETURNING u.id, u.has_active_license, u.last_license_check
  )
  SELECT jsonb_build_object(
    'id', updated.id,
    'has_active_license', updated.has_active_license,
    'last_license_check', updated.last_license_check,
    'success', true
  ) INTO v_result
  FROM updated;

  RETURN v_result;
END;
$$;

-- Create update_user_profile_rpc with proper parameter handling
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
  v_user_exists boolean;
BEGIN
  -- Validate user_id parameter
  IF p_user_id IS NULL OR p_user_id = '00000000-0000-0000-0000-000000000000' THEN
    RETURN jsonb_build_object(
      'error', 'Invalid user ID provided',
      'success', false
    );
  END IF;

  -- Check if user exists first
  SELECT EXISTS (
    SELECT 1 FROM users u WHERE u.id = p_user_id
  ) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
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
    'onboarding_completed', updated.onboarding_completed,
    'success', true
  ) INTO v_result
  FROM updated;

  RETURN v_result;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION get_user_id_by_email_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_all_licenses_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_license_status_v3(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_profile_rpc(uuid, text, boolean) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO anon;
GRANT EXECUTE ON FUNCTION update_user_license_status_v3(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_license_status_v3(uuid, boolean) TO anon;
GRANT EXECUTE ON FUNCTION update_user_profile_rpc(uuid, text, boolean) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_user_id_by_email_rpc(text) IS 'Gets a user''s ID by their email address with improved error handling';
COMMENT ON FUNCTION validate_all_licenses_rpc(text) IS 'Returns all licenses for a user with improved error handling';
COMMENT ON FUNCTION update_user_license_status_v3(uuid, boolean) IS 'Updates a user''s license status with improved parameter validation';
COMMENT ON FUNCTION update_user_profile_rpc(uuid, text, boolean) IS 'Updates a user''s profile information with improved parameter validation';