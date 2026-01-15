-- Update M-Pesa credentials table structure
-- Run this to ensure proper field names

ALTER TABLE mpesa_credentials 
  ADD COLUMN IF NOT EXISTS business_short_code text,
  ADD COLUMN IF NOT EXISTS consumer_key text,
  ADD COLUMN IF NOT EXISTS consumer_secret text;

-- Update existing data to use new column names if you have old data
UPDATE mpesa_credentials
SET 
  business_short_code = COALESCE(business_short_code, ''),
  consumer_key = COALESCE(consumer_key, ''),
  consumer_secret = COALESCE(consumer_secret, '')
WHERE id IS NOT NULL;

-- Verify table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mpesa_credentials';
