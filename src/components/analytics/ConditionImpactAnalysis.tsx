import { useMemo } from 'react';
import { EliteTrade } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';
import { Check, X, Minus, ArrowUp, ArrowDown } from 'lucide-react';

interface ConditionImpactAnalysisProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  selectedSetups: string[];
  sessionFilter: 'LN' | 'NY' | 'all';
}

interface ConditionImpact {
  condition: string;
  field: string;
  presentCount: number;
  absentCount: number;
  presentExpectancy: number;
  absentExpectancy: number;
  delta: number;
  presentWinRate: number;
  absentWinRate: number;
  verdict: 'Non-Negotiable' | 'Beneficial' | 'Optional' | 'Remove';
}

interface ConfluenceStack {
  conditions: string[];
  count: number;
  expectancy: number;
  winRate: number;
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

function getVerdict(delta: number, presentExpectancy: number): ConditionImpact['verdict'] {
  if (delta >= 0.3 && presentExpectancy >= 0.5) return 'Non-Negotiable';
  if (delta >= 0.1 && presentExpectancy >= 0) return 'Beneficial';
  if (delta >= -0.1) return 'Optional';
  return 'Remove';
}

function getVerdictStyle(verdict: ConditionImpact['verdict']) {
  switch (verdict) {
    case 'Non-Negotiable':
      return 'bg-green-500/20 text-green-500 border-green-500/30';
    case 'Beneficial':
      return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    case 'Optional':
      return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
    case 'Remove':
      return 'bg-red-500/20 text-red-500 border-red-500/30';
  }
}

export function ConditionImpactAnalysis({
  trades,
  dateRange,
  selectedSetups,
  sessionFilter,
}: ConditionImpactAnalysisProps) {
  const { impacts, topConfluence, baselineExpectancy } = useMemo(() => {
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

    // Baseline expectancy
    const baseline = calculateExpectancy(filteredTrades);

    // Define conditions to analyze (Yes/No fields)
    const conditionsToAnalyze: Array<{ name: string; field: keyof EliteTrade }> = [
      { name: 'HTF Clear', field: 'is_htf_clear' },
      { name: 'Liquidity Taken Before Entry', field: 'liquidity_taken_before_entry' },
      { name: 'Confirmation Present', field: 'confirmation_present' },
      { name: 'Rules Followed', field: 'rules_followed' },
      { name: 'News Day', field: 'news_day' },
    ];

    // Analyze each condition
    const impacts: ConditionImpact[] = conditionsToAnalyze.map(({ name, field }) => {
      const presentTrades = filteredTrades.filter(t => t[field] === 'Yes');
      const absentTrades = filteredTrades.filter(t => t[field] === 'No');

      const presentMetrics = calculateExpectancy(presentTrades);
      const absentMetrics = calculateExpectancy(absentTrades);

      const delta = presentMetrics.expectancy - absentMetrics.expectancy;

      return {
        condition: name,
        field,
        presentCount: presentTrades.length,
        absentCount: absentTrades.length,
        presentExpectancy: presentMetrics.expectancy,
        absentExpectancy: absentMetrics.expectancy,
        delta: parseFloat(delta.toFixed(2)),
        presentWinRate: presentMetrics.winRate,
        absentWinRate: absentMetrics.winRate,
        verdict: getVerdict(delta, presentMetrics.expectancy),
      };
    });

    // Sort by delta descending (most impactful first)
    impacts.sort((a, b) => b.delta - a.delta);

    // Find top confluence combinations
    const confluenceStacks: ConfluenceStack[] = [];

    // Check triple confluence: HTF Clear + Liquidity + Confirmation
    const tripleConfluence = filteredTrades.filter(t =>
      t.is_htf_clear === 'Yes' &&
      t.liquidity_taken_before_entry === 'Yes' &&
      t.confirmation_present === 'Yes'
    );
    if (tripleConfluence.length >= 3) {
      const metrics = calculateExpectancy(tripleConfluence);
      confluenceStacks.push({
        conditions: ['HTF Clear', 'Liquidity Taken', 'Confirmation'],
        count: tripleConfluence.length,
        expectancy: metrics.expectancy,
        winRate: metrics.winRate,
      });
    }

    // Check HTF Clear + Rules Followed
    const htfRules = filteredTrades.filter(t =>
      t.is_htf_clear === 'Yes' &&
      t.rules_followed === 'Yes'
    );
    if (htfRules.length >= 3) {
      const metrics = calculateExpectancy(htfRules);
      confluenceStacks.push({
        conditions: ['HTF Clear', 'Rules Followed'],
        count: htfRules.length,
        expectancy: metrics.expectancy,
        winRate: metrics.winRate,
      });
    }

    // Check Liquidity + Confirmation + Rules
    const lcrStack = filteredTrades.filter(t =>
      t.liquidity_taken_before_entry === 'Yes' &&
      t.confirmation_present === 'Yes' &&
      t.rules_followed === 'Yes'
    );
    if (lcrStack.length >= 3) {
      const metrics = calculateExpectancy(lcrStack);
      confluenceStacks.push({
        conditions: ['Liquidity Taken', 'Confirmation', 'Rules Followed'],
        count: lcrStack.length,
        expectancy: metrics.expectancy,
        winRate: metrics.winRate,
      });
    }

    // Sort by expectancy
    confluenceStacks.sort((a, b) => b.expectancy - a.expectancy);

    return {
      impacts,
      topConfluence: confluenceStacks.slice(0, 3),
      baselineExpectancy: baseline.expectancy,
    };
  }, [trades, dateRange, selectedSetups, sessionFilter]);

  if (trades.length === 0) {
    return (
      <section className="space-y-4 mt-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Condition Impact Analysis
          </h2>
          <p className="text-xs text-muted-foreground">
            Confluence intelligence engine
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No trade data available.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 mt-8">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Condition Impact Analysis
        </h2>
        <p className="text-xs text-muted-foreground">
          Which conditions improve or harm your edge (baseline: {baselineExpectancy}R)
        </p>
      </div>

      {/* Condition Impact Table */}
      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Condition
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Present (Exp/WR)
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Absent (Exp/WR)
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Delta
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Verdict
              </th>
            </tr>
          </thead>
          <tbody>
            {impacts.map((impact, index) => (
              <tr
                key={impact.field}
                className={cn(
                  'border-b border-border last:border-b-0 transition-colors',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                )}
              >
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-foreground">{impact.condition}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      'text-sm font-bold',
                      impact.presentExpectancy >= 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {impact.presentExpectancy}R
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {impact.presentWinRate}% (n={impact.presentCount})
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      'text-sm font-bold',
                      impact.absentExpectancy >= 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {impact.absentExpectancy}R
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {impact.absentWinRate}% (n={impact.absentCount})
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    {impact.delta > 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : impact.delta < 0 ? (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={cn(
                      'text-sm font-bold',
                      impact.delta > 0 ? 'text-green-500' : impact.delta < 0 ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      {impact.delta > 0 ? '+' : ''}{impact.delta}R
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border',
                    getVerdictStyle(impact.verdict)
                  )}>
                    {impact.verdict === 'Non-Negotiable' && <Check className="h-3 w-3" />}
                    {impact.verdict === 'Remove' && <X className="h-3 w-3" />}
                    {impact.verdict}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confluence Stacks */}
      {topConfluence.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Top Confluence Combinations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topConfluence.map((stack, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-sm border',
                  stack.expectancy >= 0.5 ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'
                )}
              >
                <div className="text-xs text-muted-foreground mb-2">
                  {stack.conditions.join(' + ')}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    'text-xl font-bold',
                    stack.expectancy >= 0.5 ? 'text-green-500' : 'text-foreground'
                  )}>
                    {stack.expectancy}R
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stack.winRate}% WR (n={stack.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-card border border-border rounded-sm">
        <h3 className="text-sm font-semibold text-foreground mb-2">Verdict Guide</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 font-medium">Non-Negotiable</span>
            <span className="text-muted-foreground">Always require</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-medium">Beneficial</span>
            <span className="text-muted-foreground">Prefer when available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 font-medium">Optional</span>
            <span className="text-muted-foreground">No significant impact</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 font-medium">Remove</span>
            <span className="text-muted-foreground">Hurts performance</span>
          </div>
        </div>
      </div>
    </section>
  );
}
