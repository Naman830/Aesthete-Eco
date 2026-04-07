import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
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
        setOrders((data as Order[]) || []);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching orders:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const createOrder = async (orderData: CreateOrderPayload): Promise<Order | null> => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You must be signed in to place an order.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Calculate totals (INR-based: free shipping above ₹2,000)
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shipping_amount = subtotal > 2000 ? 0 : 99; // ₹99 flat / free above ₹2,000
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
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
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
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        toast({
          title: 'Order failed',
          description: 'Could not create your order. Please try again.',
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
          description: 'Order was created but items could not be saved. Contact support.',
          variant: 'destructive',
        });
        return null;
      }

      toast({
        title: 'Order placed!',
        description: `Order ${order.order_number} has been confirmed.`,
      });

      // Refresh the orders list
      await fetchOrders();
      return order as Order;
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
