/*
  # Initial Database Structure
  
  1. Types
    - user_role: Enum for user roles
    - transaction_status: Transaction states
    - transaction_type: Transaction types
    
  2. Core Tables (in dependency order)
    - users: Base user table
    - products: Available products/licenses
    - licenses: User license assignments
    - referral_transactions: Referral tracking
    - referral_settings: System settings
    - referral_levels: Program tiers
    - sol_price_feed: Price tracking
    
  3. Security
    - RLS policies
    - Constraints
    - Indexes
*/

-- Create required types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('reward', 'reversal', 'withdrawal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create users table (base table with no dependencies)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  role user_role NOT NULL DEFAULT 'user',
  has_active_license boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  referral_code text UNIQUE,
  referral_balance numeric DEFAULT 0 CHECK (referral_balance >= 0),
  referred_by text,
  last_login timestamptz,
  last_license_check timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table (independent)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code text UNIQUE NOT NULL,
  product_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create licenses table (depends on users and products)
CREATE TABLE IF NOT EXISTS licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  license_status text NOT NULL CHECK (license_status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- Create referral transactions table (depends on users)
CREATE TABLE IF NOT EXISTS referral_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL,
  amount_sol numeric NOT NULL,
  sol_price numeric NOT NULL CHECK (sol_price > 0),
  status transaction_status NOT NULL DEFAULT 'pending',
  description text,
  transaction_type transaction_type NOT NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_transaction_amounts CHECK (
    CASE 
      WHEN transaction_type = 'reversal' THEN 
        amount_usd < 0 AND amount_sol < 0
      ELSE 
        amount_usd > 0 AND amount_sol > 0
    END
  )
);

-- Create referral settings table (independent)
CREATE TABLE IF NOT EXISTS referral_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_amount_usd numeric NOT NULL CHECK (reward_amount_usd > 0),
  min_withdrawal_usd numeric NOT NULL CHECK (min_withdrawal_usd > 0),
  active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral levels table (independent)
CREATE TABLE IF NOT EXISTS referral_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  required_referrals integer NOT NULL CHECK (required_referrals >= 0),
  required_earnings numeric NOT NULL CHECK (required_earnings >= 0),
  bonus_percentage numeric NOT NULL CHECK (bonus_percentage >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create sol price feed table (independent)
CREATE TABLE IF NOT EXISTS sol_price_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price numeric NOT NULL CHECK (price > 0),
  source text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(license_status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON referral_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON referral_transactions(status);
CREATE INDEX IF NOT EXISTS idx_sol_price_timestamp ON sol_price_feed(timestamp DESC);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE sol_price_feed ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own transactions"
  ON referral_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view settings"
  ON referral_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view levels"
  ON referral_levels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view price feed"
  ON sol_price_feed FOR SELECT
  TO public
  USING (true);

-- Insert default referral settings
INSERT INTO referral_settings (reward_amount_usd, min_withdrawal_usd, active)
VALUES (10.00, 5.00, true)
ON CONFLICT DO NOTHING;

-- Insert default referral levels
INSERT INTO referral_levels (name, color, required_referrals, required_earnings, bonus_percentage)
VALUES 
  ('Bronze', '#CD7F32', 0, 0, 0),
  ('Silver', '#C0C0C0', 5, 50, 5),
  ('Gold', '#FFD700', 10, 100, 10),
  ('Diamond', '#B9F2FF', 20, 200, 15)
ON CONFLICT DO NOTHING;

-- Insert initial SOL price
INSERT INTO sol_price_feed (price, source)
VALUES (20.00, 'default')
ON CONFLICT DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE users IS 'Core user data and profile information';
COMMENT ON TABLE products IS 'Available products and licenses';
COMMENT ON TABLE licenses IS 'User license assignments and status';
COMMENT ON TABLE referral_transactions IS 'Referral earnings and withdrawals';
COMMENT ON TABLE referral_settings IS 'System-wide referral program settings';
COMMENT ON TABLE referral_levels IS 'Referral program levels and bonuses';
COMMENT ON TABLE sol_price_feed IS 'SOL price tracking for calculations';