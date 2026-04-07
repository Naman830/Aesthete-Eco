import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import {
  User, Package, ChevronDown, ChevronRight,
  LogOut, X, Clock, Truck, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Status helpers ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    className: 'badge-pending',    icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed:  { label: 'Confirmed',  className: 'badge-confirmed',  icon: <CheckCircle className="h-3.5 w-3.5" /> },
  processing: { label: 'Processing', className: 'badge-processing', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  shipped:    { label: 'Shipped',    className: 'badge-shipped',    icon: <Truck className="h-3.5 w-3.5" /> },
  delivered:  { label: 'Delivered',  className: 'badge-delivered',  icon: <CheckCircle className="h-3.5 w-3.5" /> },
  cancelled:  { label: 'Cancelled',  className: 'badge-cancelled',  icon: <XCircle className="h-3.5 w-3.5" /> },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'badge-pending', icon: null };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.className)}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────
const TABS = ['overview', 'orders', 'profile'] as const;
type Tab = typeof TABS[number];

// ─────────────────────────────────────────────────────────────────
const Account = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, refetch } = useOrders();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: Tab = (searchParams.get('tab') as Tab) ?? 'overview';
  const setTab = (t: Tab) => setSearchParams({ tab: t });

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  // Populate profile form
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
      });
    }
  }, [profile]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('user_id', user!.id);

    setCancellingId(null);

    if (error) {
      toast({ title: 'Error', description: 'Could not cancel order. Please contact support.', variant: 'destructive' });
    } else {
      toast({ title: 'Order cancelled', description: 'Your order has been cancelled.' });
      refetch();
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile(profileForm);
    setSavingProfile(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="animate-pulse space-y-3 text-center">
            <div className="h-10 w-40 bg-secondary rounded mx-auto" />
            <div className="h-4 w-24 bg-secondary rounded mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const cancelableStatuses = ['pending', 'confirmed'];

  return (
    <>
      <Helmet>
        <title>My Account | Aesthete</title>
        <meta name="description" content="Manage your Aesthete account, orders, and profile." />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
                <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="w-fit gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>

            {/* ── Tab navigation ── */}
            <div className="flex gap-1 border-b border-border mb-8 -mx-1 px-1 overflow-x-auto">
              {([
                { key: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
                { key: 'orders',   label: 'Orders',   icon: <Package className="h-4 w-4" /> },
                { key: 'profile',  label: 'Profile',  icon: <User className="h-4 w-4" /> },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                    activeTab === tab.key
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  {tab.icon}{tab.label}
                  {tab.key === 'orders' && orders.length > 0 && (
                    <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[11px]">
                      {orders.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                {/* Stats */}
                <StatCard
                  title="Total Orders"
                  value={orders.length.toString()}
                  sub="all time"
                  onClick={() => setTab('orders')}
                />
                <StatCard
                  title="Delivered"
                  value={orders.filter(o => o.status === 'delivered').length.toString()}
                  sub="orders"
                  onClick={() => setTab('orders')}
                />
                <StatCard
                  title="Amount Spent"
                  value={`₹${orders.reduce((s, o) => s + o.total_amount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  sub="lifetime"
                  onClick={() => setTab('orders')}
                />

                {/* Recent orders preview */}
                {orders.length > 0 && (
                  <div className="md:col-span-3 bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold">Recent Orders</h2>
                      <button onClick={() => setTab('orders')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        View all <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium font-mono">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            <span className="font-medium text-sm">₹{order.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orders.length === 0 && !ordersLoading && (
                  <div className="md:col-span-3 text-center py-12 bg-secondary/40 rounded-xl">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="font-medium mb-1">No orders yet</p>
                    <p className="text-sm text-muted-foreground mb-5">When you place an order, it will appear here.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/products">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── Orders Tab ── */}
            {activeTab === 'orders' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-5">Order History</h2>

                {ordersLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-secondary animate-pulse rounded-xl" />
                    ))}
                  </div>
                )}

                {!ordersLoading && orders.length === 0 && (
                  <div className="text-center py-16 bg-secondary/40 rounded-xl">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="font-medium mb-1">No orders yet</p>
                    <p className="text-muted-foreground text-sm mb-6">Your orders will appear here once placed.</p>
                    <Button asChild size="sm">
                      <Link to="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {orders.map(order => {
                    const isExpanded = expandedOrder === order.id;
                    const canCancel = cancelableStatuses.includes(order.status);

                    return (
                      <div key={order.id} className="border border-border rounded-xl overflow-hidden bg-card">
                        {/* Order header (always visible) */}
                        <button
                          className="w-full text-left p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-secondary/30 transition-colors"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div className="flex items-start sm:items-center gap-4">
                            <div>
                              <p className="font-mono text-sm font-semibold">{order.order_number}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                  : '—'}
                                {' · '}{order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4">
                            <StatusBadge status={order.status} />
                            <span className="font-semibold text-sm">₹{order.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-180')} />
                          </div>
                        </button>

                        {/* Order detail (expanded) */}
                        {isExpanded && (
                          <div className="border-t border-border p-4 md:p-5 animate-fade-in">
                            {/* Items */}
                            {order.order_items && order.order_items.length > 0 && (
                              <div className="space-y-3 mb-5">
                                {order.order_items.map(item => (
                                  <div key={item.id} className="flex items-center gap-4">
                                    {item.product_image && (
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-14 h-14 rounded-lg object-cover bg-secondary shrink-0"
                                        loading="lazy"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium leading-tight line-clamp-1">{item.product_name}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium shrink-0">₹{item.total_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <Separator className="my-4" />

                            {/* Totals + address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Price Breakdown</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{(order.total_amount - (order.shipping_amount ?? 0) - (order.tax_amount ?? 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{(order.shipping_amount ?? 0) === 0 ? 'Free' : `₹${order.shipping_amount}`}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">GST (18%)</span>
                                    <span>₹{(order.tax_amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                  </div>
                                  <Separator className="my-1.5" />
                                  <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>₹{order.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Shipping address */}
                              {order.shipping_address && (
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Shipping To</p>
                                  <div className="text-sm text-muted-foreground space-y-0.5">
                                    {Object.entries(order.shipping_address as Record<string, string>)
                                      .filter(([k]) => !['email'].includes(k))
                                      .map(([, v]) => v && <p key={v}>{v}</p>)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Cancel button */}
                            {canCancel && (
                              <div className="mt-5 pt-4 border-t border-border flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/8"
                                  disabled={cancellingId === order.id}
                                  onClick={() => handleCancelOrder(order.id)}
                                >
                                  <X className="h-4 w-4" />
                                  {cancellingId === order.id ? 'Cancelling…' : 'Cancel Order'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in max-w-lg">
                <h2 className="text-xl font-semibold mb-5">Profile Details</h2>

                {profileLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-secondary rounded" />
                    <div className="h-10 bg-secondary rounded" />
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="prof-email">Email</Label>
                      <Input id="prof-email" value={user.email ?? ''} disabled className="bg-secondary/50" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prof-name">Full Name</Label>
                      <Input
                        id="prof-name"
                        value={profileForm.full_name}
                        onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                        placeholder="Your name"
                        autoComplete="name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prof-phone">Phone (optional)</Label>
                      <Input
                        id="prof-phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                      />
                    </div>

                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({
  title, value, sub, onClick,
}: { title: string; value: string; sub: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="text-left bg-card border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
    <p className="text-3xl font-bold tracking-tight">{value}</p>
    <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
  </button>
);

export default Account;
