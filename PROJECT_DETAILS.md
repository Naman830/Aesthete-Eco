# Aesthete E-Commerce Project Details

## Project Summary

This project is a React + TypeScript e-commerce website for a minimalist home and lifestyle brand named **Aesthete**. It uses Vite for development/build tooling, Tailwind CSS and shadcn/Radix UI components for styling, React Router for page routing, Supabase for authentication and persisted user commerce data, and localStorage for the shopping cart.

The product catalog itself is currently generated on the frontend from `src/lib/data.ts`; it is not stored in Supabase. Supabase is used for user accounts, profiles, wishlist entries, reviews, orders, and order items.

## Technology Stack

- **Frontend framework:** React 18 with TypeScript
- **Build tool:** Vite
- **Routing:** `react-router-dom`
- **Styling:** Tailwind CSS with custom CSS variables in `src/index.css`
- **UI components:** shadcn-style components built on Radix UI primitives
- **Icons:** `lucide-react`
- **Forms:** React state plus some dependencies for React Hook Form/Zod available
- **Data fetching/cache:** `@tanstack/react-query` is configured globally, though most current Supabase hooks use local state
- **Backend service:** Supabase Auth, Postgres, RLS policies, SQL migrations
- **SEO metadata:** `react-helmet`
- **Notifications:** shadcn toast and Sonner toaster

## Root-Level Structure

```text
.
|-- .env
|-- .env.example
|-- components.json
|-- dist/
|-- eslint.config.js
|-- index.html
|-- node_modules/
|-- package-lock.json
|-- package.json
|-- postcss.config.js
|-- public/
|-- README.md
|-- src/
|-- supabase/
|-- tailwind.config.ts
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
`-- vite.config.ts
```

### Important Root Files

- `package.json`: npm scripts and dependencies.
- `vite.config.ts`: Vite configuration for React/SWC and path aliases.
- `tailwind.config.ts`: Tailwind content paths, theme tokens, animations, and plugin configuration.
- `components.json`: shadcn component configuration.
- `.env.example`: template for required Supabase environment variables.
- `.env`: local environment values. This should not be committed.
- `dist/`: production build output.
- `supabase/`: SQL setup scripts, migrations, and Supabase local config.

## NPM Scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run lint
npm run preview
```

- `dev`: starts the Vite development server.
- `build`: builds the production app.
- `build:dev`: builds using development mode.
- `lint`: runs ESLint over the project.
- `preview`: serves the built app locally.

## Source Folder Structure

