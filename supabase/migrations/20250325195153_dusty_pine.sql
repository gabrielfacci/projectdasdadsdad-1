/*
  # Fix Ambiguous ID References
  
  This migration fixes the remaining ambiguous column references in the database functions
  by properly qualifying all column references with their table aliases.
  
  Changes:
  1. Update get_user_id_by_email function to use table alias
  2. Update check_blockchain_access function to use table alias
  3. Update check_turbo_access function to use table alias
*/

-- Update get_user_id_by_email function to use table alias
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT u.id FROM users u WHERE u.email = p_email);
END;
$$;

-- Update check_blockchain_access function to use table alias
CREATE OR REPLACE FUNCTION check_blockchain_access(
  p_email text,
  p_blockchain text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_has_access boolean;
BEGIN
  -- Get user ID
  SELECT u.id INTO v_user_id FROM users u WHERE u.email = p_email;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if user has any active license that grants access to this blockchain
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

  RETURN v_has_access;
END;
$$;

-- Update check_turbo_access function to use table alias
CREATE OR REPLACE FUNCTION check_turbo_access(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT u.id INTO v_user_id FROM users u WHERE u.email = p_email;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if user has turbo license
  RETURN EXISTS (
    SELECT 1
    FROM licenses l
    JOIN products p ON p.id = l.product_id
    WHERE l.user_id = v_user_id
    AND l.license_status = 'active'
    AND p.product_code = 'PPPBAHKJ'
  );
END;
$$;