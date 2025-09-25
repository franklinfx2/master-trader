import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AffiliateData {
  id: string;
  email: string;
  referral_code: string;
  total_earnings: number;
  pending_balance: number;
  referral_count: number;
  paid_subscribers: number;
  commissions_count: number;
}

interface AdminPayoutRequest {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_details: any;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  affiliate: {
    email: string;
    referral_code: string;
  };
}

export const useAdminReferrals = () => {
  const { user } = useAuth();
  const [affiliates, setAffiliates] = useState<AffiliateData[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<AdminPayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      const adminStatus = profile?.is_admin || false;
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      // Fetch all affiliates with stats
      const { data: affiliatesData } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          referral_code,
          total_earnings,
          pending_balance
        `)
        .not('referral_code', 'is', null);

      // For each affiliate, get their referral stats
      const affiliatesWithStats = await Promise.all(
        (affiliatesData || []).map(async (affiliate) => {
          // Get referral count
          const { data: referrals } = await supabase
            .from('referrals')
            .select('id, profiles!referred_id(plan)')
            .eq('referrer_id', affiliate.id);

          // Get commissions count
          const { data: commissions } = await supabase
            .from('commissions')
            .select('id')
            .eq('referrer_id', affiliate.id);

          const referral_count = referrals?.length || 0;
          const paid_subscribers = referrals?.filter(r => r.profiles?.plan === 'pro').length || 0;
          const commissions_count = commissions?.length || 0;

          return {
            ...affiliate,
            referral_count,
            paid_subscribers,
            commissions_count,
          };
        })
      );

      // Fetch payout requests
      const { data: payoutData } = await supabase
        .from('payout_requests')
        .select(`
          id,
          amount,
          status,
          payment_method,
          payment_details,
          admin_notes,
          requested_at,
          processed_at,
          profiles!affiliate_id(email, referral_code)
        `)
        .order('requested_at', { ascending: false });

      setAffiliates(affiliatesWithStats);
      setPayoutRequests(payoutData?.map(p => ({
        ...p,
        affiliate: {
          email: p.profiles?.email || 'Unknown',
          referral_code: p.profiles?.referral_code || 'N/A'
        }
      })) || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutRequest = async (
    requestId: string, 
    status: string, 
    adminNotes?: string
  ) => {
    if (!isAdmin) return { error: 'Unauthorized' };

    try {
      const updateData: any = {
        status,
        processed_at: new Date().toISOString(),
        processed_by: user?.id,
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('payout_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // If approved for payment, update affiliate's pending balance
      if (status === 'paid') {
        const request = payoutRequests.find(r => r.id === requestId);
        if (request) {
          // Get current affiliate data
          const { data: affiliate } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', request.affiliate.email)
            .single();

          if (affiliate) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                pending_balance: 0,
              })
              .eq('id', affiliate.id);

            if (profileError) console.error('Error updating profile:', profileError);
          }
        }
      }

      await fetchAdminData();
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    if (!isAdmin) return null;

    const data = {
      affiliates,
      payoutRequests,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format for affiliates
    const csvHeaders = 'Email,Referral Code,Total Referrals,Paid Subscribers,Total Earnings,Pending Balance,Commissions\n';
    const csvRows = affiliates.map(a => 
      `${a.email},${a.referral_code},${a.referral_count},${a.paid_subscribers},${a.total_earnings/100},${a.pending_balance/100},${a.commissions_count}`
    ).join('\n');

    return csvHeaders + csvRows;
  };

  return {
    affiliates,
    payoutRequests,
    loading,
    isAdmin,
    fetchAdminData,
    updatePayoutRequest,
    exportData,
  };
};