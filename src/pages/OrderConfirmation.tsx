import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

interface LocationState {
  orderNumber?: string;
  total?: number;
}

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  // If someone navigates here directly without placing an order, send them home
  useEffect(() => {
    if (!state?.orderNumber) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state?.orderNumber) return null;

  const { orderNumber, total } = state;

  return (
    <>
      <Helmet>
        <title>Order Confirmed | Aesthete</title>
        <meta name="description" content="Your order has been placed successfully." />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-6 py-16">
            <div className="max-w-lg mx-auto text-center animate-fade-in">
              {/* Success icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-8">
                Thank you for your purchase. We've received your order and will begin
                processing it shortly.
              </p>

              {/* Order details card */}
              <div className="bg-card border border-border rounded-lg p-6 mb-8 text-left space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Order Details</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono font-medium">{orderNumber}</span>
                </div>

                {total !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-medium">₹{total.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Delivery</span>
                  <span className="font-medium">5–7 business days</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Processing
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-8">
                A confirmation has been sent to your email address. You can track your
                order status from your account dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/products">Continue Shopping</Link>
                </Button>
                <Button asChild>
                  <Link to="/login" className="flex items-center gap-2">
                    View Orders
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OrderConfirmation;
