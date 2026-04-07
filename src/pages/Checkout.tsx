import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/ui/CartItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { ArrowLeft, CreditCard, CheckCircle, Truck, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Shipping constants (INR)
const SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 99;
const TAX_RATE = 0.18; // 18% GST

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [shippingOption, setShippingOption] = useState<'standard' | 'express'>('standard');

  const subtotal = getCartTotal();
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : (shippingOption === 'express' ? 199 : SHIPPING_FEE);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;

  const [formData, setFormData] = useState({
    email: user?.email ?? '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInformationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.email || !formData.firstName || !formData.lastName ||
      !formData.address || !formData.city || !formData.state || !formData.zipCode
    ) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'credit-card') {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        toast({
          title: 'Missing payment information',
          description: 'Please fill in all payment fields.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    const shippingAddress = {
      full_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      street_address: formData.address,
      city: formData.city,
      state: formData.state,
      postal_code: formData.zipCode,
      country: 'India',
    };

    // If user is authenticated, persist the order to Supabase
    if (user) {
      const order = await createOrder({
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        billing_address: shippingAddress, // same as shipping for now
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      });

      setIsSubmitting(false);

      if (order) {
        clearCart();
        navigate('/order-confirmation', {
          state: { orderNumber: order.order_number, total },
        });
      }
    } else {
      // Guest checkout: just clear cart and confirm (no DB persistence)
      setTimeout(() => {
        setIsSubmitting(false);
        clearCart();
        toast({
          title: 'Order placed!',
          description: 'Sign in next time to track your orders.',
        });
        navigate('/order-confirmation', {
          state: { orderNumber: `GUEST-${Date.now()}`, total },
        });
      }, 1200);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-md mx-auto text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">
                Add some products to your cart before proceeding to checkout.
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const stepLabels = ['Information', 'Shipping', 'Payment'];

  return (
    <>
      <Helmet>
        <title>Checkout | Aesthete</title>
        <meta name="description" content="Complete your purchase securely." />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <Link
              to="/cart"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Main checkout form */}
              <div className="lg:col-span-3 animate-fade-in">

                {/* Step indicators */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {stepLabels.map((label, index) => {
                      const step = index + 1;
                      const isActive = currentStep >= step;
                      return (
                        <div key={label} className="flex items-center">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-2',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground'
                            )}
                          >
                            {step}
                          </div>
                          <span className={isActive ? 'font-medium' : 'text-muted-foreground'}>
                            {label}
                          </span>
                          {step < stepLabels.length && (
                            <div className="w-12 h-0.5 bg-border mx-3" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Step 1: Information ── */}
                {currentStep === 1 && (
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h2 className="text-xl font-semibold mb-6">Contact &amp; Shipping Information</h2>
                    <form onSubmit={handleInformationSubmit} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email" name="email" type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required autoComplete="email"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName" name="firstName" placeholder="John"
                            value={formData.firstName} onChange={handleInputChange}
                            required autoComplete="given-name"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName" name="lastName" placeholder="Doe"
                            value={formData.lastName} onChange={handleInputChange}
                            required autoComplete="family-name"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address" name="address"
                          placeholder="123 MG Road, Apartment 4B"
                          value={formData.address} onChange={handleInputChange}
                          required autoComplete="street-address"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city" name="city" placeholder="Mumbai"
                            value={formData.city} onChange={handleInputChange}
                            required autoComplete="address-level2"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state" name="state" placeholder="Maharashtra"
                            value={formData.state} onChange={handleInputChange}
                            required autoComplete="address-level1"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="zipCode">PIN Code</Label>
                          <Input
                            id="zipCode" name="zipCode" placeholder="400001"
                            value={formData.zipCode} onChange={handleInputChange}
                            required autoComplete="postal-code"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone" name="phone" type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone} onChange={handleInputChange}
                          autoComplete="tel"
                        />
                      </div>

                      <div className="pt-4">
                        <Button type="submit" className="w-full sm:w-auto">
                          Continue to Shipping
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Step 2: Shipping ── */}
                {currentStep === 2 && (
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h2 className="text-xl font-semibold mb-6">Shipping Method</h2>
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      <RadioGroup
                        value={shippingOption}
                        onValueChange={v => setShippingOption(v as 'standard' | 'express')}
                        className="space-y-4"
                      >
                        <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="standard" id="standard" className="mt-1" />
                          <div className="grid gap-1.5 w-full">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="standard" className="font-medium cursor-pointer">
                                Standard Shipping
                              </Label>
                              <span className="text-sm font-medium">
                                {subtotal > SHIPPING_THRESHOLD ? 'Free' : '₹99'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Truck className="h-4 w-4 mr-2" />
                              <span>5–7 business days</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="express" id="express" className="mt-1" />
                          <div className="grid gap-1.5 w-full">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="express" className="font-medium cursor-pointer">
                                Express Shipping
                              </Label>
                              <span className="text-sm font-medium">
                                {subtotal > SHIPPING_THRESHOLD ? 'Free' : '₹199'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>2–3 business days</span>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>

                      {subtotal > SHIPPING_THRESHOLD && (
                        <p className="text-sm text-green-600 font-medium">
                          🎉 You qualify for free shipping!
                        </p>
                      )}

                      <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                          Back
                        </Button>
                        <Button type="submit">Continue to Payment</Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Step 3: Payment ── */}
                {currentStep === 3 && (
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h2 className="text-xl font-semibold mb-6">Payment</h2>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="space-y-4"
                      >
                        <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="credit-card" id="credit-card" className="mt-1" />
                          <div className="grid gap-1.5 w-full">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="credit-card" className="font-medium cursor-pointer">
                                Credit / Debit Card
                              </Label>
                              <CreditCard className="h-4 w-4 ml-1" />
                            </div>

                            {paymentMethod === 'credit-card' && (
                              <div className="grid gap-4 mt-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="cardNumber">Card Number</Label>
                                  <Input
                                    id="cardNumber" name="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={formData.cardNumber} onChange={handleInputChange}
                                    maxLength={19} autoComplete="cc-number"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="cardName">Name on Card</Label>
                                  <Input
                                    id="cardName" name="cardName"
                                    placeholder="John Doe"
                                    value={formData.cardName} onChange={handleInputChange}
                                    autoComplete="cc-name"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                    <Input
                                      id="expiryDate" name="expiryDate"
                                      placeholder="MM/YY"
                                      value={formData.expiryDate} onChange={handleInputChange}
                                      maxLength={5} autoComplete="cc-exp"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                      id="cvv" name="cvv"
                                      placeholder="•••"
                                      value={formData.cvv} onChange={handleInputChange}
                                      maxLength={4} type="password" autoComplete="cc-csc"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="upi" id="upi" className="mt-1" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="upi" className="font-medium cursor-pointer">UPI</Label>
                            <span className="text-sm text-muted-foreground">
                              Pay via Google Pay, PhonePe, Paytm or any UPI app.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/50 cursor-pointer">
                          <RadioGroupItem value="cod" id="cod" className="mt-1" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="cod" className="font-medium cursor-pointer">
                              Cash on Delivery
                            </Label>
                            <span className="text-sm text-muted-foreground">
                              Pay when your order arrives.
                            </span>
                          </div>
                        </div>
                      </RadioGroup>

                      <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                          Back
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                          {isSubmitting ? (
                            'Placing order…'
                          ) : (
                            <>Place Order · ₹{total.toFixed(0)}</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Trust badges */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1">
                    <Lock className="h-3.5 w-3.5" /> Secure Checkout
                  </p>
                  <div className="flex justify-center gap-6 flex-wrap">
                    {['Secure Payment', 'Fast Shipping', 'Easy Returns'].map(badge => (
                      <div key={badge} className="flex items-center text-xs text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-2 animate-fade-in [animation-delay:200ms]">
                <div className="bg-card rounded-lg shadow-sm border border-border p-6 sticky top-24">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                  <div className="space-y-4 max-h-[320px] overflow-y-auto mb-6">
                    {cart.map(item => (
                      <CartItem key={item.product.id} item={item} compact />
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span>₹{tax.toFixed(0)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{total.toFixed(0)}</span>
                    </div>
                  </div>

                  {subtotal <= SHIPPING_THRESHOLD && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Add ₹{(SHIPPING_THRESHOLD - subtotal).toFixed(0)} more for free shipping.
                    </p>
                  )}

                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">We Accept</p>
                    <div className="flex gap-2 flex-wrap">
                      {['Visa', 'Mastercard', 'UPI', 'Rupay', 'COD'].map(m => (
                        <div key={m} className="bg-secondary rounded-md px-2 py-1 text-xs">{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Checkout;
