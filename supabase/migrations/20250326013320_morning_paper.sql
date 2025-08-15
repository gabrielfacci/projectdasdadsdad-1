-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_id_by_email_rpc;

-- Create get_user_id_by_email_rpc with proper parameter handling
CREATE OR REPLACE FUNCTION get_user_id_by_email_rpc(
  p_email text
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

-- Grant execute permissions
REVOKE ALL ON FUNCTION get_user_id_by_email_rpc(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_user_id_by_email_rpc(text) IS 'Gets a user''s ID by their email address with improved error handling';