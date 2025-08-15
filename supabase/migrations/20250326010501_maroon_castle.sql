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
  v_result jsonb;
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object(
      'error', 'Email parameter is required',
      'success', false
    );
  END IF;

  -- Get user ID and convert to JSONB
  SELECT jsonb_build_object(
    'id', u.id,
    'success', true
  ) INTO v_result
  FROM users u
  WHERE u.email = p_email;

  -- Return JSONB result (error object if user not found)
  RETURN COALESCE(
    v_result,
    jsonb_build_object(
      'error', 'User not found',
      'success', false
    )
  );
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION get_user_id_by_email_rpc(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_user_id_by_email_rpc(text) IS 'Gets a user''s ID by their email address with improved error handling';