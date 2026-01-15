-- Delete existing M-Pesa gateways to remove duplicates
DELETE FROM gateways WHERE type = 'mpesa';

-- Insert a single, clean M-Pesa gateway configuration
INSERT INTO gateways (type, name, config, is_active) VALUES 
(
  'mpesa', 
  'M-Pesa Daraja', 
  '{
    "env": "sandbox",
    "type": "paybill", 
    "shortcode": "", 
    "consumerKey": "", 
    "consumerSecret": "", 
    "passkey": "", 
    "callbackUrl": ""
  }'::jsonb, 
  true
);
