import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralStats {
  totalReferrals: number;
  paidSubscribers: number;
  totalEarnings: number;
  pendingBalance: number;
  referralCode: string;
}

interface Commission {
  id: string;
  amount: number;
  commission_rate: number;
  payment_reference: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
  referred_user_email: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_details: any;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const MINIMUM_PAYOUT = 5000; // ₵50.00 in pesewas

  useEffect(() => {
    if (user) {
      fetchReferralData();
    } else {
      setStats(null);
      setCommissions([]);
      setPayoutRequests([]);
      setLoading(false);
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user profile with referral data
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, total_earnings, pending_balance')
        .eq('id', user.id)
        .single();

      // Fetch referral counts
      const { data: referrals } = await supabase
        .from('referrals')
        .select('id, referred_id, profiles!referred_id(plan)')
        .eq('referrer_id', user.id);

      // Fetch commissions
      const { data: commissionsData } = await supabase
        .from('commissions')
        .select(`
          id,
          amount,
          commission_rate,
          payment_reference,
          status,
          created_at,
          paid_at,
          profiles!referred_id(email)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch payout requests
      const { data: payoutData } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('affiliate_id', user.id)
        .order('requested_at', { ascending: false });

      const totalReferrals = referrals?.length || 0;
      const paidSubscribers = referrals?.filter(r => r.profiles?.plan === 'pro').length || 0;

      setStats({
        totalReferrals,
        paidSubscribers,
        totalEarnings: profile?.total_earnings || 0,
        pendingBalance: profile?.pending_balance || 0,
        referralCode: profile?.referral_code || '',
      });

      setCommissions(commissionsData?.map(c => ({
        ...c,
        referred_user_email: c.profiles?.email || 'Unknown'
      })) || []);

      setPayoutRequests(payoutData || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    if (!stats?.referralCode) return '';
    return `${window.location.origin}/signup?ref=${stats.referralCode}`;
  };

  const requestPayout = async (paymentMethod: string, paymentDetails: any) => {
    if (!user || !stats) return { error: 'User not authenticated' };

    if (stats.pendingBalance < MINIMUM_PAYOUT) {
      return { error: `Minimum payout amount is ₵${MINIMUM_PAYOUT / 100}` };
    }

    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          affiliate_id: user.id,
          amount: stats.pendingBalance,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        });

      if (error) throw error;

      await fetchReferralData();
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const canRequestPayout = () => {
    return stats && stats.pendingBalance >= MINIMUM_PAYOUT;
  };

  return {
    stats,
    commissions,
    payoutRequests,
    loading,
    fetchReferralData,
    getReferralLink,
    requestPayout,
    canRequestPayout,
    minimumPayout: MINIMUM_PAYOUT,
  };
};