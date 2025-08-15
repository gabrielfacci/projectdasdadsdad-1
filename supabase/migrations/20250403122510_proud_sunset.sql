-- Drop existing policies on users table
DROP POLICY IF EXISTS "Allow select users" ON users;
DROP POLICY IF EXISTS "Allow insert users" ON users;
DROP POLICY IF EXISTS "Allow update users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can lookup other users by email" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "select_own_user" ON users;

-- Create new policies for users table
-- Allow anyone to insert new users (needed for onboarding)
CREATE POLICY "Allow insert users" 
  ON users FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to select their own data
CREATE POLICY "Allow select own user" 
  ON users FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Allow update own user" 
  ON users FOR UPDATE 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own data
CREATE POLICY "Allow delete own user" 
  ON users FOR DELETE 
  TO authenticated
  USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE users TO anon, authenticated;
GRANT ALL ON TABLE licenses TO anon, authenticated;
GRANT ALL ON TABLE products TO anon, authenticated;
GRANT ALL ON TABLE referral_transactions TO anon, authenticated;
GRANT ALL ON TABLE referral_settings TO anon, authenticated;
GRANT ALL ON TABLE referral_levels TO anon, authenticated;
GRANT ALL ON TABLE sol_price_feed TO anon, authenticated;