/*
  # Fix Ambiguous Column References
  
  This migration fixes all remaining ambiguous column references in the database functions
  by properly qualifying all column references with their table aliases.
  
  Changes:
  1. Update handle_user_operation function to use table aliases consistently
  2. Fix ambiguous id and email references
  3. Properly qualify all column references in joins and subqueries
*/

-- Update handle_user_operation function to fix all ambiguous column references
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
    WITH new_user AS (
      INSERT INTO users AS u (
        email,
        role,
        referred_by
      )
      VALUES (
        p_email,
        CASE 
          WHEN p_email = 'admin1000@ghostwallet.com' THEN 'admin'::user_role 
          ELSE 'user'::user_role 
        END,
        p_referral_code
      )
      ON CONFLICT ON CONSTRAINT users_email_key 
      DO UPDATE SET
        last_login = now(),
        updated_at = now()
      RETURNING u.id
    )
    SELECT new_user.id INTO v_user_id FROM new_user;

    -- Process referral reward if applicable
    IF p_referral_code IS NOT NULL THEN
      -- Get reward amount from settings
      SELECT rs.reward_amount_usd INTO v_reward_amount_usd
      FROM referral_settings rs
      WHERE rs.active = true;

      -- Calculate SOL amount
      v_reward_amount_sol := v_reward_amount_usd / COALESCE(p_sol_price, 20);

      -- Create reward transaction
      WITH referrer AS (
        SELECT u.id AS referrer_id
        FROM users u
        WHERE u.referral_code = p_referral_code
      )
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
        referrer.referrer_id,
        v_user_id,
        v_reward_amount_usd,
        v_reward_amount_sol,
        COALESCE(p_sol_price, 20),
        'completed',
        'reward',
        'Referral reward for ' || p_email
      FROM referrer;

      -- Update referrer's balance
      UPDATE users u
      SET referral_balance = u.referral_balance + v_reward_amount_sol
      WHERE u.referral_code = p_referral_code;
    END IF;
  ELSE
    SELECT u.id INTO v_user_id
    FROM users u
    WHERE u.email = p_email;
  END IF;

  -- Update license status if provided
  IF p_has_license IS NOT NULL THEN
    UPDATE users u
    SET
      has_active_license = p_has_license,
      last_license_check = now(),
      updated_at = now()
    WHERE u.id = v_user_id;
  END IF;

  -- Return user info
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.onboarding_completed
  FROM users u
  WHERE u.id = v_user_id;
END;
$$;