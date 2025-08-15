/*
  # Fix Validate All Licenses Function
  
  1. Changes
    - Fix validate_all_licenses function with proper parameter handling
    - Add proper error handling
    - Add proper security settings
    - Add proper parameter validation
    - Add proper return types
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Parameter validation
    - Proper error handling
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_all_licenses;

-- Recreate validate_all_licenses with proper parameter handling
CREATE OR REPLACE FUNCTION validate_all_licenses(p_email text DEFAULT NULL)
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

  -- If no rows returned, return empty result
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION validate_all_licenses(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_all_licenses(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_all_licenses(text) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION validate_all_licenses(text) IS 'Returns all licenses for a user with their current status';