```text
src/
|-- App.css
|-- App.tsx
|-- components/
|   |-- layout/
|   |-- sections/
|   `-- ui/
|-- context/
|-- hooks/
|-- index.css
|-- integrations/
|   `-- supabase/
|-- lib/
|-- main.tsx
|-- pages/
`-- vite-env.d.ts
```

## Application Entry Flow

### `src/main.tsx`

This is the browser entry point. It creates the React root and renders `App`.

### `src/App.tsx`

This is the main app shell. It wraps all routes in global providers:

- `QueryClientProvider` for TanStack Query.
- `TooltipProvider` for tooltip support.
- `AuthProvider` for Supabase auth state and auth actions.
- `CartProvider` for cart state stored in localStorage.
- `Toaster` and `Sonner` for notifications.
- `BrowserRouter` for client-side routing.
- `Helmet` for default metadata.

## Route Map

Routes are defined in `src/App.tsx`.

| Path | Page Component | Purpose |
| --- | --- | --- |
| `/` | `Index` | Home page with hero, featured products, category blocks, philosophy, newsletter |
| `/products` | `Products` | Product listing, search, category filter, price filter |
| `/products/:id` | `ProductDetail` | Product details, quantity selector, add to cart, related products |
| `/cart` | `Cart` | Cart review and quantity management |
| `/checkout` | `Checkout` | Multi-step checkout flow |
| `/search` | `SearchPage` | Search results based on query parameter `q` |
| `/login` | `Login` | Sign in and create account |
| `/forgot-password` | `ForgotPassword` | Password reset request |
| `/account` | `Account` | Account dashboard, orders, profile update |
| `/wishlist` | `WishlistPage` | User saved wishlist items |
| `/order-confirmation` | `OrderConfirmation` | Confirmation screen after checkout |
| `/about` | `About` | Company/about content |
| `/contact` | `Contact` | Contact page |
| `/careers` | `Careers` | Careers page |
| `/sustainability` | `Sustainability` | Sustainability page |
| `/press` | `Press` | Press page |
| `/faq` | `FAQ` | Customer FAQ |
| `/shipping` | `Shipping` | Shipping and returns information |
| `/warranty` | `Warranty` | Warranty information |
| `/privacy` | `Privacy` | Privacy policy |
| `/terms` | `Terms` | Terms and conditions |
| `*` | `NotFound` | Fallback 404 page |

## Layout Components

### `src/components/layout/Navbar.tsx`

The navbar is fixed at the top and includes:

- Brand link to `/`.
- Desktop navigation links for Home, Shop, About, Contact.
- Search overlay that routes to `/search?q=...`.
- Wishlist link, gated to `/login` when unauthenticated.
- Cart icon with cart count badge.
- Authenticated user dropdown with Account, Orders, Wishlist, and Sign Out.
- Mobile menu with the same core navigation and account actions.

### `src/components/layout/Footer.tsx`

The footer contains:

- Brand summary and social icon links.
- Shop links by category.
- Company links.
- Customer service links.
- Copyright and policy links.

## Home Page Structure

### `src/pages/Index.tsx`

The home page uses:

- `Navbar`
- `Hero`
- `FeaturedProducts`
- Category section for Lighting, Kitchen, and Home
- Design philosophy section
- Newsletter signup UI
- `Footer`

### `src/components/sections/Hero.tsx`

Hero is a full-viewport visual section with:

- Background image from Unsplash.
- Dark gradient overlays.
- Animated headline and supporting text.
- CTA buttons to `/products` and `/about`.
- Trust statistics.

### `src/components/sections/FeaturedProducts.tsx`

This section reads featured items from `getFeaturedProducts()` in `src/lib/data.ts` and renders them with `ProductCard`.

## Product System

### `src/lib/data.ts`

This file defines:

- `Product` interface.
- `CartItem` interface.
- A generated product catalog of around 100 products.
- Product categories:
  - All Products
  - Lighting
  - Kitchen
  - Home
  - Office
  - Bedroom
- Helper functions:
  - `getProductById(id)`
  - `getFeaturedProducts()`
  - `getProductsByCategory(category)`

Product data includes id, name, description, price, image, category, featured flag, rating, review count, and stock. Prices are converted from approximate USD values into INR using a hardcoded conversion rate.

### `src/pages/Products.tsx`

The product listing page supports:

- Category filtering using the `category` URL query parameter.
- Search filtering by product name and description.
- Price filtering with a slider.
- Mobile filter menu.
- Loading skeletons.
- Empty results state.

### `src/pages/ProductDetail.tsx`

The product detail page supports:

- Product lookup from route param `id`.
- Loading and not-found states.
- Breadcrumb navigation.
- Product image, rating, price, description, category, and stock display.
- Quantity controls bounded by stock.
- Add to cart.
- Buy now link to checkout.
- Related products from featured products.

### `src/components/ui/ProductCard.tsx`

The product card handles:

- Image loading skeleton.
- Product badges such as featured, sold out, and low stock.
- Wishlist toggle for signed-in users.
- Quick add to cart.
- Product rating stars.
- Product price and category display.

## Cart and Checkout

### `src/context/CartContext.tsx`

Cart state is stored in React state and synchronized to `localStorage` under the key `cart`.

It exposes:

- `cart`
- `addToCart(product, quantity?)`
- `removeFromCart(productId)`
- `updateQuantity(productId, quantity)`
- `clearCart()`
- `getCartTotal()`
- `getCartCount()`

Stock limits are enforced when adding or updating quantities. Toast notifications are shown for cart actions.

### `src/components/ui/CartItem.tsx`

Reusable cart item component used in cart and checkout summaries. It can render in full or compact mode.

### `src/pages/Cart.tsx`

The cart page shows:

- Cart item list.
- Quantity controls.
- Remove item action.
- Clear cart action.
- Order summary.
- Link to checkout.
- Empty-cart state.

Note: the cart page summary currently displays dollar signs, while most other commerce pages display INR. This is a consistency issue to fix later.

### `src/pages/Checkout.tsx`

Checkout is a three-step flow:

1. Contact and shipping information.
2. Shipping method.
3. Payment method.

Checkout behavior:

- Calculates subtotal from cart.
- Applies shipping:
  - Free shipping above INR 2,000.
  - INR 99 standard shipping.
  - INR 199 express shipping.
- Applies 18% GST.
- Supports card, UPI, and cash on delivery UI.
- If signed in, creates an order in Supabase via `useOrders`.
- If not signed in, performs guest checkout without database persistence.
- Clears cart and routes to `/order-confirmation`.

Payment fields are currently UI-only; there is no real payment gateway integration.

## Authentication

### `src/context/AuthContext.tsx`

Auth state is managed through Supabase Auth.

It exposes:

- `user`
- `session`
- `loading`
- `signUp(email, password, fullName?)`
- `signIn(email, password)`
- `signOut()`
- `resetPassword(email)`

The context listens to `supabase.auth.onAuthStateChange` and treats it as the source of truth. Sign-up stores `full_name` in Supabase user metadata.

### `src/pages/Login.tsx`

The login page contains tabs for:

- Sign In
- Create Account

It validates password confirmation and minimum password length before registration.

### `src/pages/ForgotPassword.tsx`

This page uses the auth context's password reset method to send a Supabase reset email.

## Account Area

### `src/pages/Account.tsx`

The account page requires authentication and redirects unauthenticated users to `/login`.

It has three tabs:

- `overview`: total orders, delivered orders, lifetime spend, recent orders.
- `orders`: expandable order history with item details, totals, shipping address, and cancellation action.
- `profile`: profile form for full name and phone.

Orders with status `pending` or `confirmed` can be cancelled from the UI.

## Supabase Integration

### `src/integrations/supabase/client.ts`

Creates the typed Supabase client using:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If either variable is missing, the app throws a clear startup error.

### `src/integrations/supabase/types.ts`

Generated TypeScript database types for Supabase tables and functions.

## Custom Supabase Hooks

### `src/hooks/useProfile.ts`

Fetches and updates the signed-in user's profile from `profiles`.

### `src/hooks/useOrders.ts`

Handles:

- Fetching current user's orders with joined `order_items`.
- Creating orders.
- Defensive profile upsert before creating an order.
- Generating order numbers through the Supabase RPC function `generate_order_number`.
- Creating associated order item rows.

### `src/hooks/useWishlist.ts`

Handles:

- Fetching current user's wishlist.
- Adding product IDs to wishlist.
- Removing product IDs from wishlist.
- Checking whether a product is already saved.

### `src/hooks/useReviews.ts`

Handles:

- Fetching reviews for a product.
- Adding a review.
- Updating a review.
- Deleting a review.
- Finding the current user's review.
- Calculating average rating from fetched reviews.

## Supabase Database Structure

The main setup file is `supabase/FULL_SETUP.sql`. Migrations are in `supabase/migrations/`.

### Tables

- `profiles`: one row per auth user.
- `addresses`: saved billing/shipping addresses.
- `orders`: order headers and totals.
- `order_items`: line items for each order.
- `product_reviews`: user reviews by product ID.
- `wishlist`: saved product IDs per user.

### Functions

- `handle_new_user()`: creates a profile row when a Supabase auth user is created.
- `generate_order_number()`: generates order numbers.
- `update_updated_at_column()`: maintains `updated_at` timestamps.

### Triggers

- `on_auth_user_created`: runs profile creation after auth signup.
- `update_profiles_updated_at`
- `update_addresses_updated_at`
- `update_orders_updated_at`
- `update_product_reviews_updated_at`

### Row Level Security

RLS is enabled for all main tables. Policies generally restrict users to their own records, with public read access for product reviews and public profile names so reviews can show author names.

There is also `supabase/ADD_CANCEL_ORDER_POLICY.sql`, which adds a targeted order cancellation policy.

## Styling System

### `src/index.css`

Global styles define:

- Light and dark CSS variables.
- Tailwind base styles.
- Inter font import.
- Scrollbar styling.
- Glass utility classes:
  - `.glass`
  - `.glass-card`
  - `.glass-nav`
- Hover utilities:
  - `.hover-lift`
  - `.hover-scale`
- Image utilities:
  - `.img-cover`
  - `.product-image-wrapper`
- Search overlay styling.
- Status badge classes for order states.
- Custom animation utility classes.

### `tailwind.config.ts`

Extends Tailwind with:

- Theme colors mapped to CSS variables.
- Container defaults.
- Border radii from `--radius`.
- Accordion, fade, slide, scale, pulse, and float animations.
- `tailwindcss-animate` plugin.

## UI Component Folder

`src/components/ui/` contains shadcn-style reusable components. Most are generic UI primitives such as buttons, dialogs, forms, tabs, sheets, dropdowns, toast, tooltip, table, and inputs.

Project-specific UI components in the same folder:

- `ProductCard.tsx`
- `CartItem.tsx`

## Environment Variables

Required variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use `.env.example` as the template. The local `.env` file should remain private.

## Main User Flows

### Browse and Add to Cart

1. User opens `/`.
2. User goes to `/products` or a category link.
3. Products are loaded from the generated frontend catalog.
4. User adds an item from a product card or product detail page.
5. Cart context saves the item in localStorage.

### Checkout as Guest

1. User opens `/cart`.
2. User goes to `/checkout`.
3. User completes information, shipping, and payment UI steps.
4. App creates a guest order number locally.
5. Cart is cleared.
6. User is sent to `/order-confirmation`.

### Checkout as Signed-In User

1. User signs in through `/login`.
2. User adds products to cart.
3. User completes checkout.
4. `useOrders.createOrder()` upserts profile data if needed.
5. App calls Supabase RPC `generate_order_number`.
6. App inserts into `orders`.
7. App inserts into `order_items`.
8. Cart is cleared.
9. User can see the order in `/account?tab=orders`.

### Wishlist

1. Signed-in user clicks the heart icon on a product card.
2. `useWishlist` inserts the product ID into `wishlist`.
3. Duplicate wishlist entries are blocked by a database unique constraint.
4. Wishlist page reads saved IDs and maps them back to frontend product data.

### Reviews

1. `useReviews(productId)` fetches reviews for a product from Supabase.
2. Signed-in users can create, update, or delete their own review.
3. Each user can review a product only once because of the `UNIQUE(user_id, product_id)` constraint.

## Build and Development Notes

To install dependencies:

```bash
npm install
```

To run locally:

```bash
npm run dev
```

To build:

```bash
npm run build
```

To lint:

```bash
npm run lint
```

## Current Implementation Notes

- Product data is frontend-generated, not database-backed.
- Cart state is local to each browser through localStorage.
- Authenticated orders, order items, profiles, wishlist, and reviews are Supabase-backed.
- Checkout has payment UI but no real payment processor.
- Some UI text in source files appears to have encoding artifacts for symbols such as rupee signs, bullets, dashes, and emoji. This may display incorrectly unless cleaned up.
- Cart page totals use `$`, while product and checkout pages mostly use INR formatting.
- `@tanstack/react-query` is configured globally, but current custom Supabase hooks mostly use manual `useState` and `useEffect`.
- The generated product catalog uses randomization at module load, so some product names, ratings, review counts, stock, and featured selections can vary across reloads/builds.

## High-Level Architecture

```text
Browser
  |
  | React app mounted by src/main.tsx
  v
App.tsx
  |
  |-- AuthProvider -> Supabase Auth
  |-- CartProvider -> localStorage cart
  |-- QueryClientProvider
  |-- BrowserRouter
       |
       |-- Pages
            |
            |-- Product pages -> src/lib/data.ts
            |-- Cart/Checkout -> CartContext
            |-- Login/Account -> AuthContext + Supabase hooks
            |-- Wishlist/Reviews/Orders -> Supabase tables
```

## File Ownership Guide

- Change routes or global providers in `src/App.tsx`.
- Change product catalog or categories in `src/lib/data.ts`.
- Change cart behavior in `src/context/CartContext.tsx`.
- Change auth behavior in `src/context/AuthContext.tsx`.
- Change Supabase queries in `src/hooks/`.
- Change Supabase schema/RLS/functions in `supabase/FULL_SETUP.sql` and migrations.
- Change global styling tokens and utilities in `src/index.css`.
- Change Tailwind theme extensions in `tailwind.config.ts`.
- Change page-level layouts in `src/pages/`.
- Change shared layout in `src/components/layout/`.
- Change reusable product/cart cards in `src/components/ui/ProductCard.tsx` and `src/components/ui/CartItem.tsx`.

