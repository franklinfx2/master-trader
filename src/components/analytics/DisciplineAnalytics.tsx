import { useMemo } from 'react';
import { EliteTrade } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle, Brain, Zap, Coffee } from 'lucide-react';

interface DisciplineAnalyticsProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  selectedSetups: string[];
  sessionFilter: 'LN' | 'NY' | 'all';
}

interface DisciplineMetric {
  label: string;
  icon: React.ElementType;
  followedCount: number;
  followedExpectancy: number;
  followedWinRate: number;
  brokenCount: number;
  brokenExpectancy: number;
  brokenWinRate: number;
  rCost: number; // R lost due to breaking discipline
}

interface PsychologyLeak {
  type: string;
  occurrences: number;
  totalRLost: number;
  avgRLost: number;
}

interface FrequencyAnalysis {
  tradesPerDay: number;
  count: number;
  expectancy: number;
  winRate: number;
}

function calculateExpectancy(trades: EliteTrade[]): { expectancy: number; winRate: number; totalR: number } {
  if (trades.length === 0) return { expectancy: 0, winRate: 0, totalR: 0 };

  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const decided = wins + losses;

  const winRate = decided > 0 ? (wins / decided) * 100 : 0;

  const rMultiples = trades
    .filter(t => t.r_multiple !== undefined && t.r_multiple !== null)
    .map(t => t.r_multiple!);

  const totalR = rMultiples.reduce((sum, r) => sum + r, 0);
  const winningRs = rMultiples.filter(r => r > 0);
  const losingRs = rMultiples.filter(r => r < 0);
  const avgWinR = winningRs.length > 0 ? winningRs.reduce((a, b) => a + b, 0) / winningRs.length : 0;
  const avgLossR = losingRs.length > 0 ? Math.abs(losingRs.reduce((a, b) => a + b, 0) / losingRs.length) : 0;
  const winPct = decided > 0 ? wins / decided : 0;
  const lossPct = decided > 0 ? losses / decided : 0;
  const expectancy = (winPct * avgWinR) - (lossPct * avgLossR);

  return {
    expectancy: parseFloat(expectancy.toFixed(2)),
    winRate: parseFloat(winRate.toFixed(1)),
    totalR: parseFloat(totalR.toFixed(2)),
  };
}

