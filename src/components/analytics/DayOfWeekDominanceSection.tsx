import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EliteTrade } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';

interface DayOfWeekDominanceSectionProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  activeSetup: string | null;
}

interface DayBucket {
  day: string;
  wins: number;
  losses: number;
  totalR: number;
  tradeCount: number;
}

interface DayClassification {
  bucket: DayBucket;
  classification: 'strong' | 'neutral' | 'weak';
  intensity: number;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const DAY_ABBREVIATIONS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
};

export function DayOfWeekDominanceSection({ trades, dateRange, activeSetup }: DayOfWeekDominanceSectionProps) {
  const setupDayData = useMemo(() => {
    // Filter trades by date range
    const now = new Date();
    const filteredTrades = trades.filter(trade => {
      if (dateRange === 'all') return true;
      const tradeDate = new Date(trade.trade_date);
      const daysAgo = Math.floor((now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= parseInt(dateRange);
    });

    // Dynamically derive unique setup types from filtered trades
    const uniqueSetups = [...new Set(filteredTrades.map(t => t.setup_type))];

    // Process each setup independently
    return uniqueSetups.map(setupType => {
      const setupTrades = filteredTrades.filter(t => t.setup_type === setupType);
      
      // Initialize day buckets
      const buckets: DayBucket[] = WEEKDAYS.map(day => ({
        day,
        wins: 0,
        losses: 0,
        totalR: 0,
        tradeCount: 0,
      }));

      // Populate buckets with trade data
      setupTrades.forEach(trade => {
        const dayIndex = WEEKDAYS.indexOf(trade.day_of_week as typeof WEEKDAYS[number]);
        if (dayIndex === -1) return;

        buckets[dayIndex].tradeCount++;
        if (trade.result === 'Win') {
          buckets[dayIndex].wins++;
        } else if (trade.result === 'Loss') {
          buckets[dayIndex].losses++;
        }
        if (trade.r_multiple) {
          buckets[dayIndex].totalR += trade.r_multiple;
        }
      });

      // Filter to only days with trades
      const activeBuckets = buckets.filter(b => b.tradeCount > 0);

      if (activeBuckets.length === 0) {
        return { setupType, classifications: [], summary: null, allBuckets: buckets };
      }

      // Calculate internal metrics and classify each day
      const bucketMetrics = activeBuckets.map(bucket => {
        const winRate = bucket.tradeCount > 0 
          ? bucket.wins / bucket.tradeCount 
          : 0;
        const expectancy = bucket.tradeCount > 0 
          ? bucket.totalR / bucket.tradeCount 
          : 0;

        // Combined score (internal use only)
        const score = (winRate * 0.5) + (Math.min(Math.max(expectancy + 1, 0), 2) / 2 * 0.5);

        return { bucket, winRate, expectancy, score };
      });

      // Determine thresholds based on distribution
      const scores = bucketMetrics.map(m => m.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const strongThreshold = avgScore + 0.12;
      const weakThreshold = avgScore - 0.12;

      // Classify buckets
      const classifications: DayClassification[] = bucketMetrics.map(m => {
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
      const weakDays = classifications
        .filter(c => c.classification === 'weak')
        .map(c => c.bucket.day);
      const strongDays = classifications
        .filter(c => c.classification === 'strong')
        .map(c => c.bucket.day);
      const neutralDays = classifications
        .filter(c => c.classification === 'neutral')
        .map(c => c.bucket.day);

      return {
        setupType,
        classifications,
        allBuckets: buckets,
        summary: {
          weak: weakDays,
          neutral: neutralDays,
          strong: strongDays,
        },
      };
    });
  }, [trades, dateRange]);

  const hasAnyData = setupDayData.some(s => s.classifications.length > 0);

  if (!hasAnyData) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Day of Week Dominance</h2>
        <Card className="bg-card border-border">
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              No weekday data available. Log trades to see day-of-week analysis.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-foreground">Day of Week Dominance</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Weekday edge analysis per setup. Identifies which days work or underperform.
      </p>

      <div className="space-y-4">
        {setupDayData.map(({ setupType, classifications, allBuckets, summary }) => {
          if (classifications.length === 0) return null;

          const isActive = activeSetup === setupType;

          // Create a map for quick lookup
          const classificationMap = new Map(
            classifications.map(c => [c.bucket.day, c])
          );

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
                  Day of Week Dominance — {setupType}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Day Heat Strip */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {WEEKDAYS.map(day => {
                      const classification = classificationMap.get(day);
                      const bucket = allBuckets.find(b => b.day === day);
                      const hasData = bucket && bucket.tradeCount > 0;

                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex-1 h-12 rounded-md flex flex-col items-center justify-center text-xs font-medium transition-colors",
                            !hasData && "bg-muted/30 text-muted-foreground",
                            hasData && classification?.classification === 'strong' && "text-green-950 dark:text-green-100",
                            hasData && classification?.classification === 'neutral' && "text-yellow-950 dark:text-yellow-100",
                            hasData && classification?.classification === 'weak' && "text-red-950 dark:text-red-100"
                          )}
                          style={hasData && classification ? {
                            backgroundColor: 
                              classification.classification === 'strong' 
                                ? `hsl(142, 76%, ${70 - classification.intensity * 30}%)` 
                                : classification.classification === 'weak'
                                ? `hsl(0, 84%, ${70 - classification.intensity * 25}%)`
                                : `hsl(48, 96%, ${70 - classification.intensity * 15}%)`,
                          } : undefined}
                          title={hasData ? `${day} — ${bucket.tradeCount} trade${bucket.tradeCount !== 1 ? 's' : ''}` : `${day} — No trades`}
                        >
                          <span className="font-semibold">{DAY_ABBREVIATIONS[day]}</span>
                          {hasData && (
                            <span className="text-[10px] opacity-80">{bucket.tradeCount}</span>
                          )}
                        </div>
                      );
                    })}
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
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm bg-muted/30" />
                      <span>No Data</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    {summary.weak.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-red-500 dark:text-red-400">Weak Days: </span>
                        <span className="text-muted-foreground">{summary.weak.join(', ')}</span>
                      </div>
                    )}
                    {summary.neutral.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">Neutral Days: </span>
                        <span className="text-muted-foreground">{summary.neutral.join(', ')}</span>
                      </div>
                    )}
                    {summary.strong.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium text-green-600 dark:text-green-400">Strong Days: </span>
                        <span className="text-muted-foreground">{summary.strong.join(', ')}</span>
                      </div>
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
