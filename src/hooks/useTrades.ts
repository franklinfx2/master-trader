import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  direction: 'long' | 'short';
  entry: number;
  exit?: number;
  sl?: number;
  tp?: number;
  risk_pct?: number;
  rr?: number;
  result: 'win' | 'loss' | 'be' | 'open';
  pnl?: number;
  notes?: string;
  screenshot_url?: string;
  executed_at: string;
  created_at: string;
  updated_at: string;
}

export interface TradeStats {
  trade_count: number;
  avg_rr: number;
  win_rate: number;
  total_pnl: number;
}

export const useTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrades();
      fetchStats();
    } else {
      setTrades([]);
      setStats(null);
      setLoading(false);
    }
  }, [user]);

  const fetchTrades = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('executed_at', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
    } else {
      setTrades((data as Trade[]) || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trades_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching stats:', error);
    } else {
      setStats(data || { trade_count: 0, avg_rr: 0, win_rate: 0, total_pnl: 0 });
    }
  };

  const addTrade = async (trade: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('trades')
      .insert([{ ...trade, user_id: user.id }]);

    if (error) {
      console.error('Error adding trade:', error);
      return { error };
    }

    await fetchTrades();
    await fetchStats();
    return { error: null };
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    const { error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating trade:', error);
      return { error };
    }

    await fetchTrades();
    await fetchStats();
    return { error: null };
  };

  const deleteTrade = async (id: string) => {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trade:', error);
      return { error };
    }

    await fetchTrades();
    await fetchStats();
    return { error: null };
  };

  return {
    trades,
    stats,
    loading,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
  };
};