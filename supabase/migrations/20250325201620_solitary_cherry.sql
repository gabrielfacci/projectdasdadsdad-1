/*
  # Fix Update User Profile Function
  
  1. Changes
    - Create update_user_profile function with proper parameter handling
    - Add proper security settings
    - Add proper error handling
    - Add proper validation
    
  2. Security
    - SECURITY DEFINER to run as owner
    - Explicit search_path to prevent search_path attacks
    - Proper parameter validation
    - Proper error handling
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_user_profile;

-- Create update_user_profile function
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id uuid,
  p_name text,
  p_onboarding_completed boolean
)
RETURNS TABLE (
  id uuid,
  name text,
  onboarding_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Update user profile
  RETURN QUERY
  UPDATE users u
  SET
    name = COALESCE(p_name, u.name),
    onboarding_completed = COALESCE(p_onboarding_completed, u.onboarding_completed),
    updated_at = now()
  WHERE u.id = p_user_id
  RETURNING u.id, u.name, u.onboarding_completed;

  -- Check if user was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION update_user_profile(uuid, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_user_profile(uuid, text, boolean) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION update_user_profile(uuid, text, boolean) IS 'Updates a user''s profile information';