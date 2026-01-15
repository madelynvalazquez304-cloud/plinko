-- Quick Fix: Insert M-Pesa Gateway Configuration
-- Run this in Supabase SQL Editor

-- First, check if gateways table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public'
  AND table_name = 'gateways'
);

-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gateways ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view/manage gateways
DROP POLICY IF EXISTS "Admins can manage gateways" ON gateways;
CREATE POLICY "Admins can manage gateways"
ON gateways FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Delete any existing gateways first
DELETE FROM gateways;

-- Insert M-Pesa gateway configuration
INSERT INTO gateways (name, type, config, is_active) VALUES
(
  'M-Pesa', 
  'mobile_money',
  jsonb_build_object(
    'provider', 'Safaricom',
    'country', 'Kenya',
    'currency', 'KES',
    'min_amount', 10,
    'max_amount', 150000,
    'business_shortcode', 'YOUR_SHORTCODE',
    'consumer_key', 'YOUR_CONSUMER_KEY',
    'consumer_secret', 'YOUR_CONSUMER_SECRET',
    'passkey', 'YOUR_PASSKEY',
    'callback_url', 'https://your-project.supabase.co/functions/v1/mpesa-callback',
    'environment', 'sandbox'
  ),
  true
),
(
  'Crypto (USDT)',
  'cryptocurrency', 
  jsonb_build_object(
    'networks', jsonb_build_array('TRC20', 'ERC20', 'BEP20'),
    'wallet_address', 'YOUR_WALLET_ADDRESS',
    'min_amount', 10,
    'confirmations_required', 3
  ),
  true
);

-- Verify insertion
SELECT id, name, type, is_active, created_at 
FROM gateways;
