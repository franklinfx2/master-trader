import { useMemo } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EliteTrade } from '@/types/eliteTrade';

interface SessionDominanceSectionProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  selectedSetups: string[];
  sessionFilter: 'LN' | 'NY' | 'all';
  activeSetup: string | null;
}

interface SessionMetrics {
  setup: string;
  londonWinRate: number;
  nyWinRate: number;
  londonAvgR: number;
  nyAvgR: number;
  londonTrades: number;
  nyTrades: number;
  dominantSession: 'London' | 'NY' | 'Neutral';
}

export function SessionDominanceSection({
  trades,
  dateRange,
  selectedSetups,
  sessionFilter,
  activeSetup,
}: SessionDominanceSectionProps) {
  const sessionData = useMemo(() => {
    // Filter trades by date range
    const now = new Date();
    const filteredTrades = trades.filter(trade => {
      if (dateRange === 'all') return true;
      const tradeDate = new Date(trade.trade_date);
      const daysAgo = (now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= parseInt(dateRange);
    });

    // Dynamically derive unique setup types from trades (includes missed for frequency)
    const uniqueSetups = [...new Set(filteredTrades.map(t => t.setup_type))];
    const setupsToShow = selectedSetups.length > 0 
      ? selectedSetups 
      : uniqueSetups;
    
    return setupsToShow.map(setup => {
      const setupTrades = filteredTrades.filter(t => t.setup_type === setup);
      // Only executed trades for performance metrics
      const executedSetupTrades = setupTrades.filter(t => t.trade_status === 'Executed');
      
      // London trades - use ALL for count, EXECUTED for performance
      const londonTrades = setupTrades.filter(t => t.session === 'London');
      const londonExecuted = executedSetupTrades.filter(t => t.session === 'London');
      const londonWins = londonExecuted.filter(t => t.result === 'Win').length;
      const londonWinRate = londonExecuted.length > 0 
        ? (londonWins / londonExecuted.length) * 100 
        : 0;
      const londonAvgR = londonExecuted.length > 0
        ? londonExecuted.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / londonExecuted.length
        : 0;

      // NY trades - use ALL for count, EXECUTED for performance
      const nyTrades = setupTrades.filter(t => t.session === 'NY');
      const nyExecuted = executedSetupTrades.filter(t => t.session === 'NY');
      const nyWins = nyExecuted.filter(t => t.result === 'Win').length;
      const nyWinRate = nyExecuted.length > 0 
        ? (nyWins / nyExecuted.length) * 100 
        : 0;
      const nyAvgR = nyExecuted.length > 0
        ? nyExecuted.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / nyExecuted.length
        : 0;

      // Determine dominance (≥20% difference) - based on executed trades only
      let dominantSession: 'London' | 'NY' | 'Neutral' = 'Neutral';
      
      const winRateDiff = Math.abs(londonWinRate - nyWinRate);
      const avgRDiff = Math.abs(londonAvgR - nyAvgR);
      
      // Check if either metric shows ≥20% dominance
      const londonWinRateDominant = londonWinRate > nyWinRate && winRateDiff >= 20;
      const nyWinRateDominant = nyWinRate > londonWinRate && winRateDiff >= 20;
      const londonAvgRDominant = londonAvgR > nyAvgR && (nyAvgR === 0 || (londonAvgR - nyAvgR) / Math.abs(nyAvgR || 1) >= 0.2);
      const nyAvgRDominant = nyAvgR > londonAvgR && (londonAvgR === 0 || (nyAvgR - londonAvgR) / Math.abs(londonAvgR || 1) >= 0.2);

      if (londonWinRateDominant || londonAvgRDominant) {
        dominantSession = 'London';
      } else if (nyWinRateDominant || nyAvgRDominant) {
        dominantSession = 'NY';
      }

      return {
        setup,
        londonWinRate,
        nyWinRate,
        londonAvgR,
        nyAvgR,
        londonTrades: londonTrades.length, // Total count (includes missed)
        nyTrades: nyTrades.length, // Total count (includes missed)
        dominantSession,
      } as SessionMetrics;
    });
  }, [trades, dateRange, selectedSetups]);

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Session Dominance</h2>
        <p className="text-xs text-muted-foreground">Where each setup actually performs</p>
      </div>

      {/* Table Container - Horizontally scrollable on mobile */}
      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Setup
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                London Win Rate
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                NY Win Rate
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                London Avg R
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                NY Avg R
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Dominant Session
              </th>
            </tr>
          </thead>
          <tbody>
            {sessionData.map((row, index) => {
              const isActive = activeSetup === row.setup;
              const londonIsDominant = row.dominantSession === 'London';
              const nyIsDominant = row.dominantSession === 'NY';

              return (
                <tr
                  key={row.setup}
                  className={cn(
                    'border-b border-border last:border-b-0 transition-colors',
                    isActive && 'bg-primary/10',
                    !isActive && index % 2 === 0 && 'bg-background',
                    !isActive && index % 2 === 1 && 'bg-muted/10'
                  )}
                >
                  {/* Setup Name */}
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-foreground">{row.setup}</span>
                  </td>

                  {/* London Win Rate */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'text-sm',
                        nyIsDominant ? 'text-muted-foreground/50' : 'text-foreground'
                      )}
                    >
                      {row.londonWinRate.toFixed(1)}%
                    </span>
                  </td>

                  {/* NY Win Rate */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'text-sm',
                        londonIsDominant ? 'text-muted-foreground/50' : 'text-foreground'
                      )}
                    >
                      {row.nyWinRate.toFixed(1)}%
                    </span>
                  </td>

                  {/* London Avg R */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'text-sm',
                        nyIsDominant ? 'text-muted-foreground/50' : 'text-foreground'
                      )}
                    >
                      {row.londonAvgR.toFixed(2)}R
                    </span>
                  </td>

                  {/* NY Avg R */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'text-sm',
                        londonIsDominant ? 'text-muted-foreground/50' : 'text-foreground'
                      )}
                    >
                      {row.nyAvgR.toFixed(2)}R
                    </span>
                  </td>

                  {/* Dominant Session */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {row.dominantSession !== 'Neutral' && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                      {row.dominantSession}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sessionData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No session data available</p>
        </div>
      )}
    </section>
  );
}
