/*
  # Fix License Status Function
  
  1. Changes
    - Drop ALL existing versions of the function
    - Create new function with unique name
    - Add proper parameter validation
    - Add proper error handling
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Proper parameter validation
*/

-- Drop ALL existing versions of the function
DO $$ 
BEGIN
  -- Drop all versions with different parameter combinations
  DROP FUNCTION IF EXISTS update_user_license_status_v3(uuid, boolean);
  DROP FUNCTION IF EXISTS update_user_license_status_v3(boolean, uuid);
  DROP FUNCTION IF EXISTS update_user_license_status_v3(p_user_id uuid, p_has_license boolean);
  DROP FUNCTION IF EXISTS update_user_license_status_v3(p_has_license boolean, p_user_id uuid);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create new function with unique name and consistent parameter order
CREATE OR REPLACE FUNCTION update_user_license_status_v4(
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

-- Grant execute permissions
REVOKE ALL ON FUNCTION update_user_license_status_v4(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_user_license_status_v4(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_license_status_v4(uuid, boolean) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION update_user_license_status_v4(uuid, boolean) IS 'Updates a user''s license status with improved parameter validation';