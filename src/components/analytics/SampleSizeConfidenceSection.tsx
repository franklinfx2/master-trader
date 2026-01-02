import { useMemo } from 'react';
import { EliteTrade } from '@/types/eliteTrade';

interface SampleSizeConfidenceSectionProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  activeSetup: string | null;
}

interface SetupConfidence {
  setup: string;
  tradeCount: number;
  confidence: 'unproven' | 'developing' | 'validated' | 'institutional';
  label: string;
  icon: string;
  percentage: number;
}

const getConfidenceInfo = (tradeCount: number): { confidence: SetupConfidence['confidence']; label: string; icon: string } => {
  if (tradeCount >= 300) {
    return { confidence: 'institutional', label: 'Institutional', icon: '🔥' };
  } else if (tradeCount >= 150) {
    return { confidence: 'validated', label: 'Validated', icon: '✅' };
  } else if (tradeCount >= 50) {
    return { confidence: 'developing', label: 'Developing', icon: '⚠️' };
  } else {
    return { confidence: 'unproven', label: 'Unproven', icon: '❌' };
  }
};

const getConfidenceColors = (confidence: SetupConfidence['confidence']) => {
  switch (confidence) {
    case 'institutional':
      return { bar: 'bg-emerald-600', text: 'text-emerald-400' };
    case 'validated':
      return { bar: 'bg-green-500', text: 'text-green-400' };
    case 'developing':
      return { bar: 'bg-amber-500', text: 'text-amber-400' };
    case 'unproven':
      return { bar: 'bg-red-500/60', text: 'text-red-400' };
  }
};

export const SampleSizeConfidenceSection = ({
  trades,
  dateRange,
  activeSetup
}: SampleSizeConfidenceSectionProps) => {
  const setupConfidences = useMemo(() => {
    // Filter by date range
    const now = new Date();
    const filteredTrades = trades.filter(trade => {
      if (dateRange === 'all') return true;
      const tradeDate = new Date(trade.trade_date);
      const daysAgo = (now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= parseInt(dateRange);
    });

    // Dynamically derive unique setup types from trades
    const setupGroups = new Map<string, number>();

    filteredTrades.forEach(trade => {
      const key = trade.setup_type;
      setupGroups.set(key, (setupGroups.get(key) || 0) + 1);
    });

    // Calculate confidence for each setup
    const confidences: SetupConfidence[] = Array.from(setupGroups.entries()).map(([setup, tradeCount]) => {
      const { confidence, label, icon } = getConfidenceInfo(tradeCount);

      // Max scale at 400 trades for visual purposes
      const percentage = Math.min((tradeCount / 400) * 100, 100);

      return {
        setup,
        tradeCount,
        confidence,
        label,
        icon,
        percentage
      };
    });

    // Sort by trade count descending
    return confidences.sort((a, b) => b.tradeCount - a.tradeCount);
  }, [trades, dateRange]);

  return (
    <section className="mt-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Sample Size Confidence</h2>
        <p className="text-sm text-muted-foreground mt-1">Statistical trust level per setup</p>
      </div>

      <div className="space-y-4">
        {setupConfidences.map((item) => {
          const colors = getConfidenceColors(item.confidence);
          const isActive = activeSetup === item.setup;

          return (
            <div
              key={item.setup}
              className={`
                bg-card border border-border p-4 transition-colors
                ${isActive ? 'border-primary bg-primary/5' : ''}
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Setup Name */}
                <div className="w-20 flex-shrink-0">
                  <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {item.setup}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex-1">
                  <div className="h-3 bg-muted/30 overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} transition-all duration-300`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Trade Count + Confidence Label */}
                <div className="flex items-center gap-3 sm:w-48 flex-shrink-0 justify-end">
                  <span className="text-sm text-muted-foreground font-mono">
                    {item.tradeCount} trades
                  </span>
                  <span className={`text-sm font-medium ${colors.text} whitespace-nowrap`}>
                    {item.icon} {item.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>❌ &lt;50</span>
        <span>⚠️ 50–150</span>
        <span>✅ 150–300</span>
        <span>🔥 300+</span>
      </div>
    </section>
  );
};
