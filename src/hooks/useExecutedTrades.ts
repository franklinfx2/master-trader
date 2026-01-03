// Hook that provides only executed trades for performance analytics
// Missed trades are excluded from all performance calculations
import { useMemo } from 'react';
import { EliteTrade } from '@/types/eliteTrade';

/**
 * Filters trades to only include executed trades.
 * Missed trades should NEVER affect performance metrics.
 */
export const useExecutedTrades = (trades: EliteTrade[]) => {
  const executedTrades = useMemo(() => {
    return trades.filter(trade => trade.trade_status === 'Executed');
  }, [trades]);

  const missedTrades = useMemo(() => {
    return trades.filter(trade => trade.trade_status === 'Missed');
  }, [trades]);

  return {
    executedTrades,
    missedTrades,
    executedCount: executedTrades.length,
    missedCount: missedTrades.length,
    totalCount: trades.length,
  };
};

/**
 * Utility function to filter executed trades (for use in components without hook)
 */
export const filterExecutedTrades = (trades: EliteTrade[]): EliteTrade[] => {
  return trades.filter(trade => trade.trade_status === 'Executed');
};
