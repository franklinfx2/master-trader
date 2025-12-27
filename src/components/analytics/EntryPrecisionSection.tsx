import { useMemo } from 'react';

type EliteTrade = {
  trade_date: string;
  setup_type: string;
  result?: string | null;
  r_multiple?: number | null;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  entry_precision: string;
  partial_taken: string;
  rr_planned: number;
};

interface EntryPrecisionSectionProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  activeSetup: string | null;
}

interface PrecisionMetrics {
  avgStopLossSize: number;
  avgTakeProfitSize: number;
  avgRLostLateEntry: number;
  avgRLostEarlyExit: number;
}

interface Insight {
  text: string;
  priority: number;
}

export function EntryPrecisionSection({
  trades,
  dateRange,
  activeSetup,
}: EntryPrecisionSectionProps) {
  // Filter trades by date range
  const filteredTrades = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date | null = null;

    if (dateRange === '30') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '90') {
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    return trades.filter((trade) => {
      if (cutoffDate) {
        const tradeDate = new Date(trade.trade_date);
        if (tradeDate < cutoffDate) return false;
      }
      if (activeSetup && trade.setup_type !== activeSetup) return false;
      return true;
    });
  }, [trades, dateRange, activeSetup]);

  // Calculate metrics
  const metrics = useMemo((): PrecisionMetrics => {
    if (filteredTrades.length === 0) {
      return {
        avgStopLossSize: 0,
        avgTakeProfitSize: 0,
        avgRLostLateEntry: 0,
        avgRLostEarlyExit: 0,
      };
    }

    // Calculate average stop loss size (distance from entry to SL)
    const slSizes = filteredTrades.map((t) => Math.abs(t.entry_price - t.stop_loss));
    const avgStopLossSize = slSizes.reduce((a, b) => a + b, 0) / slSizes.length;

    // Calculate average take profit size (distance from entry to TP)
    const tpSizes = filteredTrades.map((t) => Math.abs(t.take_profit - t.entry_price));
    const avgTakeProfitSize = tpSizes.reduce((a, b) => a + b, 0) / tpSizes.length;

    // Calculate Avg R Lost for Late Entries
    const lateEntryTrades = filteredTrades.filter((t) => t.entry_precision === 'Late');
    const lateEntryLosses = lateEntryTrades.filter((t) => t.result === 'Loss');
    const avgRLostLateEntry =
      lateEntryLosses.length > 0
        ? Math.abs(
            lateEntryLosses.reduce((sum, t) => sum + (t.r_multiple || 0), 0) /
              lateEntryLosses.length
          )
        : 0;

    // Calculate Avg R Lost for Early Exits (partial taken but result was still loss/BE)
    const earlyExitTrades = filteredTrades.filter(
      (t) => t.partial_taken === 'Yes' && (t.result === 'Loss' || t.result === 'BE')
    );
    const avgRLostEarlyExit =
      earlyExitTrades.length > 0
        ? Math.abs(
            earlyExitTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0) /
              earlyExitTrades.length
          )
        : 0;

    return {
      avgStopLossSize,
      avgTakeProfitSize,
      avgRLostLateEntry,
      avgRLostEarlyExit,
    };
  }, [filteredTrades]);

  // Generate insights
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = [];

    if (filteredTrades.length === 0) {
      return [{ text: 'No trade data available for analysis.', priority: 0 }];
    }

    // Late entry insight
    if (metrics.avgRLostLateEntry > 0) {
      result.push({
        text: `Late entries are reducing expectancy by ${metrics.avgRLostLateEntry.toFixed(2)}R`,
        priority: metrics.avgRLostLateEntry,
      });
    }

    // Early exit insight
    if (metrics.avgRLostEarlyExit > 0) {
      result.push({
        text: `Early exits are costing ${metrics.avgRLostEarlyExit.toFixed(2)}R on average`,
        priority: metrics.avgRLostEarlyExit,
      });
    }

    // Compare late entry vs early exit damage
    if (metrics.avgRLostLateEntry > 0 && metrics.avgRLostEarlyExit > 0) {
      if (metrics.avgRLostEarlyExit > metrics.avgRLostLateEntry) {
        result.push({
          text: 'Early exits are costing more R than late entries',
          priority: 1,
        });
      }
    }

    // Stop loss vs structure analysis
    const plannedRRs = filteredTrades.map((t) => t.rr_planned);
    const avgPlannedRR = plannedRRs.reduce((a, b) => a + b, 0) / plannedRRs.length;
    if (avgPlannedRR < 2) {
      result.push({
        text: 'Stop losses may be tighter than structure allows',
        priority: 0.5,
      });
    }

    // Entry precision distribution
    const lateCount = filteredTrades.filter((t) => t.entry_precision === 'Late').length;
    const latePercentage = (lateCount / filteredTrades.length) * 100;
    if (latePercentage > 40) {
      result.push({
        text: `${latePercentage.toFixed(0)}% of entries are late — timing needs work`,
        priority: latePercentage / 100,
      });
    }

    // Optimal entry rate
    const optimalCount = filteredTrades.filter((t) => t.entry_precision === 'Optimal').length;
    const optimalPercentage = (optimalCount / filteredTrades.length) * 100;
    if (optimalPercentage > 60) {
      result.push({
        text: `${optimalPercentage.toFixed(0)}% optimal entries — execution is solid`,
        priority: 0.3,
      });
    }

    // Sort by priority (highest damage first) and take top 3
    return result.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }, [filteredTrades, metrics]);

  const formatMetric = (value: number, isPrice: boolean = false): string => {
    if (value === 0) return '—';
    if (isPrice) {
      return value.toFixed(2);
    }
    return `${value.toFixed(2)}R`;
  };

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Entry Precision</h2>
        <p className="text-xs text-muted-foreground">Execution quality breakdown</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Avg Stop Loss Size */}
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg Stop Loss Size</p>
            <p className="text-xl font-semibold text-foreground tabular-nums">
              {formatMetric(metrics.avgStopLossSize, true)}
            </p>
          </div>

          {/* Avg Take Profit Size */}
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg Take Profit Size</p>
            <p className="text-xl font-semibold text-foreground tabular-nums">
              {formatMetric(metrics.avgTakeProfitSize, true)}
            </p>
          </div>

          {/* Avg R Lost — Late Entry */}
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg R Lost — Late Entry</p>
            <p className="text-xl font-semibold text-foreground tabular-nums">
              {formatMetric(metrics.avgRLostLateEntry)}
            </p>
          </div>

          {/* Avg R Lost — Early Exit */}
          <div className="bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg R Lost — Early Exit</p>
            <p className="text-xl font-semibold text-foreground tabular-nums">
              {formatMetric(metrics.avgRLostEarlyExit)}
            </p>
          </div>
        </div>

        {/* Right Column: Insight Box */}
        <div className="bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3">Auto-Generated Insights</p>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <p key={index} className="text-sm text-foreground leading-relaxed">
                {insight.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
