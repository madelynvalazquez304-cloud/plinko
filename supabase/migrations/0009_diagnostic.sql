-- APPLY ALL MIGRATIONS IN ORDER
-- Run this file in your Supabase SQL Editor

-- Make sure to run migrations in order:
-- 1. 0001_init.sql
-- 2. 0002_bets.sql  
-- 3. 0003_transactions.sql
-- 4. 0004_security_rls.sql
-- 5. 0005_gateways.sql
-- 6. 0006_auth_hooks.sql
-- 7. 0007_set_admin.sql  
-- 8. 0008_wallet_system.sql

-- Quick diagnostic query - run this to check your setup:
SELECT 
  'Auth Users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Profiles' as table_name,
  COUNT(*) as count  
FROM profiles
UNION ALL
SELECT
  'Your Profile' as table_name,
  COUNT(*) as count
FROM profiles
WHERE email = 'duncanprono47@gmail.com';

-- Check if you have admin role:
SELECT id, email, username, role, balance, demo_balance, is_demo
FROM profiles
WHERE email = 'duncanprono47@gmail.com';

-- If the above returns nothing or role is NOT 'admin', run this:
UPDATE profiles
SET role = 'admin'
WHERE email = 'duncanprono47@gmail.com';

-- Verify RLS is enabled:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'bets', 'transactions', 'gateways');
