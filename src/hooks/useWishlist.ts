import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string | null;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
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
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!mountedRef.current) return;

      if (error) {
        console.error('Error fetching wishlist:', error);
      } else {
        setWishlist((data as WishlistItem[]) || []);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching wishlist:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to save items to your wishlist.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });

      if (!mountedRef.current) return false;

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already saved',
            description: 'This item is already in your wishlist.',
          });
        } else {
          console.error('Error adding to wishlist:', error);
          toast({
            title: 'Error',
            description: 'Could not add item to wishlist.',
            variant: 'destructive',
          });
        }
        return false;
      }

      toast({
        title: 'Added to wishlist',
        description: 'Item saved to your wishlist.',
      });
      await fetchWishlist();
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (!mountedRef.current) return false;

      if (error) {
        console.error('Error removing from wishlist:', error);
        toast({
          title: 'Error',
          description: 'Could not remove item from wishlist.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Removed from wishlist',
        description: 'Item removed from your wishlist.',
      });
      await fetchWishlist();
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean =>
    wishlist.some(item => item.product_id === productId);

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
};
