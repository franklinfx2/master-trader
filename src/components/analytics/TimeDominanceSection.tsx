import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EliteTrade } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';

interface TimeDominanceSectionProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  activeSetup: string | null;
}

interface TimeBucket {
  label: string;
  startMinutes: number;
  wins: number;
  losses: number;
  totalR: number;
  tradeCount: number;
}

interface BucketClassification {
  bucket: TimeBucket;
  classification: 'strong' | 'neutral' | 'weak';
  intensity: number; // 0-1 for color intensity
}

const generateTimeBuckets = (): TimeBucket[] => {
  const buckets: TimeBucket[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let half = 0; half < 2; half++) {
      const startMinutes = hour * 60 + half * 30;
      const startHour = Math.floor(startMinutes / 60);
      const startMin = startMinutes % 60;
      const endMinutes = startMinutes + 30;
      const endHour = Math.floor(endMinutes / 60) % 24;
      const endMin = endMinutes % 60;
      
      const label = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      
      buckets.push({
        label,
        startMinutes,
        wins: 0,
        losses: 0,
        totalR: 0,
        tradeCount: 0,
      });
    }
  }
  return buckets;
};

const getTimeInMinutes = (timeString: string | null | undefined): number | null => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const getBucketIndex = (minutes: number): number => {
  return Math.floor(minutes / 30);
};

