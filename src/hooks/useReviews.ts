import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean | null;
  helpful_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  profiles: {
    full_name: string | null;
  } | null;
}

export const useReviews = (productId?: string) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!!productId); // false immediately if no productId
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (productId) {
      fetchReviews(productId);
    } else {
      setLoading(false);
    }
  }, [productId]);

  const fetchReviews = async (pid: string) => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('product_id', pid)
        .order('created_at', { ascending: false });

      if (!mountedRef.current) return;

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews((data as Review[]) || []);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching reviews:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const addReview = async (
    pid: string,
    rating: number,
    title?: string,
    comment?: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to write a review.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: user.id,
          product_id: pid,
          rating,
          title: title || null,
          comment: comment || null,
        });

      if (!mountedRef.current) return false;

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already reviewed',
            description: 'You have already reviewed this product.',
            variant: 'destructive',
          });
        } else {
          console.error('Error adding review:', error);
          toast({
            title: 'Error',
            description: 'Failed to submit review. Please try again.',
            variant: 'destructive',
          });
        }
        return false;
      }

      toast({
        title: 'Review submitted',
        description: 'Your review has been added successfully.',
      });
      await fetchReviews(pid);
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      console.error('Error adding review:', error);
      return false;
    }
  };

  const updateReview = async (
    reviewId: string,
    pid: string,
    rating: number,
    title?: string,
    comment?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({
          rating,
          title: title || null,
          comment: comment || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (!mountedRef.current) return false;

      if (error) {
        console.error('Error updating review:', error);
        toast({
          title: 'Error',
          description: 'Failed to update review.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Review updated',
        description: 'Your review has been updated.',
      });
      await fetchReviews(pid);
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      console.error('Error updating review:', error);
      return false;
    }
  };

  const deleteReview = async (reviewId: string, pid: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (!mountedRef.current) return false;

      if (error) {
        console.error('Error deleting review:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete review.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Review deleted',
        description: 'Your review has been removed.',
      });
      await fetchReviews(pid);
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      console.error('Error deleting review:', error);
      return false;
    }
  };

  const getUserReview = (pid: string): Review | null => {
    if (!user) return null;
    return reviews.find(r => r.user_id === user.id && r.product_id === pid) ?? null;
  };

  const getAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  return {
    reviews,
    loading,
    addReview,
    updateReview,
    deleteReview,
    getUserReview,
    getAverageRating,
    refetch: productId ? () => fetchReviews(productId) : () => Promise.resolve(),
  };
};
