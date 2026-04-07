-- Migration: Fix RLS policies and upgrade order number generation
-- Applied: 2026-04-07

-- ─────────────────────────────────────────────────────────────────
-- 1. Fix product_reviews SELECT policy
--    Add explicit USING (true) so the policy is clearly intentional.
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view product reviews" ON public.product_reviews;

CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
  FOR SELECT TO authenticated, anon
  USING (true);

-- ─────────────────────────────────────────────────────────────────
-- 2. Upgrade generate_order_number to use a sequence
--    The original used random()*10000 which can collide on busy stores.
--    A sequence guarantees uniqueness without retries.
-- ─────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq
  START WITH 1000
  INCREMENT BY 1
  NO CYCLE;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  seq_val bigint;
BEGIN
  seq_val := nextval('public.order_number_seq');
  RETURN 'AES-' || to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD') || '-' || LPAD(seq_val::text, 5, '0');
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- 3. Add missing index on orders.order_number for fast lookups
-- ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ─────────────────────────────────────────────────────────────────
-- 4. Ensure profiles are public-readable for review author names
--    (needed for the profiles join in product_reviews queries)
-- ─────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
        FOR SELECT TO authenticated, anon
        USING (true);
    $policy$;
  END IF;
END;
$$;
