-- ─────────────────────────────────────────────────────────────
-- Aesthete – Patch: Fix order creation failures
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

-- 1. Backfill profiles for ANY existing auth users who don't have one.
--    (The trigger only fires on NEW signups; pre-existing users are missed.)
INSERT INTO public.profiles (id, email, full_name)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 2. Grant EXECUTE on the order number function to authenticated users.
--    Without this, the RPC call is blocked by Postgres permissions.
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon;
GRANT USAGE ON SEQUENCE public.order_number_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.order_number_seq TO anon;

-- 3. Grant EXECUTE on the updated_at helper (needed by triggers)
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;

-- Verify: check your profile was created (should return 1 row per signed-up user)
SELECT id, email, full_name FROM public.profiles;