export function TimeDominanceSection({ trades, dateRange, activeSetup }: TimeDominanceSectionProps) {
  const setupTimeData = useMemo(() => {
    // Filter trades by date range
    const now = new Date();
    const filteredTrades = trades.filter(trade => {
      if (dateRange === 'all') return true;
      const tradeDate = new Date(trade.trade_date);
      const daysAgo = Math.floor((now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= parseInt(dateRange);
    });

    // Dynamically derive unique setup types from filtered trades (includes missed)
    const uniqueSetups = [...new Set(filteredTrades.map(t => t.setup_type))];

    // Process each setup independently
    return uniqueSetups.map(setupType => {
      const setupTrades = filteredTrades.filter(t => t.setup_type === setupType);
      const buckets = generateTimeBuckets();
      
      // Populate buckets with trade data
      // Use ALL trades for frequency count, EXECUTED only for performance metrics
      setupTrades.forEach(trade => {
        const timeMinutes = getTimeInMinutes((trade as any).trade_time);
        if (timeMinutes === null) return;
        
        const bucketIndex = getBucketIndex(timeMinutes);
        if (bucketIndex >= 0 && bucketIndex < buckets.length) {
          buckets[bucketIndex].tradeCount++; // Count ALL trades for frequency
          
          // Only count wins/losses/R for EXECUTED trades
          if (trade.trade_status === 'Executed') {
            if (trade.result === 'Win') {
              buckets[bucketIndex].wins++;
            } else if (trade.result === 'Loss') {
              buckets[bucketIndex].losses++;
            }
            if (trade.r_multiple) {
              buckets[bucketIndex].totalR += trade.r_multiple;
            }
          }
        }
      });

      // Filter to only buckets with trades
      const activeBuckets = buckets.filter(b => b.tradeCount > 0);
      
      if (activeBuckets.length === 0) {
        return { setupType, classifications: [], summary: null };
      }

      // Calculate internal metrics and classify each bucket
      // Performance metrics use executed trades only (wins + losses count)
      const bucketMetrics = activeBuckets.map(bucket => {
        const executedCount = bucket.wins + bucket.losses; // Only executed trades have results
        const winRate = executedCount > 0 
          ? bucket.wins / executedCount 
          : 0;
        const expectancy = executedCount > 0 
          ? bucket.totalR / executedCount 
          : 0;
        
        // Combined score (internal use only)
        const score = (winRate * 0.5) + (Math.min(Math.max(expectancy + 1, 0), 2) / 2 * 0.5);
        
        return { bucket, winRate, expectancy, score };
      });

      // Determine thresholds based on distribution
      const scores = bucketMetrics.map(m => m.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const strongThreshold = avgScore + 0.15;
      const weakThreshold = avgScore - 0.15;

      // Classify buckets
      const classifications: BucketClassification[] = bucketMetrics.map(m => {
        let classification: 'strong' | 'neutral' | 'weak';
        let intensity: number;

        if (m.score >= strongThreshold && m.bucket.tradeCount >= 2) {
          classification = 'strong';
          intensity = Math.min((m.score - strongThreshold) / 0.3 + 0.5, 1);
        } else if (m.score <= weakThreshold || m.bucket.losses > m.bucket.wins) {
          classification = 'weak';
          intensity = Math.min((weakThreshold - m.score) / 0.3 + 0.5, 1);
        } else {
          classification = 'neutral';
          intensity = 0.5;
        }

        return { bucket: m.bucket, classification, intensity };
      });

      // Generate summary
      const weakWindows = classifications
        .filter(c => c.classification === 'weak')
        .map(c => c.bucket.label);
      const strongWindows = classifications
        .filter(c => c.classification === 'strong')
        .map(c => c.bucket.label);
      const neutralWindows = classifications
        .filter(c => c.classification === 'neutral')
        .map(c => c.bucket.label);

      return {
        setupType,
        classifications,
        summary: {
          weak: weakWindows,
          neutral: neutralWindows,
          strong: strongWindows,
        },
      };
    });
  }, [trades, dateRange]);

  const hasAnyData = setupTimeData.some(s => s.classifications.length > 0);

  if (!hasAnyData) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Time Dominance</h2>
        <Card className="bg-card border-border">
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              No time data available. Add trade times to see timing analysis.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-foreground">Time Dominance</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Timing edge analysis per setup. Identifies when setups work or break down.
      </p>

      <div className="space-y-4">
        {setupTimeData.map(({ setupType, classifications, summary }) => {
          if (classifications.length === 0) return null;

          const isActive = activeSetup === setupType;

          return (
            <Card 
              key={setupType} 
              className={cn(
                "bg-card border-border transition-all",
                isActive && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Time Dominance — {setupType}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Heat Strip */}
                <div className="space-y-2">
                  <div className="flex items-center gap-0.5 overflow-x-auto pb-2">
                    {classifications.map(({ bucket, classification, intensity }) => (
                      <div
                        key={bucket.label}
                        className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center text-[9px] font-medium transition-colors",
                          classification === 'strong' && "text-green-950 dark:text-green-100",
                          classification === 'neutral' && "text-yellow-950 dark:text-yellow-100",
                          classification === 'weak' && "text-red-950 dark:text-red-100"
                        )}
                        style={{
                          backgroundColor: 
                            classification === 'strong' 
                              ? `hsl(142, 76%, ${70 - intensity * 30}%)` 
                              : classification === 'weak'
                              ? `hsl(0, 84%, ${70 - intensity * 25}%)`
                              : `hsl(48, 96%, ${70 - intensity * 15}%)`,
                        }}
                        title={`${bucket.label} — ${bucket.tradeCount} trade${bucket.tradeCount !== 1 ? 's' : ''}`}
                      >
                        {bucket.label.split(':')[0]}
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-green-500/70" />
                      <span>Strong</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-yellow-500/70" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-red-500/70" />
                      <span>Weak</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    {summary.weak.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-red-500 dark:text-red-400">Weak Windows: </span>
                        <span className="text-muted-foreground">
                          {summary.weak.slice(0, 5).join(', ')}
                          {summary.weak.length > 5 && ` (+${summary.weak.length - 5} more)`}
                        </span>
                      </div>
                    )}
                    {summary.neutral.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">Neutral Periods: </span>
                        <span className="text-muted-foreground">
                          {summary.neutral.slice(0, 5).join(', ')}
                          {summary.neutral.length > 5 && ` (+${summary.neutral.length - 5} more)`}
                        </span>
                      </div>
                    )}
                    {summary.strong.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-green-600 dark:text-green-400">Strong Windows: </span>
                        <span className="text-muted-foreground">
                          {summary.strong.slice(0, 5).join(', ')}
                          {summary.strong.length > 5 && ` (+${summary.strong.length - 5} more)`}
                        </span>
                      </div>
                    )}
                    {summary.weak.length === 0 && summary.neutral.length === 0 && summary.strong.length === 0 && (
                      <p className="text-xs text-muted-foreground">Insufficient data for timing insights.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
