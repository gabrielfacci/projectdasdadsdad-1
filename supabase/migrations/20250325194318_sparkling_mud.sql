/*
  # Database Functions
  
  This migration creates all necessary database functions for:
  1. User Management
  2. License Validation
  3. Referral System
  4. Access Control
*/

-- Create helper functions
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT id FROM users WHERE email = p_email);
END;
$$;

-- User Management Functions
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
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.name, u.role, u.onboarding_completed
  FROM users u
  WHERE u.email = p_email;
END;
$$;

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
AS $$
BEGIN
  RETURN QUERY
  UPDATE users
  SET
    name = COALESCE(p_name, name),
    onboarding_completed = COALESCE(p_onboarding_completed, onboarding_completed),
    updated_at = now()
  WHERE id = p_user_id
  RETURNING id, name, onboarding_completed;
END;
$$;

-- License Management Functions
CREATE OR REPLACE FUNCTION validate_all_licenses(p_email text)
RETURNS TABLE (
  product_code text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.product_code,
    l.license_status as status
  FROM users u
  JOIN licenses l ON l.user_id = u.id
  JOIN products p ON p.id = l.product_id
  WHERE u.email = p_email;
END;
$$;

CREATE OR REPLACE FUNCTION update_user_license_status(
  p_user_id uuid,
  p_has_license boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET 
    has_active_license = p_has_license,
    last_license_check = now(),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;

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
  SELECT id INTO v_user_id FROM users WHERE email = p_email;
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

CREATE OR REPLACE FUNCTION check_turbo_access(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM users WHERE email = p_email;
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

-- Referral System Functions
CREATE OR REPLACE FUNCTION get_complete_referral_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
  v_current_level json;
  v_next_level json;
  v_total_earnings numeric;
  v_total_referrals integer;
  v_sol_price numeric;
BEGIN
  -- Get current SOL price
  SELECT price INTO v_sol_price
  FROM sol_price_feed
  ORDER BY timestamp DESC
  LIMIT 1;

  -- Get user's total earnings and referrals
  SELECT 
    COALESCE(SUM(amount_sol), 0),
    COUNT(DISTINCT referral_id)
  INTO v_total_earnings, v_total_referrals
  FROM referral_transactions
  WHERE user_id = p_user_id
  AND status = 'completed'
  AND transaction_type = 'reward';

  -- Get current level
  SELECT json_build_object(
    'name', rl.name,
    'color', rl.color,
    'bonus', rl.bonus_percentage
  ) INTO v_current_level
  FROM referral_levels rl
  WHERE v_total_referrals >= rl.required_referrals
  AND v_total_earnings >= rl.required_earnings
  ORDER BY rl.required_referrals DESC, rl.required_earnings DESC
  LIMIT 1;

  -- Get next level
  SELECT json_build_object(
    'name', rl.name,
    'color', rl.color,
    'required_referrals', rl.required_referrals,
    'required_earnings', rl.required_earnings,
    'progress_referrals', LEAST(100, (v_total_referrals::float / rl.required_referrals::float * 100)),
    'progress_earnings', LEAST(100, (v_total_earnings / rl.required_earnings * 100))
  ) INTO v_next_level
  FROM referral_levels rl
  WHERE rl.required_referrals > v_total_referrals
  OR rl.required_earnings > v_total_earnings
  ORDER BY rl.required_referrals, rl.required_earnings
  LIMIT 1;

  -- Build complete stats object
  SELECT json_build_object(
    'stats', json_build_object(
      'total_referrals', v_total_referrals,
      'qualified_referrals', v_total_referrals,
      'total_earnings', v_total_earnings,
      'total_earnings_usd', v_total_earnings * v_sol_price,
      'sol_price', v_sol_price
    ),
    'level', json_build_object(
      'current', v_current_level,
      'next', v_next_level
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION process_withdrawal(
  p_user_id uuid,
  p_wallet_address text,
  p_amount_usd numeric,
  p_sol_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_amount_sol numeric;
  v_min_withdrawal_usd numeric;
  v_user_balance numeric;
BEGIN
  -- Get minimum withdrawal amount
  SELECT min_withdrawal_usd INTO v_min_withdrawal_usd
  FROM referral_settings
  WHERE active = true;

  -- Check minimum withdrawal
  IF p_amount_usd < v_min_withdrawal_usd THEN
    RAISE EXCEPTION 'Minimum withdrawal amount is $ %', v_min_withdrawal_usd;
  END IF;

  -- Get user's current balance
  SELECT referral_balance INTO v_user_balance
  FROM users
  WHERE id = p_user_id;

  -- Calculate SOL amount
  v_amount_sol := p_amount_usd / p_sol_price;

  -- Check if user has enough balance
  IF v_user_balance < v_amount_sol THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Create withdrawal transaction
  INSERT INTO referral_transactions (
    user_id,
    referral_id,
    amount_usd,
    amount_sol,
    sol_price,
    status,
    transaction_type,
    description
  ) VALUES (
    p_user_id,
    p_user_id,
    -p_amount_usd,
    -v_amount_sol,
    p_sol_price,
    'pending',
    'withdrawal',
    'Withdrawal to ' || p_wallet_address
  );

  -- Update user's balance
  UPDATE users
  SET referral_balance = referral_balance - v_amount_sol
  WHERE id = p_user_id;
END;
$$;

-- Handle new user registration or login
CREATE OR REPLACE FUNCTION handle_user_operation(
  p_email text,
  p_operation text,
  p_referral_code text DEFAULT NULL,
  p_has_license boolean DEFAULT false,
  p_sol_price numeric DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role user_role,
  onboarding_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_reward_amount_usd numeric;
  v_reward_amount_sol numeric;
BEGIN
  -- Get or create user
  IF p_operation = 'create' THEN
    INSERT INTO users (email, role, referred_by)
    VALUES (
      p_email,
      CASE WHEN p_email = 'admin1000@ghostwallet.com' THEN 'admin'::user_role ELSE 'user'::user_role END,
      p_referral_code
    )
    ON CONFLICT (email) DO UPDATE
    SET
      last_login = now(),
      updated_at = now()
    RETURNING id INTO v_user_id;

    -- Process referral reward if applicable
    IF p_referral_code IS NOT NULL THEN
      -- Get reward amount from settings
      SELECT reward_amount_usd INTO v_reward_amount_usd
      FROM referral_settings
      WHERE active = true;

      -- Calculate SOL amount
      v_reward_amount_sol := v_reward_amount_usd / COALESCE(p_sol_price, 20);

      -- Create reward transaction
      INSERT INTO referral_transactions (
        user_id,
        referral_id,
        amount_usd,
        amount_sol,
        sol_price,
        status,
        transaction_type,
        description
      )
      SELECT
        u.id,
        v_user_id,
        v_reward_amount_usd,
        v_reward_amount_sol,
        COALESCE(p_sol_price, 20),
        'completed',
        'reward',
        'Referral reward for ' || p_email
      FROM users u
      WHERE u.referral_code = p_referral_code;

      -- Update referrer's balance
      UPDATE users
      SET referral_balance = referral_balance + v_reward_amount_sol
      WHERE referral_code = p_referral_code;
    END IF;
  ELSE
    SELECT id INTO v_user_id
    FROM users
    WHERE email = p_email;
  END IF;

  -- Update license status if provided
  IF p_has_license IS NOT NULL THEN
    UPDATE users
    SET
      has_active_license = p_has_license,
      last_license_check = now(),
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Return user info
  RETURN QUERY
  SELECT u.id, u.email, u.name, u.role, u.onboarding_completed
  FROM users u
  WHERE u.id = v_user_id;
END;
$$;