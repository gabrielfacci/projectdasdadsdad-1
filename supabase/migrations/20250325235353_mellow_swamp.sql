/*
  # Fix get_user_id_by_email_rpc Function
  
  1. Changes
    - Drop and recreate function with proper parameter handling
    - Add default parameter value
    - Add proper error handling
    - Add proper security settings
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Proper parameter validation
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_id_by_email_rpc;

-- Create get_user_id_by_email_rpc with proper parameter handling
CREATE OR REPLACE FUNCTION get_user_id_by_email_rpc(p_email text DEFAULT NULL)
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
    -- Return empty object instead of raising error for null parameter
    RETURN '{}'::jsonb;
  END IF;

  -- Get user ID and convert to JSONB
  SELECT jsonb_build_object(
    'id', u.id
  ) INTO v_result
  FROM users u
  WHERE u.email = p_email;

  -- Return JSONB result (empty object if user not found)
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION get_user_id_by_email_rpc(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_user_id_by_email_rpc(text) IS 'Gets a user''s ID by their email address';