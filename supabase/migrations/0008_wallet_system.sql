-- 0008_wallet_system.sql
-- Create wallet transactions and RPC functions for deposits/withdrawals

-- 1. Add wallet transaction fields if needed (already exist in transactions table)
-- We'll use the existing transactions table

-- 2. Create RPC function for incrementing balance (used in deposits/withdrawals)
CREATE OR REPLACE FUNCTION increment_balance(user_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET balance = balance + amount
  WHERE id = user_id;
END;
$$;

-- 3. Create RPC function for demo balance increment
CREATE OR REPLACE FUNCTION increment_demo_balance(user_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET demo_balance = demo_balance + amount
  WHERE id = user_id;
END;
$$;

-- 4. Create a function to handle withdrawal requests
CREATE OR REPLACE FUNCTION create_withdrawal(
  p_user_id uuid,
  p_amount numeric,
  p_method text DEFAULT 'M-PESA'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
  v_current_balance numeric;
BEGIN
  -- Check if user has sufficient balance
  SELECT balance INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Deduct from balance immediately (pending withdrawal)
  UPDATE profiles
  SET balance = balance - p_amount
  WHERE id = p_user_id;
  
  -- Create withdrawal transaction
  INSERT INTO transactions (user_id, user_email, type, amount, status, method)
  VALUES (
    p_user_id,
    (SELECT email FROM profiles WHERE id = p_user_id),
    'withdrawal',
    p_amount,
    'pending',
    p_method
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- 5. Create a function to handle deposits
CREATE OR REPLACE FUNCTION create_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_method text DEFAULT 'M-PESA'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- Create deposit transaction (pending until confirmed)
  INSERT INTO transactions (user_id, user_email, type, amount, status, method)
  VALUES (
    p_user_id,
    (SELECT email FROM profiles WHERE id = p_user_id),
    'deposit',
    p_amount,
    'pending',
    p_method
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_demo_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION create_withdrawal(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_deposit(uuid, numeric, text) TO authenticated;
