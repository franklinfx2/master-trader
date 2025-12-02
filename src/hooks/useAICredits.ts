import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AICredits {
  remaining: number;
  monthlyLimit: number;
  resetDate: string | null;
  priority: 'slow' | 'fast' | 'fastest';
}

export const useAICredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<AICredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCredits();

      // Set up real-time subscription to credit changes
      const channel = supabase
        .channel('ai-credits-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            const profile = payload.new as any;
            setCredits({
              remaining: profile.ai_credits_remaining || 0,
              monthlyLimit: profile.ai_credits_monthly_limit || 0,
              resetDate: profile.ai_credits_reset_date || null,
              priority: profile.ai_response_priority || 'slow',
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setCredits(null);
      setLoading(false);
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('ai_credits_remaining, ai_credits_monthly_limit, ai_credits_reset_date, ai_response_priority')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching AI credits:', error);
    } else {
      setCredits({
        remaining: data.ai_credits_remaining || 0,
        monthlyLimit: data.ai_credits_monthly_limit || 0,
        resetDate: data.ai_credits_reset_date || null,
        priority: (data.ai_response_priority as 'slow' | 'fast' | 'fastest') || 'slow',
      });
    }
    setLoading(false);
  };

  const hasEnoughCredits = (required: number): boolean => {
    return (credits?.remaining || 0) >= required;
  };

  const isUnlimited = (): boolean => {
    return (credits?.monthlyLimit || 0) >= 999999;
  };

  return {
    credits,
    loading,
    fetchCredits,
    hasEnoughCredits,
    isUnlimited,
  };
};
