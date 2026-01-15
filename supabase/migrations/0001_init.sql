-- 0001_init.sql
-- Initial migration: profiles table (includes balances and personal info)

-- Ensure pgcrypto for gen_random_uuid (supported in many Postgres versions)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text,
  display_name text,
  phone text,
  avatar_url text,
  metadata jsonb,
  balance numeric DEFAULT 0,
  demo_balance numeric DEFAULT 0,
  is_demo boolean DEFAULT false,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);

-- Optionally insert a sample profile (remove in production)
-- INSERT INTO profiles (email, username, display_name, balance, demo_balance)
-- VALUES ('player@example.com', 'player1', 'Player One', 1500, 100000);
