/*
  # Populate Authentication Tables
  
  1. Products
    - Add all available license products
    - Each product represents a different access level or feature
    
  2. Initial Admin User
    - Create admin user for system management
    - Set proper role and permissions
*/

-- Populate products table with all available licenses
INSERT INTO products (product_code, product_name) VALUES
  ('PPPBC229', 'Basic Plan'),                    -- Solana only
  ('PPPBC293', 'Black Plan'),                    -- Solana + Bitcoin + Ethereum
  ('PPPBC295', 'Diamond Plan'),                  -- All blockchains
  ('PPPBAHKJ', 'Turbo Feature'),                 -- Turbo mining feature
  ('PPPBC2F9', 'Bitcoin Individual'),            -- Bitcoin access
  ('PPPBC2FD', 'BSC Individual'),                -- BSC access
  ('PPPBC2FF', 'Cardano Individual'),            -- Cardano access  
  ('PPPBC2FC', 'Ethereum Individual'),           -- Ethereum access
  ('PPPBC2FH', 'Polkadot Individual')           -- Polkadot access
ON CONFLICT (product_code) DO UPDATE 
SET 
  product_name = EXCLUDED.product_name,
  updated_at = now();

-- Create initial admin user if it doesn't exist
INSERT INTO users (
  email,
  name,
  role,
  has_active_license,
  onboarding_completed,
  referral_code
) VALUES (
  'admin1000@ghostwallet.com',
  'Admin',
  'admin',
  true,
  true,
  'GW1000ADMIN'
)
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'admin',
  has_active_license = true,
  onboarding_completed = true,
  updated_at = now();

-- Give admin user access to all products
INSERT INTO licenses (user_id, product_id, license_status)
SELECT 
  u.id,
  p.id,
  'active'
FROM users u
CROSS JOIN products p
WHERE u.email = 'admin1000@ghostwallet.com'
ON CONFLICT (user_id, product_id) DO UPDATE 
SET 
  license_status = 'active',
  updated_at = now();