export function DisciplineAnalytics({
  trades,
  dateRange,
  selectedSetups,
  sessionFilter,
}: DisciplineAnalyticsProps) {
  const analysis = useMemo(() => {
    // Filter trades
    const now = new Date();
    let filteredTrades = [...trades];

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filteredTrades = filteredTrades.filter(t => new Date(t.trade_date) >= cutoff);
    }

    if (sessionFilter !== 'all') {
      const sessionMap = { 'LN': 'London', 'NY': 'NY' };
      filteredTrades = filteredTrades.filter(t => t.session === sessionMap[sessionFilter]);
    }

    if (selectedSetups.length > 0) {
      filteredTrades = filteredTrades.filter(t => selectedSetups.includes(t.setup_type));
    }

    // 1. Rules Followed Analysis
    const rulesFollowed = filteredTrades.filter(t => t.rules_followed === 'Yes');
    const rulesBroken = filteredTrades.filter(t => t.rules_followed === 'No');
    const rfMetrics = calculateExpectancy(rulesFollowed);
    const rbMetrics = calculateExpectancy(rulesBroken);

    const disciplineMetrics: DisciplineMetric[] = [
      {
        label: 'Rules Followed',
        icon: CheckCircle,
        followedCount: rulesFollowed.length,
        followedExpectancy: rfMetrics.expectancy,
        followedWinRate: rfMetrics.winRate,
        brokenCount: rulesBroken.length,
        brokenExpectancy: rbMetrics.expectancy,
        brokenWinRate: rbMetrics.winRate,
        rCost: parseFloat((rbMetrics.totalR).toFixed(2)),
      },
    ];

    // 2. Psychology Leaks (using deprecated fields if available)
    const psychologyLeaks: PsychologyLeak[] = [];

    // FOMO trades
    const fomoTrades = filteredTrades.filter(t => t.pre_trade_state === 'FOMO');
    if (fomoTrades.length > 0) {
      const fomoMetrics = calculateExpectancy(fomoTrades);
      psychologyLeaks.push({
        type: 'FOMO Entries',
        occurrences: fomoTrades.length,
        totalRLost: fomoMetrics.totalR < 0 ? Math.abs(fomoMetrics.totalR) : 0,
        avgRLost: fomoMetrics.expectancy < 0 ? Math.abs(fomoMetrics.expectancy) : 0,
      });
    }

    // Revenge trades
    const revengeTrades = filteredTrades.filter(t => t.revenge_trade === 'Yes');
    if (revengeTrades.length > 0) {
      const revengeMetrics = calculateExpectancy(revengeTrades);
      psychologyLeaks.push({
        type: 'Revenge Trades',
        occurrences: revengeTrades.length,
        totalRLost: revengeMetrics.totalR < 0 ? Math.abs(revengeMetrics.totalR) : 0,
        avgRLost: revengeMetrics.expectancy < 0 ? Math.abs(revengeMetrics.expectancy) : 0,
      });
    }

    // Fatigue trades
    const fatigueTrades = filteredTrades.filter(t => t.fatigue_present === 'Yes');
    if (fatigueTrades.length > 0) {
      const fatigueMetrics = calculateExpectancy(fatigueTrades);
      const nonFatigueMetrics = calculateExpectancy(filteredTrades.filter(t => t.fatigue_present === 'No'));
      const winRateDrop = nonFatigueMetrics.winRate - fatigueMetrics.winRate;
      
      if (fatigueMetrics.expectancy < nonFatigueMetrics.expectancy) {
        psychologyLeaks.push({
          type: 'Trading While Fatigued',
          occurrences: fatigueTrades.length,
          totalRLost: parseFloat((winRateDrop * fatigueTrades.length / 100).toFixed(2)),
          avgRLost: parseFloat((nonFatigueMetrics.expectancy - fatigueMetrics.expectancy).toFixed(2)),
        });
      }
    }

    // Sort by total R lost
    psychologyLeaks.sort((a, b) => b.totalRLost - a.totalRLost);

    // 3. Trade Frequency Analysis
    const tradesByDate = new Map<string, EliteTrade[]>();
    for (const trade of filteredTrades) {
      const date = trade.trade_date;
      if (!tradesByDate.has(date)) {
        tradesByDate.set(date, []);
      }
      tradesByDate.get(date)!.push(trade);
    }

    const frequencyGroups: FrequencyAnalysis[] = [];
    const frequencyBuckets: Record<string, EliteTrade[]> = {
      '1': [],
      '2': [],
      '3': [],
      '4+': [],
    };

    for (const [_, dayTrades] of tradesByDate) {
      const count = dayTrades.length;
      const bucket = count >= 4 ? '4+' : count.toString();
      frequencyBuckets[bucket].push(...dayTrades);
    }

    for (const [bucket, bucketTrades] of Object.entries(frequencyBuckets)) {
      if (bucketTrades.length > 0) {
        const metrics = calculateExpectancy(bucketTrades);
        frequencyGroups.push({
          tradesPerDay: bucket === '4+' ? 4 : parseInt(bucket),
          count: bucketTrades.length,
          expectancy: metrics.expectancy,
          winRate: metrics.winRate,
        });
      }
    }

    // 4. Overconfident vs Hesitant trades
    const overconfidentTrades = filteredTrades.filter(t => t.pre_trade_state === 'Overconfident');
    const hesitantTrades = filteredTrades.filter(t => t.pre_trade_state === 'Hesitant');
    const calmTrades = filteredTrades.filter(t => t.pre_trade_state === 'Calm');

    return {
      disciplineMetrics,
      psychologyLeaks,
      frequencyGroups,
      stateComparison: {
        calm: { count: calmTrades.length, ...calculateExpectancy(calmTrades) },
        overconfident: { count: overconfidentTrades.length, ...calculateExpectancy(overconfidentTrades) },
        hesitant: { count: hesitantTrades.length, ...calculateExpectancy(hesitantTrades) },
      },
      totalTrades: filteredTrades.length,
    };
  }, [trades, dateRange, selectedSetups, sessionFilter]);

  if (trades.length === 0) {
    return (
      <section className="space-y-4 mt-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Discipline & Psychology Analytics
          </h2>
          <p className="text-xs text-muted-foreground">
            Behavioral impact on performance
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No trade data available.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 mt-8">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Discipline & Psychology Analytics
        </h2>
        <p className="text-xs text-muted-foreground">
          Behavioral patterns that cost R
        </p>
      </div>

      {/* Rules Followed vs Broken */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.disciplineMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-card border border-border rounded-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">{metric.label}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Followed */}
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-sm">
                  <div className="text-xs text-green-400 mb-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Followed
                  </div>
                  <div className="text-xl font-bold text-green-500">{metric.followedExpectancy}R</div>
                  <div className="text-xs text-muted-foreground">
                    {metric.followedWinRate}% WR · n={metric.followedCount}
                  </div>
                </div>

                {/* Broken */}
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                  <div className="text-xs text-red-400 mb-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Broken
                  </div>
                  <div className="text-xl font-bold text-red-500">{metric.brokenExpectancy}R</div>
                  <div className="text-xs text-muted-foreground">
                    {metric.brokenWinRate}% WR · n={metric.brokenCount}
                  </div>
                </div>
              </div>

              {metric.rCost < 0 && (
                <div className="mt-3 p-2 bg-red-500/5 border border-red-500/10 rounded-sm">
                  <p className="text-xs text-red-400">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Breaking rules cost you <span className="font-bold">{Math.abs(metric.rCost)}R</span> in total losses
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Psychology State Comparison */}
        {(analysis.stateComparison.calm.count > 0 || 
          analysis.stateComparison.overconfident.count > 0 || 
          analysis.stateComparison.hesitant.count > 0) && (
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Pre-Trade Mental State</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {analysis.stateComparison.calm.count > 0 && (
                <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-sm text-center">
                  <div className="text-xs text-muted-foreground mb-1">Calm</div>
                  <div className={cn(
                    'text-lg font-bold',
                    analysis.stateComparison.calm.expectancy >= 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {analysis.stateComparison.calm.expectancy}R
                  </div>
                  <div className="text-xs text-muted-foreground">n={analysis.stateComparison.calm.count}</div>
                </div>
              )}
              
              {analysis.stateComparison.overconfident.count > 0 && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-sm text-center">
                  <div className="text-xs text-muted-foreground mb-1">Overconfident</div>
                  <div className={cn(
                    'text-lg font-bold',
                    analysis.stateComparison.overconfident.expectancy >= 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {analysis.stateComparison.overconfident.expectancy}R
                  </div>
                  <div className="text-xs text-muted-foreground">n={analysis.stateComparison.overconfident.count}</div>
                </div>
              )}
              
              {analysis.stateComparison.hesitant.count > 0 && (
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-sm text-center">
                  <div className="text-xs text-muted-foreground mb-1">Hesitant</div>
                  <div className={cn(
                    'text-lg font-bold',
                    analysis.stateComparison.hesitant.expectancy >= 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {analysis.stateComparison.hesitant.expectancy}R
                  </div>
                  <div className="text-xs text-muted-foreground">n={analysis.stateComparison.hesitant.count}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Psychology Leaks */}
      {analysis.psychologyLeaks.length > 0 && (
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-semibold text-foreground">Psychology Cost Calculator</h3>
          </div>
          
          <div className="space-y-2">
            {analysis.psychologyLeaks.map((leak, index) => (
              <div
                key={leak.type}
                className={cn(
                  'flex items-center justify-between p-3 rounded-sm',
                  index % 2 === 0 ? 'bg-muted/20' : 'bg-muted/10'
                )}
              >
                <div>
                  <span className="text-sm font-medium text-foreground">{leak.type}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({leak.occurrences} occurrences)
                  </span>
                </div>
                <div className="text-right">
                  {leak.totalRLost > 0 && (
                    <div className="text-sm font-bold text-red-500">-{leak.totalRLost}R total</div>
                  )}
                  {leak.avgRLost > 0 && (
                    <div className="text-xs text-muted-foreground">-{leak.avgRLost}R avg</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade Frequency Analysis */}
      {analysis.frequencyGroups.length > 0 && (
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="h-5 w-5 text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Trade Frequency vs Performance</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {analysis.frequencyGroups.map((group) => {
              const label = group.tradesPerDay >= 4 ? '4+' : group.tradesPerDay.toString();
              return (
                <div
                  key={label}
                  className={cn(
                    'p-3 rounded-sm border',
                    group.expectancy >= 0.3 ? 'bg-green-500/10 border-green-500/20' :
                    group.expectancy >= 0 ? 'bg-amber-500/10 border-amber-500/20' :
                    'bg-red-500/10 border-red-500/20'
                  )}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {label} trade{group.tradesPerDay !== 1 ? 's' : ''}/day
                  </div>
                  <div className={cn(
                    'text-lg font-bold',
                    group.expectancy >= 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {group.expectancy}R
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {group.winRate}% WR · n={group.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
