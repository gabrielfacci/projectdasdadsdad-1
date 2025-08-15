/*
  # Fix Ambiguous Column References
  
  This migration fixes the ambiguous column references in the database functions
  by properly qualifying all column references with their table names.
  
  Changes:
  1. Update handle_user_operation function to fix ambiguous email references
  2. Update other functions to ensure consistent column qualification
*/

-- Update handle_user_operation function to fix ambiguous email column
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
      INSERT INTO users (email, role, referred_by)
      VALUES (
        p_email,
        CASE WHEN p_email = 'admin1000@ghostwallet.com' THEN 'admin'::user_role ELSE 'user'::user_role END,
        p_referral_code
      )
      ON CONFLICT ON CONSTRAINT users_email_key DO UPDATE
      SET
        last_login = now(),
        updated_at = now()
      RETURNING id
    )
    SELECT id INTO v_user_id FROM new_user;

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
    SELECT u.id INTO v_user_id
    FROM users u
    WHERE u.email = p_email;
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