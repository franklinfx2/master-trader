import { useMemo } from 'react';
import { EliteTrade, Session, DayOfWeek, SetupGrade } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';
import { Shield, Target, Clock, AlertTriangle, Brain, TrendingUp } from 'lucide-react';

interface EliteEdgeSummaryProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
}

interface SetupRanking {
  setup: string;
  grade: SetupGrade;
  expectancy: number;
  winRate: number;
  count: number;
}

interface TimeWindow {
  label: string;
  expectancy: number;
  winRate: number;
  count: number;
}

interface DangerZone {
  type: string;
  description: string;
  impact: string;
}

function calculateExpectancy(trades: EliteTrade[]): { expectancy: number; winRate: number } {
  if (trades.length === 0) return { expectancy: 0, winRate: 0 };

  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const decided = wins + losses;
  const winRate = decided > 0 ? (wins / decided) * 100 : 0;

  const rMultiples = trades
    .filter(t => t.r_multiple !== undefined && t.r_multiple !== null)
    .map(t => t.r_multiple!);

  const winningRs = rMultiples.filter(r => r > 0);
  const losingRs = rMultiples.filter(r => r < 0);
  const avgWinR = winningRs.length > 0 ? winningRs.reduce((a, b) => a + b, 0) / winningRs.length : 0;
  const avgLossR = losingRs.length > 0 ? Math.abs(losingRs.reduce((a, b) => a + b, 0) / losingRs.length) : 0;
  const winPct = decided > 0 ? wins / decided : 0;
  const lossPct = decided > 0 ? losses / decided : 0;
  const expectancy = (winPct * avgWinR) - (lossPct * avgLossR);

  return { expectancy: parseFloat(expectancy.toFixed(2)), winRate: parseFloat(winRate.toFixed(1)) };
}

