import { useMemo, useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import { SETUP_TYPES } from '@/types/eliteTrade';

type EliteTrade = {
  id: string;
  setup_type: string;
  trade_date: string;
  result?: 'Win' | 'Loss' | 'BE' | null;
  r_multiple?: number | null;
};

interface EdgeDriftSectionProps {
  trades: EliteTrade[];
  dateRange: string;
  activeSetup: string | null;
}

interface SetupMetrics {
  setup: string;
  dataPoints: {
    period: string;
    expectancy: number;
    winRate: number;
    avgR: number;
  }[];
  hasEdgeDecay: boolean;
}

export function EdgeDriftSection({ trades, dateRange, activeSetup }: EdgeDriftSectionProps) {
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

  // Auto-expand active setup panel
  useEffect(() => {
    if (activeSetup) {
      setOpenPanels(prev => ({ ...prev, [activeSetup]: true }));
    }
  }, [activeSetup]);

  const togglePanel = (setup: string) => {
    setOpenPanels(prev => ({ ...prev, [setup]: !prev[setup] }));
  };

  const setupMetrics = useMemo(() => {
    // Filter trades by date range
    const now = new Date();
    const filteredTrades = trades.filter(trade => {
      if (dateRange === 'all') return true;
      const tradeDate = new Date(trade.trade_date);
      const daysAgo = (now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= parseInt(dateRange);
    });

    const metrics: SetupMetrics[] = [];

    SETUP_TYPES.forEach(setup => {
      const setupTrades = filteredTrades.filter(t => t.setup_type === setup);
      
      if (setupTrades.length === 0) {
        metrics.push({
          setup,
          dataPoints: [],
          hasEdgeDecay: false,
        });
        return;
      }

      // Sort trades by date
      const sortedTrades = [...setupTrades].sort(
        (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
      );

      // Create rolling windows (groups of 10 trades each)
      const windowSize = Math.max(5, Math.floor(sortedTrades.length / 6));
      const dataPoints: { period: string; expectancy: number; winRate: number; avgR: number }[] = [];

      for (let i = 0; i < sortedTrades.length; i += windowSize) {
        const windowTrades = sortedTrades.slice(i, i + windowSize);
        if (windowTrades.length < 3) continue;

        const wins = windowTrades.filter(t => t.result === 'Win').length;
        const losses = windowTrades.filter(t => t.result === 'Loss').length;
        const totalDecided = wins + losses;
        
        const winRate = totalDecided > 0 ? (wins / totalDecided) * 100 : 0;
        const avgR = windowTrades.reduce((sum, t) => sum + (t.r_multiple || 0), 0) / windowTrades.length;
        
        // Simplified expectancy calculation
        const avgWin = windowTrades.filter(t => t.result === 'Win').reduce((sum, t) => sum + (t.r_multiple || 0), 0) / (wins || 1);
        const avgLoss = Math.abs(windowTrades.filter(t => t.result === 'Loss').reduce((sum, t) => sum + (t.r_multiple || 0), 0) / (losses || 1));
        const expectancy = totalDecided > 0 ? (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss : 0;

        const periodLabel = `P${dataPoints.length + 1}`;
        dataPoints.push({
          period: periodLabel,
          expectancy: parseFloat(expectancy.toFixed(2)),
          winRate: parseFloat(winRate.toFixed(1)),
          avgR: parseFloat(avgR.toFixed(2)),
        });
      }

      // Check for edge decay (15% drop in expectancy)
      let hasEdgeDecay = false;
      if (dataPoints.length >= 2) {
        const recentPoints = dataPoints.slice(-2);
        const previousExpectancy = recentPoints[0].expectancy;
        const currentExpectancy = recentPoints[1].expectancy;
        
        if (previousExpectancy > 0 && currentExpectancy < previousExpectancy) {
          const percentDrop = ((previousExpectancy - currentExpectancy) / previousExpectancy) * 100;
          hasEdgeDecay = percentDrop >= 15;
        }
      }

      metrics.push({
        setup,
        dataPoints,
        hasEdgeDecay,
      });
    });

    return metrics;
  }, [trades, dateRange]);

  const setuopsWithData = setupMetrics.filter(m => m.dataPoints.length > 0);

  if (setuopsWithData.length === 0) {
    return (
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Edge Drift</h2>
          <p className="text-xs text-muted-foreground">Is your edge improving or decaying?</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">Not enough trade data to analyze edge drift</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Edge Drift</h2>
        <p className="text-xs text-muted-foreground">Is your edge improving or decaying?</p>
      </div>

      <div className="space-y-2">
        {setupMetrics.map(({ setup, dataPoints, hasEdgeDecay }) => {
          if (dataPoints.length === 0) return null;
          
          const isOpen = openPanels[setup] || false;
          const isActive = activeSetup === setup;

          return (
            <Collapsible
              key={setup}
              open={isOpen}
              onOpenChange={() => togglePanel(setup)}
            >
              <div
                className={`bg-card border rounded-lg overflow-hidden transition-colors ${
                  isActive ? 'border-primary/50 bg-primary/5' : 'border-border'
                }`}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{setup}</span>
                      {hasEdgeDecay && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-destructive/20 text-destructive text-xs font-medium rounded">
                          <AlertTriangle className="h-3 w-3" />
                          EDGE DECAY
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-2 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Expectancy Chart */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Expectancy</p>
                        <div className="h-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataPoints}>
                              <XAxis
                                dataKey="period"
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                              />
                              <Line
                                type="monotone"
                                dataKey="expectancy"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={1.5}
                                dot={{ r: 2, fill: 'hsl(var(--muted-foreground))' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Win Rate Chart */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Win Rate</p>
                        <div className="h-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataPoints}>
                              <XAxis
                                dataKey="period"
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                                domain={[0, 100]}
                              />
                              <Line
                                type="monotone"
                                dataKey="winRate"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={1.5}
                                dot={{ r: 2, fill: 'hsl(var(--muted-foreground))' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Avg R Chart */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Avg R</p>
                        <div className="h-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dataPoints}>
                              <XAxis
                                dataKey="period"
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                              />
                              <Line
                                type="monotone"
                                dataKey="avgR"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={1.5}
                                dot={{ r: 2, fill: 'hsl(var(--muted-foreground))' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </section>
  );
}
