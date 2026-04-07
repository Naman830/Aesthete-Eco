import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_amount: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  billing_address: Record<string, unknown>;
  shipping_address: Record<string, unknown>;
  payment_status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  order_items: OrderItem[];
}

// Shape returned by the bare insert (no joined order_items yet)
interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_amount: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  billing_address: Record<string, unknown>;
  shipping_address: Record<string, unknown>;
  payment_status: string;
  payment_method: string | null;
  notes: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface CreateOrderPayload {
  items: Array<{
    id: string;
    name: string;
    image?: string | null;
    price: number;
    quantity: number;
  }>;
  billing_address: Record<string, unknown>;
  shipping_address: Record<string, unknown>;
  payment_method?: string;
  notes?: string;
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!mountedRef.current) return;

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch orders',
          variant: 'destructive',
        });
      } else {
        setOrders((data as unknown as Order[]) || []);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching orders:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderPayload): Promise<OrderRow | null> => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You must be signed in to place an order.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // ── Defensive profile upsert ─────────────────────────────────────
      // If the user signed up before the DB trigger was installed, their
      // profiles row may not exist — causing a FK violation on orders insert.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            full_name: (user.user_metadata as any)?.full_name
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ?? (user.user_metadata as any)?.name
              ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id', ignoreDuplicates: false }
        );

      if (profileError) {
        // Non-fatal: log but continue — profile may already exist
        console.warn('Profile upsert warning:', profileError.message);
      }
      // ─────────────────────────────────────────────────────────────────

      // Calculate totals (INR: free shipping above ₹2,000)
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shipping_amount = subtotal > 2000 ? 0 : 99;
      const tax_amount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
      const discount_amount = 0;
      const total_amount = subtotal + shipping_amount + tax_amount;

      // Generate order number via DB function
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        toast({
          title: 'Error',
          description: 'Could not generate order number. Please try again.',
          variant: 'destructive',
        });
        return null;
      }

      // Insert order
      // We cast through `unknown` because the Supabase-generated Insert type
      // incorrectly omits user_id (it's a non-nullable column set by RLS context
      // but must also be passed explicitly so Postgres can satisfy the FK check).
      const insertPayload = {
        user_id: user.id,
        order_number: orderNumberData as string,
        total_amount,
        shipping_amount,
        tax_amount,
        discount_amount,
        billing_address: orderData.billing_address,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method ?? null,
        notes: orderData.notes ?? null,
        status: 'pending',
        payment_status: 'pending',
      };

      const { data: order, error: orderError } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('orders')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(insertPayload as any)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        toast({
          title: 'Order failed',
          description: `Could not create your order. (${orderError.message})`,
          variant: 'destructive',
        });
        return null;
      }

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image ?? null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        toast({
          title: 'Order incomplete',
          description: 'Order placed but items could not be saved. Contact support.',
          variant: 'destructive',
        });
        // Still return order so the confirmation page shows
      }

      toast({
        title: 'Order placed!',
        description: `Order ${order.order_number} has been confirmed.`,
      });

      // Refresh list in background
      fetchOrders();
      return order as unknown as OrderRow;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    orders,
    loading,
    createOrder,
    refetch: fetchOrders,
  };
};
