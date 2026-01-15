-- 0012_mpesa_integration.sql
-- M-Pesa Daraja API Integration Setup

-- 1. Create M-Pesa credentials table (encrypted storage)
CREATE TABLE IF NOT EXISTS mpesa_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_short_code text NOT NULL,
  consumer_key text NOT NULL,
  consumer_secret text NOT NULL,
  passkey text NOT NULL,
  callback_url text NOT NULL,
  environment text NOT NULL DEFAULT 'sandbox', -- 'sandbox' or 'production'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create M-Pesa transactions tracking table
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  merchant_request_id text,
  checkout_request_id text UNIQUE,
  phone_number text NOT NULL,
  amount numeric NOT NULL,
  account_reference text,
  transaction_desc text,
  mpesa_receipt_number text,
  result_code integer,
  result_desc text,
  status text DEFAULT 'pending', -- 'pending', 'success', 'failed', 'cancelled'
  transaction_id uuid REFERENCES transactions(id),
  callback_data jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 3. Enable RLS on M-Pesa tables
ALTER TABLE mpesa_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for M-Pesa credentials (admin only)
CREATE POLICY "Only admins can view mpesa credentials"
ON mpesa_credentials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can manage mpesa credentials"
ON mpesa_credentials FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles  
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. RLS Policies for M-Pesa transactions
CREATE POLICY "Users can view own mpesa transactions"
ON mpesa_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all mpesa transactions"
ON mpesa_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Create function to log M-Pesa callback
CREATE OR REPLACE FUNCTION log_mpesa_callback(
  p_checkout_request_id text,
  p_merchant_request_id text,
  p_result_code integer,
  p_result_desc text,
  p_mpesa_receipt_number text DEFAULT NULL,
  p_callback_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mpesa_tx_id uuid;
  v_user_id uuid;
  v_amount numeric;
  v_transaction_id uuid;
BEGIN
  -- Update M-Pesa transaction record
  UPDATE mpesa_transactions
  SET 
    merchant_request_id = p_merchant_request_id,
    result_code = p_result_code,
    result_desc = p_result_desc,
    mpesa_receipt_number = p_mpesa_receipt_number,
    callback_data = p_callback_data,
    status = CASE 
      WHEN p_result_code = 0 THEN 'success'
      WHEN p_result_code = 1032 THEN 'cancelled'
      ELSE 'failed'
    END,
    completed_at = now()
  WHERE checkout_request_id = p_checkout_request_id
  RETURNING id, user_id, amount, transaction_id INTO v_mpesa_tx_id, v_user_id, v_amount, v_transaction_id;

  -- If payment successful, update main transaction and credit user
  IF p_result_code = 0 AND v_mpesa_tx_id IS NOT NULL THEN
    -- Update transaction status
    UPDATE transactions
    SET status = 'completed'
    WHERE id = v_transaction_id;

    -- Credit user balance
    UPDATE profiles
    SET balance = balance + v_amount
    WHERE id = v_user_id;
  ELSIF p_result_code != 0 AND v_transaction_id IS NOT NULL THEN
    -- Mark transaction as failed
    UPDATE transactions
    SET status = 'failed'
    WHERE id = v_transaction_id;
  END IF;
END;
$$;

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE ON mpesa_credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE ON mpesa_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION log_mpesa_callback TO anon, authenticated;

-- 8. Create indexes for performance
CREATE INDEX idx_mpesa_transactions_checkout_request ON mpesa_transactions(checkout_request_id);
CREATE INDEX idx_mpesa_transactions_user_id ON mpesa_transactions(user_id);
CREATE INDEX idx_mpesa_transactions_status ON mpesa_transactions(status);
