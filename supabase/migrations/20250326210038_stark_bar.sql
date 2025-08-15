/*
  # Complete Auth System Rebuild
  
  1. Core Functions
    - User management
    - License verification
    - Access control
    - RLS policies
    
  2. Security
    - SECURITY DEFINER for all functions
    - Proper search_path
    - Parameter validation
    - Error handling
*/

-- Drop existing functions to avoid conflicts
DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS check_user_exists_rpc(text);
  DROP FUNCTION IF EXISTS get_user_id_by_email_rpc(text);
  DROP FUNCTION IF EXISTS validate_all_licenses_rpc(text);
  DROP FUNCTION IF EXISTS update_user_license_status_v4(uuid, boolean);
  DROP FUNCTION IF EXISTS check_blockchain_access_rpc(text, text);
  DROP FUNCTION IF EXISTS check_turbo_access_rpc(text);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create check_user_exists_rpc function
CREATE OR REPLACE FUNCTION check_user_exists_rpc(
  p_email text
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
      'error', 'Email is required',
      'success', false
    );
  END IF;

  -- Check if user exists
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  -- If user doesn't exist, create them
  IF v_user_id IS NULL THEN
    INSERT INTO users (
      email,
      role,
      has_active_license,
      onboarding_completed,
      referral_code
    ) VALUES (
      p_email,
      CASE 
        WHEN p_email = 'admin1000@ghostwallet.com' THEN 'admin'::user_role 
        ELSE 'user'::user_role 
      END,
      false,
      false,
      'GW' || substring(md5(random()::text) from 1 for 8)
    )
    RETURNING id INTO v_user_id;

    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'name', u.name,
      'role', u.role,
      'onboarding_completed', u.onboarding_completed,
      'success', true,
      'created', true
    ) INTO v_result
    FROM users u
    WHERE u.id = v_user_id;
  ELSE
    SELECT jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'name', u.name,
      'role', u.role,
      'onboarding_completed', u.onboarding_completed,
      'success', true,
      'created', false
    ) INTO v_result
    FROM users u
    WHERE u.id = v_user_id;
  END IF;

  RETURN v_result;
END;
$$;

-- Create get_user_id_by_email_rpc function
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
      'error', 'Email is required',
      'success', false
    );
  END IF;

  -- Get user ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;

  RETURN jsonb_build_object(
    'id', v_user_id,
    'success', true
  );
END;
$$;

-- Create validate_all_licenses_rpc function
CREATE OR REPLACE FUNCTION validate_all_licenses_rpc(
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_licenses jsonb;
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object(
      'error', 'Email is required',
      'success', false
    );
  END IF;

  -- Get user ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;

  -- Get licenses
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_code', p.product_code,
      'status', l.license_status
    )
  ) INTO v_licenses
  FROM licenses l
  JOIN products p ON p.id = l.product_id
  WHERE l.user_id = v_user_id;

  RETURN jsonb_build_object(
    'licenses', COALESCE(v_licenses, '[]'::jsonb),
    'success', true
  );
END;
$$;

-- Create update_user_license_status_v4 function
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
  -- Validate parameters
  IF p_user_id IS NULL OR p_user_id = '00000000-0000-0000-0000-000000000000' THEN
    RETURN jsonb_build_object(
      'error', 'Invalid user ID',
      'success', false
    );
  END IF;

  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = p_user_id
  ) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;

  -- Update user's license status
  WITH updated AS (
    UPDATE users
    SET 
      has_active_license = COALESCE(p_has_license, false),
      last_license_check = now(),
      updated_at = now()
    WHERE id = p_user_id
    RETURNING id, has_active_license, last_license_check
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

-- Create check_blockchain_access_rpc function
CREATE OR REPLACE FUNCTION check_blockchain_access_rpc(
  p_email text,
  p_blockchain text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_has_access boolean;
BEGIN
  -- Validate parameters
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object(
      'error', 'Email is required',
      'success', false
    );
  END IF;

  IF p_blockchain IS NULL OR p_blockchain = '' THEN
    RETURN jsonb_build_object(
      'error', 'Blockchain is required',
      'success', false
    );
  END IF;

  -- Get user ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;

  -- Check blockchain access
  SELECT EXISTS (
    SELECT 1
    FROM licenses l
    JOIN products p ON p.id = l.product_id
    WHERE l.user_id = v_user_id
    AND l.license_status = 'active'
    AND (
      -- Basic Plan (Solana only)
      (p.product_code = 'PPPBC229' AND p_blockchain = 'solana')
      -- Black Plan
      OR (p.product_code = 'PPPBC293' AND p_blockchain IN ('solana', 'bitcoin', 'ethereum'))
      -- Diamond Plan
      OR (p.product_code = 'PPPBC295')
      -- Individual blockchain plans
      OR (p.product_code = 'PPPBC2F9' AND p_blockchain = 'bitcoin')
      OR (p.product_code = 'PPPBC2FD' AND p_blockchain = 'bsc')
      OR (p.product_code = 'PPPBC2FF' AND p_blockchain = 'cardano')
      OR (p.product_code = 'PPPBC2FC' AND p_blockchain = 'ethereum')
      OR (p.product_code = 'PPPBC2FH' AND p_blockchain = 'polkadot')
    )
  ) INTO v_has_access;

  RETURN jsonb_build_object(
    'has_access', v_has_access,
    'success', true
  );
END;
$$;

-- Create check_turbo_access_rpc function
CREATE OR REPLACE FUNCTION check_turbo_access_rpc(
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_has_access boolean;
BEGIN
  -- Validate parameter
  IF p_email IS NULL OR p_email = '' THEN
    RETURN jsonb_build_object(
      'error', 'Email is required',
      'success', false
    );
  END IF;

  -- Get user ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not found',
      'success', false
    );
  END IF;

  -- Check turbo access
  SELECT EXISTS (
    SELECT 1
    FROM licenses l
    JOIN products p ON p.id = l.product_id
    WHERE l.user_id = v_user_id
    AND l.license_status = 'active'
    AND p.product_code = 'PPPBAHKJ'
  ) INTO v_has_access;

  RETURN jsonb_build_object(
    'has_access', v_has_access,
    'success', true
  );
END;
$$;

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow select users" ON users;
DROP POLICY IF EXISTS "Allow insert users" ON users;
DROP POLICY IF EXISTS "Allow update users" ON users;
DROP POLICY IF EXISTS "Allow upsert licenses" ON licenses;
DROP POLICY IF EXISTS "Allow update licenses" ON licenses;

-- Create RLS policies
CREATE POLICY "Allow select users" 
  ON users FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow insert users" 
  ON users FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow update users" 
  ON users FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow upsert licenses" 
  ON licenses FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow update licenses" 
  ON licenses FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Grant execute permissions
REVOKE ALL ON FUNCTION check_user_exists_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_id_by_email_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_all_licenses_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_license_status_v4(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION check_blockchain_access_rpc(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION check_turbo_access_rpc(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION check_user_exists_rpc(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_id_by_email_rpc(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_license_status_v4(uuid, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_blockchain_access_rpc(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_turbo_access_rpc(text) TO anon, authenticated;