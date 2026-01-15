-- 0002_bets.sql
-- Stores bet history for players

CREATE TABLE
IF NOT EXISTS bets
(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid
(),
  user_id uuid,
  user_email text,
  game text,
  amount numeric NOT NULL,
  multiplier numeric,
  payout numeric,
  status text,
  is_demo boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now
()
);

CREATE INDEX
IF NOT EXISTS bets_user_email_idx ON bets
(user_email);
