-- 0007_set_admin.sql
-- Set specific user as admin

-- Update the user to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'duncanprono47@gmail.com';

-- If the profile doesn't exist yet (user hasn't signed up), 
-- this won't do anything. You can run this migration again after signup.
