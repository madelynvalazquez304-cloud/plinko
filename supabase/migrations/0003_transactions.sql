-- 0003_transactions.sql
-- Stores deposit/withdrawal transactions

CREATE TABLE
IF NOT EXISTS transactions
(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid
(),
  user_id uuid,
  user_email text,
  type text,
  amount numeric NOT NULL,
  status text,
  method text,
  metadata jsonb,
  created_at timestamptz DEFAULT now
()
);

CREATE INDEX
IF NOT EXISTS transactions_user_email_idx ON transactions
(user_email);
