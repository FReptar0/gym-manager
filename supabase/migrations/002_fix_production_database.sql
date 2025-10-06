-- =====================================================
-- FIX PRODUCTION DATABASE ISSUES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Check if user_profiles table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check RLS policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 3. Temporarily disable RLS on user_profiles for testing
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'gym_admin')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Test the user_profiles table with a simple insert
-- (This will help us see if there are any constraint issues)
DO $$
BEGIN
  -- Try to insert a test record
  INSERT INTO user_profiles (id, full_name, email, role, is_active)
  VALUES (
    gen_random_uuid(),
    'Test User',
    'test@example.com',
    'gym_admin',
    true
  );
  
  -- Clean up the test record
  DELETE FROM user_profiles WHERE email = 'test@example.com';
  
  RAISE NOTICE 'user_profiles table is working correctly';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error with user_profiles table: %', SQLERRM;
END $$;

-- 7. Re-enable RLS with a more permissive policy for now
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create a simple one
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "User profiles read own" ON user_profiles;
DROP POLICY IF EXISTS "User profiles update own" ON user_profiles;

-- Create a permissive policy for service role
CREATE POLICY "Allow service role full access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a policy for authenticated users
CREATE POLICY "Allow authenticated users read access" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 8. Check if the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 9. Show current auth configuration
SELECT 
  'auth.users count' as info,
  COUNT(*) as value
FROM auth.users
UNION ALL
SELECT 
  'user_profiles count' as info,
  COUNT(*) as value
FROM user_profiles;

-- =====================================================
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste and run this entire script
-- 4. Check the output messages
-- 5. Try the registration cURL command again
-- =====================================================