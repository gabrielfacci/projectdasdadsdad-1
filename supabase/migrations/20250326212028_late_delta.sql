-- Drop existing functions and policies
DO $$ 
BEGIN
  -- Drop functions
  DROP FUNCTION IF EXISTS validate_all_licenses_rpc(text);
  DROP FUNCTION IF EXISTS update_user_license_status_v4(uuid, boolean);
  DROP FUNCTION IF EXISTS update_user_license_status_v3(uuid, boolean);
  DROP FUNCTION IF EXISTS update_user_license_status_rpc(uuid, boolean);
  DROP FUNCTION IF EXISTS check_blockchain_access_rpc(text, text);
  
  -- Drop policies (only if they exist)
  DROP POLICY IF EXISTS "Allow upsert licenses" ON licenses;
  DROP POLICY IF EXISTS "Allow update licenses" ON licenses;
  DROP POLICY IF EXISTS "Allow select licenses" ON licenses;
  DROP POLICY IF EXISTS "Allow insert licenses" ON licenses;
  DROP POLICY IF EXISTS "Allow select users" ON users;
  DROP POLICY IF EXISTS "Allow update users" ON users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create validate_all_licenses_rpc with fixed column references
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

  -- Get licenses using product_code instead of product_id
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_code', l.product_code,
      'status', l.license_status
    )
  ) INTO v_licenses
  FROM licenses l
  WHERE l.user_id = v_user_id;

  RETURN jsonb_build_object(
    'licenses', COALESCE(v_licenses, '[]'::jsonb),
    'success', true
  );
END;
$$;

-- Create update_user_license_status_rpc with unambiguous parameters
CREATE OR REPLACE FUNCTION update_user_license_status_rpc(
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

-- Create check_blockchain_access_rpc with fixed column references
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

  -- Check blockchain access using product_code
  SELECT EXISTS (
    SELECT 1
    FROM licenses l
    WHERE l.user_id = v_user_id
    AND l.license_status = 'active'
    AND (
      -- Basic Plan (Solana only)
      (l.product_code = 'PPPBC229' AND p_blockchain = 'solana')
      -- Black Plan
      OR (l.product_code = 'PPPBC293' AND p_blockchain IN ('solana', 'bitcoin', 'ethereum'))
      -- Diamond Plan
      OR (l.product_code = 'PPPBC295')
      -- Individual blockchain plans
      OR (l.product_code = 'PPPBC2F9' AND p_blockchain = 'bitcoin')
      OR (l.product_code = 'PPPBC2FD' AND p_blockchain = 'bsc')
      OR (l.product_code = 'PPPBC2FF' AND p_blockchain = 'cardano')
      OR (l.product_code = 'PPPBC2FC' AND p_blockchain = 'ethereum')
      OR (l.product_code = 'PPPBC2FH' AND p_blockchain = 'polkadot')
    )
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

-- Create RLS policies for licenses table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'licenses' AND policyname = 'Allow select licenses'
  ) THEN
    CREATE POLICY "Allow select licenses" 
      ON licenses FOR SELECT 
      TO authenticated 
      USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'licenses' AND policyname = 'Allow insert licenses'
  ) THEN
    CREATE POLICY "Allow insert licenses" 
      ON licenses FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'licenses' AND policyname = 'Allow update licenses'
  ) THEN
    CREATE POLICY "Allow update licenses" 
      ON licenses FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
      WITH CHECK (auth.uid() = user_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Create RLS policies for users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow select users'
  ) THEN
    CREATE POLICY "Allow select users" 
      ON users FOR SELECT 
      TO authenticated 
      USING (id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow update users'
  ) THEN
    CREATE POLICY "Allow update users" 
      ON users FOR UPDATE 
      TO authenticated 
      USING (id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin')
      WITH CHECK (id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');
  END IF;
END $$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION validate_all_licenses_rpc(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_user_license_status_rpc(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION check_blockchain_access_rpc(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION validate_all_licenses_rpc(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_user_license_status_rpc(uuid, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_blockchain_access_rpc(text, text) TO authenticated, anon;