-- Drop ALL existing versions of the function
DO $$ 
BEGIN
  -- Drop all versions with different parameter combinations
  DROP FUNCTION IF EXISTS update_user_profile_rpc(text, boolean, uuid);
  DROP FUNCTION IF EXISTS update_user_profile_rpc(uuid, text, boolean);
  DROP FUNCTION IF EXISTS update_user_profile_rpc(p_name text, p_onboarding_completed boolean, p_user_id uuid);
  DROP FUNCTION IF EXISTS update_user_profile_rpc(p_user_id uuid, p_name text, p_onboarding_completed boolean);
EXCEPTION WHEN OTHERS THEN END $$;

-- Create new function with proper parameter handling
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
REVOKE ALL ON FUNCTION update_user_profile_rpc(uuid, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_user_profile_rpc(uuid, text, boolean) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION update_user_profile_rpc(uuid, text, boolean) IS 'Updates a user''s profile information with improved parameter validation';