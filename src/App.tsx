import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Helmet } from "react-helmet";

// Core pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Auth pages
import ForgotPassword from "./pages/ForgotPassword";

// Account & commerce
import Account from "./pages/Account";
import WishlistPage from "./pages/Wishlist";
import OrderConfirmation from "./pages/OrderConfirmation";
import SearchPage from "./pages/Search";

// Company pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Sustainability from "./pages/Sustainability";
import Press from "./pages/Press";

// Customer service pages
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Warranty from "./pages/Warranty";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Helmet>
            <title>Aesthete | Minimalist Home &amp; Lifestyle</title>
            <meta
              name="description"
              content="Curated minimalist products for modern living. Discover pieces that inspire and endure."
            />
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ── Main ── */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/search" element={<SearchPage />} />

              {/* ── Auth ── */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ── Account ── */}
              <Route path="/account" element={<Account />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />

              {/* ── Company ── */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/press" element={<Press />} />

              {/* ── Customer Service ── */}
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/warranty" element={<Warranty />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