export function EliteEdgeSummary({ trades, dateRange }: EliteEdgeSummaryProps) {
  const summary = useMemo(() => {
    // Filter by date range
    const now = new Date();
    let filteredTrades = [...trades];

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filteredTrades = filteredTrades.filter(t => new Date(t.trade_date) >= cutoff);
    }

    if (filteredTrades.length === 0) {
      return null;
    }

    // 1. Top Setups (by expectancy, with grade)
    const setupGradeMap = new Map<string, EliteTrade[]>();
    for (const trade of filteredTrades) {
      const key = `${trade.setup_type}|${trade.setup_grade}`;
      if (!setupGradeMap.has(key)) {
        setupGradeMap.set(key, []);
      }
      setupGradeMap.get(key)!.push(trade);
    }

    const setupRankings: SetupRanking[] = [];
    for (const [key, keyTrades] of setupGradeMap) {
      if (keyTrades.length >= 3) {
        const [setup, grade] = key.split('|');
        const metrics = calculateExpectancy(keyTrades);
        setupRankings.push({
          setup,
          grade: grade as SetupGrade,
          expectancy: metrics.expectancy,
          winRate: metrics.winRate,
          count: keyTrades.length,
        });
      }
    }
    setupRankings.sort((a, b) => b.expectancy - a.expectancy);
    const topSetups = setupRankings.slice(0, 3);

    // 2. Best Grade Overall
    const gradeMap = new Map<SetupGrade, EliteTrade[]>();
    for (const trade of filteredTrades) {
      if (!gradeMap.has(trade.setup_grade)) {
        gradeMap.set(trade.setup_grade, []);
      }
      gradeMap.get(trade.setup_grade)!.push(trade);
    }

    let bestGrade: { grade: SetupGrade; expectancy: number; winRate: number; count: number } | null = null;
    for (const [grade, gradeTrades] of gradeMap) {
      if (gradeTrades.length >= 5) {
        const metrics = calculateExpectancy(gradeTrades);
        if (!bestGrade || metrics.expectancy > bestGrade.expectancy) {
          bestGrade = { grade, ...metrics, count: gradeTrades.length };
        }
      }
    }

    // 3. Optimal Days
    const dayMap = new Map<DayOfWeek, EliteTrade[]>();
    for (const trade of filteredTrades) {
      if (!dayMap.has(trade.day_of_week)) {
        dayMap.set(trade.day_of_week, []);
      }
      dayMap.get(trade.day_of_week)!.push(trade);
    }

    const dayRankings: TimeWindow[] = [];
    for (const [day, dayTrades] of dayMap) {
      if (dayTrades.length >= 3) {
        const metrics = calculateExpectancy(dayTrades);
        dayRankings.push({
          label: day,
          expectancy: metrics.expectancy,
          winRate: metrics.winRate,
          count: dayTrades.length,
        });
      }
    }
    dayRankings.sort((a, b) => b.expectancy - a.expectancy);
    const optimalDays = dayRankings.filter(d => d.expectancy >= 0.2).slice(0, 2);
    const worstDays = dayRankings.filter(d => d.expectancy < 0).slice(-2);

    // 4. Optimal Sessions
    const sessionMap = new Map<Session, EliteTrade[]>();
    for (const trade of filteredTrades) {
      if (!sessionMap.has(trade.session)) {
        sessionMap.set(trade.session, []);
      }
      sessionMap.get(trade.session)!.push(trade);
    }

    const sessionRankings: TimeWindow[] = [];
    for (const [session, sessionTrades] of sessionMap) {
      if (sessionTrades.length >= 3) {
        const metrics = calculateExpectancy(sessionTrades);
        sessionRankings.push({
          label: session,
          expectancy: metrics.expectancy,
          winRate: metrics.winRate,
          count: sessionTrades.length,
        });
      }
    }
    sessionRankings.sort((a, b) => b.expectancy - a.expectancy);
    const optimalSessions = sessionRankings.filter(s => s.expectancy >= 0.2).slice(0, 2);

    // 5. Non-Negotiable Conditions
    const nonNegotiables: string[] = [];
    
    // HTF Clear
    const htfClearTrades = filteredTrades.filter(t => t.is_htf_clear === 'Yes');
    const htfUnclearTrades = filteredTrades.filter(t => t.is_htf_clear === 'No');
    if (htfClearTrades.length >= 5 && htfUnclearTrades.length >= 3) {
      const clearMetrics = calculateExpectancy(htfClearTrades);
      const unclearMetrics = calculateExpectancy(htfUnclearTrades);
      if (clearMetrics.expectancy - unclearMetrics.expectancy >= 0.3) {
        nonNegotiables.push('HTF Bias Clear');
      }
    }

    // Liquidity Taken
    const liqTrades = filteredTrades.filter(t => t.liquidity_taken_before_entry === 'Yes');
    const noLiqTrades = filteredTrades.filter(t => t.liquidity_taken_before_entry === 'No');
    if (liqTrades.length >= 5 && noLiqTrades.length >= 3) {
      const liqMetrics = calculateExpectancy(liqTrades);
      const noLiqMetrics = calculateExpectancy(noLiqTrades);
      if (liqMetrics.expectancy - noLiqMetrics.expectancy >= 0.3) {
        nonNegotiables.push('Liquidity Taken');
      }
    }

    // Confirmation Present
    const confTrades = filteredTrades.filter(t => t.confirmation_present === 'Yes');
    const noConfTrades = filteredTrades.filter(t => t.confirmation_present === 'No');
    if (confTrades.length >= 5 && noConfTrades.length >= 3) {
      const confMetrics = calculateExpectancy(confTrades);
      const noConfMetrics = calculateExpectancy(noConfTrades);
      if (confMetrics.expectancy - noConfMetrics.expectancy >= 0.3) {
        nonNegotiables.push('Confirmation Present');
      }
    }

    // Rules Followed
    const rulesFollowed = filteredTrades.filter(t => t.rules_followed === 'Yes');
    const rulesBroken = filteredTrades.filter(t => t.rules_followed === 'No');
    if (rulesFollowed.length >= 5 && rulesBroken.length >= 3) {
      const rfMetrics = calculateExpectancy(rulesFollowed);
      const rbMetrics = calculateExpectancy(rulesBroken);
      if (rfMetrics.expectancy - rbMetrics.expectancy >= 0.3) {
        nonNegotiables.push('Rules Followed');
      }
    }

    // 6. Danger Zones
    const dangerZones: DangerZone[] = [];

    // Worst days
    for (const day of worstDays) {
      if (day.expectancy < -0.2) {
        dangerZones.push({
          type: 'Day',
          description: day.label,
          impact: `${day.expectancy}R expectancy`,
        });
      }
    }

    // News days if negative
    const newsDayTrades = filteredTrades.filter(t => t.news_day === 'Yes');
    if (newsDayTrades.length >= 5) {
      const newsMetrics = calculateExpectancy(newsDayTrades);
      if (newsMetrics.expectancy < 0) {
        dangerZones.push({
          type: 'Condition',
          description: 'News Days',
          impact: `${newsMetrics.expectancy}R expectancy`,
        });
      }
    }

    // B-grade trades if negative
    const bGradeTrades = filteredTrades.filter(t => t.setup_grade === 'B');
    if (bGradeTrades.length >= 5) {
      const bMetrics = calculateExpectancy(bGradeTrades);
      if (bMetrics.expectancy < 0) {
        dangerZones.push({
          type: 'Grade',
          description: 'B-Grade Setups',
          impact: `${bMetrics.expectancy}R expectancy`,
        });
      }
    }

    // Trash-grade trades
    const trashTrades = filteredTrades.filter(t => t.setup_grade === 'Trash');
    if (trashTrades.length >= 3) {
      const trashMetrics = calculateExpectancy(trashTrades);
      dangerZones.push({
        type: 'Grade',
        description: 'Trash-Grade Setups',
        impact: `${trashMetrics.expectancy}R expectancy, ${trashTrades.length} trades`,
      });
    }

    // 7. Psychology Leaks
    const psychLeaks: { type: string; impact: string }[] = [];

    const fomoTrades = filteredTrades.filter(t => t.pre_trade_state === 'FOMO');
    if (fomoTrades.length >= 3) {
      const fomoMetrics = calculateExpectancy(fomoTrades);
      if (fomoMetrics.expectancy < 0) {
        psychLeaks.push({
          type: 'FOMO',
          impact: `${fomoMetrics.expectancy}R average`,
        });
      }
    }

    const revengeTrades = filteredTrades.filter(t => t.revenge_trade === 'Yes');
    if (revengeTrades.length >= 3) {
      const revengeMetrics = calculateExpectancy(revengeTrades);
      if (revengeMetrics.expectancy < 0) {
        psychLeaks.push({
          type: 'Revenge Trading',
          impact: `${revengeMetrics.expectancy}R average`,
        });
      }
    }

    return {
      topSetups,
      bestGrade,
      optimalDays,
      optimalSessions,
      nonNegotiables,
      dangerZones,
      psychLeaks,
      totalTrades: filteredTrades.length,
    };
  }, [trades, dateRange]);

  if (!summary) {
    return (
      <section className="mt-8 p-6 bg-card border-2 border-primary/20 rounded-sm">
        <div className="text-center text-muted-foreground">
          Not enough trade data to generate summary.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="space-y-1 mb-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Elite Trading Operating System
        </h2>
        <p className="text-xs text-muted-foreground">
          Your personalized edge summary based on {summary.totalTrades} trades
        </p>
      </div>

      <div className="bg-card border-2 border-primary/20 rounded-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {/* Top Setups */}
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Top Setups</h3>
            </div>
            {summary.topSetups.length > 0 ? (
              <div className="space-y-2">
                {summary.topSetups.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {s.setup} <span className="text-muted-foreground">({s.grade})</span>
                    </span>
                    <span className="text-green-500 font-bold">+{s.expectancy}R</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Need more data (n≥3)</p>
            )}
          </div>

          {/* Best Grade */}
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Best Grade</h3>
            </div>
            {summary.bestGrade ? (
              <div>
                <div className="text-2xl font-bold text-foreground">{summary.bestGrade.grade}</div>
                <div className="text-sm text-muted-foreground">
                  {summary.bestGrade.winRate}% WR · {summary.bestGrade.expectancy}R exp
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Need more data (n≥5)</p>
            )}
          </div>

          {/* Optimal Times */}
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Optimal Times</h3>
            </div>
            <div className="space-y-1 text-sm">
              {summary.optimalDays.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Days: </span>
                  <span className="text-foreground font-medium">
                    {summary.optimalDays.map(d => d.label).join(', ')}
                  </span>
                </div>
              )}
              {summary.optimalSessions.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Sessions: </span>
                  <span className="text-foreground font-medium">
                    {summary.optimalSessions.map(s => s.label).join(', ')}
                  </span>
                </div>
              )}
              {summary.optimalDays.length === 0 && summary.optimalSessions.length === 0 && (
                <p className="text-xs text-muted-foreground">No clear optimal windows yet</p>
              )}
            </div>
          </div>

          {/* Non-Negotiables */}
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Non-Negotiables</h3>
            </div>
            {summary.nonNegotiables.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.nonNegotiables.map((condition, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-500"
                  >
                    ✓ {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No conditions with ≥0.3R advantage yet</p>
            )}
          </div>

          {/* Danger Zones */}
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Danger Zones</h3>
            </div>
            {summary.dangerZones.length > 0 ? (
              <div className="space-y-1">
                {summary.dangerZones.slice(0, 3).map((zone, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-red-400">✗ </span>
                    <span className="text-foreground">{zone.description}</span>
                    <span className="text-muted-foreground"> ({zone.impact})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No significant danger zones identified</p>
            )}
          </div>

          {/* Psychology Leaks */}
          <div className="bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Psychology Leaks</h3>
            </div>
            {summary.psychLeaks.length > 0 ? (
              <div className="space-y-1">
                {summary.psychLeaks.map((leak, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-amber-400">⚠ </span>
                    <span className="text-foreground">{leak.type}</span>
                    <span className="text-muted-foreground"> ({leak.impact})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No psychology leaks detected</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
