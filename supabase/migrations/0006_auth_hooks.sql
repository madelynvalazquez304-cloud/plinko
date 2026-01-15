-- 0006_auth_hooks.sql
-- Automate Profile Creation via Trigger
-- This ensures that every new user in auth.users gets a corresponding row in public.profiles

-- 1. Create the function that will run on new user signups
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    username, 
    display_name,
    balance,
    demo_balance,
    is_demo,
    role
  )
  values (
    new.id, 
    new.email, 
    split_part(new.email, '@', 1), -- Default username from email
    split_part(new.email, '@', 1), -- Default display name
    0,      -- Initial Real Balance
    100000, -- Initial Demo Balance
    false,
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger
-- Drop if exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Security Note:
-- The function is 'security definer', meaning it runs with the privileges of the creator (superuser/admin),
-- bypassing RLS. This is necessary because the new user might not have permission to INSERT into profiles
-- directly if we lock down the policies tight. 
-- Now we can optionally REMOVE "INSERT" policy for public users on profiles if we want strict security.
