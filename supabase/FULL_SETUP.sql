-- =============================================================
-- Aesthete E-Commerce – Complete Database Setup Script
-- =============================================================
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor → New Query → Run
-- It is idempotent (safe to run multiple times – uses IF NOT EXISTS / CREATE OR REPLACE).
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- SECTION 1: TABLES
-- ─────────────────────────────────────────────────────────────

-- Profiles (one per auth user, auto-created by trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       text,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamp with time zone DEFAULT now(),
  updated_at  timestamp with time zone DEFAULT now()
);

-- Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id             uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type           text NOT NULL CHECK (type IN ('billing', 'shipping', 'both')),
  full_name      text NOT NULL,
  street_address text NOT NULL,
  city           text NOT NULL,
  state          text NOT NULL,
  postal_code    text NOT NULL,
  country        text NOT NULL DEFAULT 'India',
  phone          text,
  is_default     boolean DEFAULT false,
  created_at     timestamp with time zone DEFAULT now(),
  updated_at     timestamp with time zone DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id               uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_number     text NOT NULL UNIQUE,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  total_amount     decimal(10,2) NOT NULL,
  shipping_amount  decimal(10,2) DEFAULT 0,
  tax_amount       decimal(10,2) DEFAULT 0,
  discount_amount  decimal(10,2) DEFAULT 0,
  billing_address  jsonb NOT NULL,
  shipping_address jsonb NOT NULL,
  payment_status   text NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method   text,
  notes            text,
  created_at       timestamp with time zone DEFAULT now(),
  updated_at       timestamp with time zone DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    text NOT NULL,
  product_name  text NOT NULL,
  product_image text,
  quantity      integer NOT NULL CHECK (quantity > 0),
  unit_price    decimal(10,2) NOT NULL,
  total_price   decimal(10,2) NOT NULL,
  created_at    timestamp with time zone DEFAULT now()
);

-- Product Reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id                   uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id           text NOT NULL,
  rating               integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title                text,
  comment              text,
  is_verified_purchase boolean DEFAULT false,
  helpful_count        integer DEFAULT 0,
  created_at           timestamp with time zone DEFAULT now(),
  updated_at           timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id         uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);


-- ─────────────────────────────────────────────────────────────
-- SECTION 2: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist       ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- SECTION 3: RLS POLICIES
-- Drop before recreating so the script is safely re-runnable.
-- ─────────────────────────────────────────────────────────────

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Needed so product reviews can JOIN profiles to get the author name
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT TO authenticated, anon USING (true);

-- addresses
DROP POLICY IF EXISTS "Users can view their own addresses"   ON public.addresses;
DROP POLICY IF EXISTS "Users can create their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;

CREATE POLICY "Users can view their own addresses"   ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- orders
DROP POLICY IF EXISTS "Users can view their own orders"   ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- order_items
DROP POLICY IF EXISTS "Users can view their own order items"   ON public.order_items;
DROP POLICY IF EXISTS "Users can create their own order items" ON public.order_items;

CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- product_reviews
DROP POLICY IF EXISTS "Anyone can view product reviews"       ON public.product_reviews;
DROP POLICY IF EXISTS "Users can create their own reviews"    ON public.product_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews"    ON public.product_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews"    ON public.product_reviews;

CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can create their own reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- wishlist
DROP POLICY IF EXISTS "Users can view their own wishlist"        ON public.wishlist;
DROP POLICY IF EXISTS "Users can add to their own wishlist"      ON public.wishlist;
DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON public.wishlist;

CREATE POLICY "Users can view their own wishlist"        ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own wishlist"      ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from their own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- SECTION 4: FUNCTIONS
-- ─────────────────────────────────────────────────────────────

-- Auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;  -- safe if profile already exists
  RETURN new;
END;
$$;

-- Sequence-based order number generator (collision-safe)
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

-- Auto-update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- SECTION 5: TRIGGERS
-- ─────────────────────────────────────────────────────────────

-- Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at       ON public.profiles;
DROP TRIGGER IF EXISTS update_addresses_updated_at      ON public.addresses;
DROP TRIGGER IF EXISTS update_orders_updated_at         ON public.orders;
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON public.product_reviews;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
-- SECTION 6: INDEXES
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_addresses_user_id          ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id             ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status              ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number        ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id       ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id    ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id           ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id        ON public.wishlist(product_id);


-- ─────────────────────────────────────────────────────────────
-- Done! All tables, policies, functions, triggers, and indexes
-- are now in place for the Aesthete e-commerce app.
-- ─────────────────────────────────────────────────────────────
