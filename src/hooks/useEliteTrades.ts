// XAUUSD ELITE TRADING JOURNAL — Hook for elite trades
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  EliteTrade, 
  EliteTradeStats, 
  EliteTradeFormData,
  ClassificationStatus 
} from '@/types/eliteTrade';

export interface EliteTradeFilters {
  session?: string;
  setup_type?: string;
  news_day?: string;
  rules_followed?: string;
  classification_status?: ClassificationStatus;
  would_take_again?: string;
  killzone?: string;
  htf_bias?: string;
  setup_grade?: string;
  liquidity_taken?: string;
  result?: string;
  trade_status?: string;
}

export const useEliteTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<EliteTrade[]>([]);
  const [stats, setStats] = useState<EliteTradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EliteTradeFilters>({});

  const fetchTrades = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    let query = supabase
      .from('trades_v2_elite')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false });

    // Apply filters (cast to any to avoid strict enum type issues with Supabase)
    if (filters.session) {
      query = query.eq('session', filters.session as any);
    }
    if (filters.setup_type) {
      query = query.eq('setup_type', filters.setup_type as any);
    }
    if (filters.news_day) {
      query = query.eq('news_day', filters.news_day as any);
    }
    if (filters.rules_followed) {
      query = query.eq('rules_followed', filters.rules_followed as any);
    }
    if (filters.classification_status) {
      query = query.eq('classification_status', filters.classification_status as any);
    }
    if (filters.would_take_again) {
      query = query.eq('would_i_take_this_trade_again', filters.would_take_again as any);
    }
    if (filters.killzone) {
      query = query.eq('killzone', filters.killzone as any);
    }
    if (filters.htf_bias) {
      query = query.eq('htf_bias', filters.htf_bias as any);
    }
    if (filters.setup_grade) {
      query = query.eq('setup_grade', filters.setup_grade as any);
    }
    if (filters.liquidity_taken) {
      query = query.eq('liquidity_taken_before_entry', filters.liquidity_taken as any);
    }
    if (filters.result) {
      query = query.eq('result', filters.result as any);
    }
    if (filters.trade_status) {
      query = query.eq('trade_status', filters.trade_status as any);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching elite trades:', error);
    } else {
      setTrades((data as unknown as EliteTrade[]) || []);
    }
    setLoading(false);
  }, [user, filters]);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('trades_v2_elite_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching elite stats:', error);
    } else {
      setStats(data as unknown as EliteTradeStats);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTrades();
      fetchStats();
    } else {
      setTrades([]);
      setStats(null);
      setLoading(false);
    }
  }, [user, fetchTrades, fetchStats]);

  const addTrade = async (formData: EliteTradeFormData) => {
    if (!user) return { error: 'Not authenticated' };

    const tradeData = {
      user_id: user.id,
      trade_date: formData.trade_date,
      trade_time: formData.trade_time || null,
      instrument: 'XAUUSD',
      account_type: formData.account_type,
      trade_status: formData.trade_status || 'Executed',
      missed_reason: formData.missed_reason || null,
      hypothetical_result: formData.hypothetical_result || null,
      session: formData.session,
      killzone: formData.killzone,
      day_of_week: formData.day_of_week,
      news_day: formData.news_day,
      news_impact: formData.news_impact || null,
      news_timing: formData.news_timing || null,
      news_type: formData.news_type || null,
      htf_bias: formData.htf_bias,
      htf_timeframe: formData.htf_timeframe,
      market_phase: formData.market_phase,
      structure_state: formData.structure_state,
      liquidity_targeted: formData.liquidity_targeted,
      liquidity_taken_before_entry: formData.liquidity_taken_before_entry,
      liquidity_taken_against_bias: formData.liquidity_taken_against_bias,
      setup_type: formData.setup_type,
      setup_grade: formData.setup_grade,
      execution_tf: formData.execution_tf,
      entry_model: formData.entry_model,
      entry_candle: formData.entry_candle,
      confirmation_present: formData.confirmation_present,
      entry_price: parseFloat(formData.entry_price),
      stop_loss: parseFloat(formData.stop_loss),
      take_profit: parseFloat(formData.take_profit),
      exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
      risk_per_trade_pct: parseFloat(formData.risk_per_trade_pct),
      rr_planned: parseFloat(formData.rr_planned),
      entry_precision: formData.entry_precision,
      stop_placement_quality: formData.stop_placement_quality,
      partial_taken: formData.partial_taken,
      rules_followed: formData.rules_followed,
      gold_behavior_tags: formData.gold_behavior_tags,
      first_move_was_fake: formData.first_move_was_fake,
      real_move_after_liquidity: formData.real_move_after_liquidity,
      trade_aligned_with_real_move: formData.trade_aligned_with_real_move,
      pre_trade_state: formData.pre_trade_state,
      confidence_level: formData.confidence_level,
      revenge_trade: formData.revenge_trade,
      fatigue_present: formData.fatigue_present,
      htf_screenshot: formData.htf_screenshot || null,
      ltf_entry_screenshot: formData.ltf_entry_screenshot || null,
      post_trade_screenshot: formData.post_trade_screenshot || null,
      annotations_present: formData.annotations_present,
      mae: formData.mae ? parseFloat(formData.mae) : null,
      mfe: formData.mfe ? parseFloat(formData.mfe) : null,
      would_i_take_this_trade_again: formData.would_i_take_this_trade_again || null,
      notes: formData.notes || null,
    };

    const { error } = await supabase
      .from('trades_v2_elite')
      .insert([tradeData]);

    if (error) {
      console.error('Error adding elite trade:', error);
      return { error };
    }

    await fetchTrades();
    await fetchStats();
    return { error: null };
  };

  const updateTrade = async (id: string, formData: Partial<EliteTradeFormData>) => {
    if (!user) return { error: 'Not authenticated' };

    const updates: any = {};
    
    // Only include fields that are actually provided and properly convert them
    Object.entries(formData).forEach(([key, value]) => {
      if (value === undefined) return;
      
      // Convert string numbers to actual numbers for numeric fields
      if (['entry_price', 'stop_loss', 'take_profit', 'exit_price', 'risk_per_trade_pct', 'rr_planned', 'mae', 'mfe'].includes(key)) {
        if (value !== null && value !== '') {
          updates[key] = parseFloat(String(value));
        } else if (key === 'exit_price' || key === 'mae' || key === 'mfe') {
          // These can be null
          updates[key] = null;
        }
      } else if (value !== '') {
        updates[key] = value;
      } else if (['notes', 'trade_time', 'htf_screenshot', 'ltf_entry_screenshot', 'post_trade_screenshot'].includes(key)) {
        // These string fields can be null
        updates[key] = null;
      }
    });

    // Calculate result and r_multiple if exit_price is provided
    if (updates.exit_price !== undefined && updates.exit_price !== null) {
      const entry = updates.entry_price || formData.entry_price;
      const sl = updates.stop_loss || formData.stop_loss;
      
      if (entry && sl) {
        const entryNum = parseFloat(String(entry));
        const slNum = parseFloat(String(sl));
        const exitNum = updates.exit_price;
        
        const isLong = slNum < entryNum;
        const riskDistance = Math.abs(entryNum - slNum);
        
        if (riskDistance > 0) {
          const profitDistance = isLong ? exitNum - entryNum : entryNum - exitNum;
          const rMultiple = profitDistance / riskDistance;
          
          updates.r_multiple = parseFloat(rMultiple.toFixed(4));
          updates.rr_realized = parseFloat(rMultiple.toFixed(4));
          
          if (rMultiple > 0.1) updates.result = 'Win';
          else if (rMultiple < -0.1) updates.result = 'Loss';
          else updates.result = 'BE';
        }
      }
    }

    const { error } = await supabase
      .from('trades_v2_elite')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating elite trade:', error);
      return { error };
    }

    await fetchTrades();
    await fetchStats();
    return { error: null };
  };

  const deleteTrade = async (id: string) => {
    const { error } = await supabase
      .from('trades_v2_elite')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting elite trade:', error);
      return { error };
    }

    await fetchTrades();
    await fetchStats();
    return { error: null };
  };

  const getTradesForReview = async () => {
    // Get all trades where would_i_take_this_trade_again = 'No'
    if (!user) return [];

    const { data, error } = await supabase
      .from('trades_v2_elite')
      .select('*')
      .eq('user_id', user.id)
      .eq('would_i_take_this_trade_again', 'No')
      .eq('classification_status', 'fully_classified')
      .order('trade_date', { ascending: false });

    if (error) {
      console.error('Error fetching review trades:', error);
      return [];
    }

    return data as unknown as EliteTrade[];
  };

  const getLegacyTrades = async () => {
    // Get all trades with legacy_unclassified status
    if (!user) return [];

    const { data, error } = await supabase
      .from('trades_v2_elite')
      .select('*')
      .eq('user_id', user.id)
      .eq('classification_status', 'legacy_unclassified')
      .order('trade_date', { ascending: false });

    if (error) {
      console.error('Error fetching legacy trades:', error);
      return [];
    }

    return data as unknown as EliteTrade[];
  };

  return {
    trades,
    stats,
    loading,
    filters,
    setFilters,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
    getTradesForReview,
    getLegacyTrades,
  };
};
