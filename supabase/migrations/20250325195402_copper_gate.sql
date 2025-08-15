/*
  # Fix check_user_exists Function
  
  This migration fixes the check_user_exists function by:
  1. Properly registering it with the correct parameter
  2. Using table aliases consistently
  3. Adding SECURITY DEFINER for proper access control
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_user_exists(text);

-- Create the function with proper parameter definition
CREATE OR REPLACE FUNCTION check_user_exists(p_email text)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role user_role,
  onboarding_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.onboarding_completed
  FROM users u
  WHERE u.email = p_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION check_user_exists(text) IS 'Checks if a user exists and returns their basic profile information';