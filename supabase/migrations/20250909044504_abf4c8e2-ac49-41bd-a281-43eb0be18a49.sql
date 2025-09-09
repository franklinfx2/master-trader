-- Fix the handle_new_user function to remove SECURITY DEFINER
-- This function is used to automatically create profile records when users sign up

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate without SECURITY DEFINER (uses SECURITY INVOKER by default)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();