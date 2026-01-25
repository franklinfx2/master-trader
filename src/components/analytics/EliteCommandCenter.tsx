import { useMemo } from 'react';
import { EliteTrade } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target, Activity, BarChart3, Flame, Trophy, AlertTriangle } from 'lucide-react';

interface EliteCommandCenterProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  selectedSetups: string[];
  sessionFilter: 'LN' | 'NY' | 'all';
}

interface CommandMetrics {
  totalTrades: number;
  winRate: number;
  avgR: number;
  expectancy: number;
  profitFactor: number;
  maxDrawdown: number;
  totalR: number;
  maxWinStreak: number;
  maxLossStreak: number;
}

function calculateMetrics(trades: EliteTrade[]): CommandMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgR: 0,
      expectancy: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      totalR: 0,
      maxWinStreak: 0,
      maxLossStreak: 0,
    };
  }

  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const decided = wins + losses;

  const winRate = decided > 0 ? (wins / decided) * 100 : 0;

  const rMultiples = trades
    .filter(t => t.r_multiple !== undefined && t.r_multiple !== null)
    .map(t => t.r_multiple!);

  const totalR = rMultiples.reduce((sum, r) => sum + r, 0);
  const avgR = rMultiples.length > 0 ? totalR / rMultiples.length : 0;

  // Expectancy = (Win% × Avg Win R) - (Loss% × Avg Loss R)
  const winningRs = rMultiples.filter(r => r > 0);
  const losingRs = rMultiples.filter(r => r < 0);
  const avgWinR = winningRs.length > 0 ? winningRs.reduce((a, b) => a + b, 0) / winningRs.length : 0;
  const avgLossR = losingRs.length > 0 ? Math.abs(losingRs.reduce((a, b) => a + b, 0) / losingRs.length) : 0;
  const winPct = decided > 0 ? wins / decided : 0;
  const lossPct = decided > 0 ? losses / decided : 0;
  const expectancy = (winPct * avgWinR) - (lossPct * avgLossR);

  // Profit Factor = Gross Profit / Gross Loss
  const grossProfit = winningRs.reduce((sum, r) => sum + r, 0);
  const grossLoss = Math.abs(losingRs.reduce((sum, r) => sum + r, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Max Drawdown (peak to trough in R)
  let peak = 0;
  let maxDrawdown = 0;
  let cumulative = 0;
  for (const r of rMultiples) {
    cumulative += r;
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Win/Loss Streaks
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  
  for (const trade of trades) {
    if (trade.result === 'Win') {
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (trade.result === 'Loss') {
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }
  }

  return {
    totalTrades: trades.length,
    winRate: parseFloat(winRate.toFixed(1)),
    avgR: parseFloat(avgR.toFixed(2)),
    expectancy: parseFloat(expectancy.toFixed(2)),
    profitFactor: profitFactor === Infinity ? 999 : parseFloat(profitFactor.toFixed(2)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    totalR: parseFloat(totalR.toFixed(2)),
    maxWinStreak,
    maxLossStreak,
  };
}

export function EliteCommandCenter({
  trades,
  dateRange,
  selectedSetups,
  sessionFilter,
}: EliteCommandCenterProps) {
  const metrics = useMemo(() => {
    // Filter by date range
    const now = new Date();
    let filteredTrades = [...trades];

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filteredTrades = filteredTrades.filter(t => new Date(t.trade_date) >= cutoff);
    }

    // Filter by session
    if (sessionFilter !== 'all') {
      const sessionMap = { 'LN': 'London', 'NY': 'NY' };
      filteredTrades = filteredTrades.filter(t => t.session === sessionMap[sessionFilter]);
    }

    // Filter by selected setups
    if (selectedSetups.length > 0) {
      filteredTrades = filteredTrades.filter(t => selectedSetups.includes(t.setup_type));
    }

    return calculateMetrics(filteredTrades);
  }, [trades, dateRange, selectedSetups, sessionFilter]);

  const metricCards = [
    {
      label: 'Total Trades',
      value: metrics.totalTrades.toString(),
      icon: Activity,
      color: 'text-foreground',
    },
    {
      label: 'Win Rate',
      value: `${metrics.winRate}%`,
      icon: Target,
      color: metrics.winRate >= 50 ? 'text-green-500' : 'text-red-500',
      threshold: { good: 50, bad: 40 },
    },
    {
      label: 'Average R',
      value: `${metrics.avgR}R`,
      icon: metrics.avgR >= 0 ? TrendingUp : TrendingDown,
      color: metrics.avgR >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'Expectancy',
      value: `${metrics.expectancy}R`,
      icon: BarChart3,
      color: metrics.expectancy >= 0.3 ? 'text-green-500' : metrics.expectancy >= 0 ? 'text-amber-500' : 'text-red-500',
    },
    {
      label: 'Profit Factor',
      value: metrics.profitFactor >= 999 ? '∞' : metrics.profitFactor.toFixed(2),
      icon: Trophy,
      color: metrics.profitFactor >= 1.5 ? 'text-green-500' : metrics.profitFactor >= 1 ? 'text-amber-500' : 'text-red-500',
    },
    {
      label: 'Max Drawdown',
      value: `${metrics.maxDrawdown}R`,
      icon: AlertTriangle,
      color: metrics.maxDrawdown <= 3 ? 'text-green-500' : metrics.maxDrawdown <= 6 ? 'text-amber-500' : 'text-red-500',
    },
    {
      label: 'Total R',
      value: `${metrics.totalR >= 0 ? '+' : ''}${metrics.totalR}R`,
      icon: Flame,
      color: metrics.totalR >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'Best Streak',
      value: `${metrics.maxWinStreak}W / ${metrics.maxLossStreak}L`,
      icon: Activity,
      color: 'text-foreground',
    },
  ];

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Elite Performance Command Center
        </h2>
        <p className="text-xs text-muted-foreground">
          Top-level metrics from executed Elite Trades only
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-card border border-border p-4 rounded-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('h-4 w-4', card.color)} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
              <div className={cn('text-2xl font-bold', card.color)}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insufficient Data Warning */}
      {metrics.totalTrades < 10 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm">
          <p className="text-xs text-amber-400">
            ⚠️ Only {metrics.totalTrades} trades in sample. Metrics may not be statistically significant (recommend n≥30).
          </p>
        </div>
      )}
    </section>
  );
}
