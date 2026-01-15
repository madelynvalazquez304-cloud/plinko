-- 0005_gateways.sql

CREATE TABLE IF NOT EXISTS gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'mpesa', 'crypto'
  name text, -- 'M-Pesa', 'Bitcoin', 'Ethereum'
  config jsonb, -- Stores keys, addresses, secrets (encrypted in real app, here plaintext for demo)
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gateways ENABLE ROW LEVEL SECURITY;

-- Only Admins can view/edit gateways
CREATE POLICY "Admins can view gateways" ON gateways
  FOR SELECT USING (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update gateways" ON gateways
  FOR ALL USING (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Insert default rows
INSERT INTO gateways (type, name, config) VALUES 
('mpesa', 'M-Pesa', '{"shortcode": "174379", "consumerKey": "", "consumerSecret": "", "passkey": "", "env": "sandbox"}'::jsonb),
('crypto', 'Bitcoin', '{"address": "bc1...", "network": "BTC"}'::jsonb),
('crypto', 'USDT', '{"address": "0x...", "network": "ERC20"}'::jsonb);
