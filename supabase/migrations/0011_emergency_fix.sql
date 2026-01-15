-- 0011_emergency_fix.sql
-- EMERGENCY FIX: Remove recursive RLS policies causing 500 errors

-- STEP 1: Temporarily DISABLE RLS to fix the immediate issue
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Set user as admin directly
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'duncanprono47@gmail.com';

-- STEP 3: Drop ALL problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own metadata" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile data" ON profiles;

-- STEP 4: Create SIMPLE, NON-RECURSIVE policies
CREATE POLICY "allow_select_own_profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "allow_update_own_profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- STEP 5: Re-enable RLS with safe policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 6: Verify admin status
SELECT id, email, username, role, phone, balance, demo_balance
FROM profiles
WHERE email = 'duncanprono47@gmail.com';
