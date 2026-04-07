import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Helmet } from "react-helmet";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Sustainability from "./pages/Sustainability";
import Press from "./pages/Press";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Warranty from "./pages/Warranty";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import OrderConfirmation from "./pages/OrderConfirmation";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once on network failure instead of 3 times (default)
      retry: 1,
      // Consider data fresh for 30 seconds to reduce redundant refetches
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* AuthProvider must wrap everything that uses useAuth() */}
      <AuthProvider>
        <CartProvider>
          <Helmet>
            <title>Aesthete | Minimalist Home &amp; Lifestyle</title>
            <meta name="description" content="Curated minimalist products for modern living. Discover pieces that inspire and endure." />
          </Helmet>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />

              {/* Company Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/press" element={<Press />} />

              {/* Customer Service Pages */}
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
