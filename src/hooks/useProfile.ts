import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Matches DB schema nullability exactly
interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
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
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!mountedRef.current) return;

      if (error) {
        // PGRST116 = no rows returned (profile not yet created by trigger)
        if (error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch profile data',
            variant: 'destructive',
          });
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching profile:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (!mountedRef.current) return false;

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
        return false;
      }

      setProfile(prev => prev ? { ...prev, ...updates } : prev);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved.',
      });
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      console.error('Error updating profile:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};
