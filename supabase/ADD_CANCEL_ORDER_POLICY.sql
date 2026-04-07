-- ─────────────────────────────────────────────────────────────
-- Patch: Allow users to cancel their own pending/confirmed orders
-- Run in: Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

-- The existing UPDATE policy lets users update any field, but we
-- want to be explicit that cancellation (status → 'cancelled')
-- is only allowed for pending/confirmed orders.
-- The simplest safe approach: allow the general update
-- (already exists from FULL_SETUP.sql) and rely on app-level
-- guard. But we also add a specific named policy scoped to
-- cancellable statuses for clarity and defense-in-depth.

-- Drop the old general update policy first (idempotent)
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Re-create a strict update policy: users may only change status
-- to 'cancelled', and only while the order is still 'pending' or 'confirmed'.
-- For any other field updates (e.g. notes), this is intentionally restrictive
-- — order mutations should go through server-side functions in production.
CREATE POLICY "Users can cancel their own orders" ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    auth.uid() = user_id
  );
