import { useMemo } from 'react';
import { EliteTrade, SETUP_TYPES, SetupType } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';

interface SetupEdgeScoreSectionProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  selectedSetups: string[];
  sessionFilter: 'LN' | 'NY' | 'all';
  activeSetup: string | null;
  onSetupClick: (setup: string) => void;
}

interface SetupMetrics {
  setup: SetupType;
  edgeScore: number;
  winRate: number;
  avgR: number;
  expectancy: number;
  maxDrawdown: number;
  sampleSize: number;
}

function getEdgeColor(edgeScore: number): { text: string; accent: string } {
  if (edgeScore < 0.5) {
    return { text: 'text-red-500', accent: 'border-red-500/30' };
  } else if (edgeScore <= 1.2) {
    return { text: 'text-amber-500', accent: 'border-amber-500/30' };
  } else {
    return { text: 'text-green-500', accent: 'border-green-500/30' };
  }
}

export function SetupEdgeScoreSection({
  trades,
  dateRange,
  selectedSetups,
  sessionFilter,
  activeSetup,
  onSetupClick,
}: SetupEdgeScoreSectionProps) {
  const setupMetrics = useMemo(() => {
    // Filter trades by date range
    const now = new Date();
    let filteredTrades = trades.filter(t => t.classification_status === 'fully_classified');
    
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
    
    // Filter by selected setups if any
    if (selectedSetups.length > 0) {
      filteredTrades = filteredTrades.filter(t => selectedSetups.includes(t.setup_type));
    }

    // Calculate metrics per setup
    const metrics: SetupMetrics[] = SETUP_TYPES.map(setup => {
      const setupTrades = filteredTrades.filter(t => t.setup_type === setup);
      const wins = setupTrades.filter(t => t.result === 'Win').length;
      const losses = setupTrades.filter(t => t.result === 'Loss').length;
      const totalDecided = wins + losses;
      
      const winRate = totalDecided > 0 ? (wins / totalDecided) * 100 : 0;
      
      const rMultiples = setupTrades
        .filter(t => t.r_multiple !== undefined && t.r_multiple !== null)
        .map(t => t.r_multiple!);
      
      const avgR = rMultiples.length > 0 
        ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length 
        : 0;
      
      // Expectancy = (Win% × Avg Win R) - (Loss% × Avg Loss R)
      const winningRs = rMultiples.filter(r => r > 0);
      const losingRs = rMultiples.filter(r => r < 0);
      const avgWinR = winningRs.length > 0 
        ? winningRs.reduce((a, b) => a + b, 0) / winningRs.length 
        : 0;
      const avgLossR = losingRs.length > 0 
        ? Math.abs(losingRs.reduce((a, b) => a + b, 0) / losingRs.length)
        : 0;
      const winPct = totalDecided > 0 ? wins / totalDecided : 0;
      const lossPct = totalDecided > 0 ? losses / totalDecided : 0;
      const expectancy = (winPct * avgWinR) - (lossPct * avgLossR);
      
      // Max drawdown (largest consecutive loss streak in R)
      let maxDrawdown = 0;
      let currentDrawdown = 0;
      for (const r of rMultiples) {
        if (r < 0) {
          currentDrawdown += Math.abs(r);
          maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
        } else {
          currentDrawdown = 0;
        }
      }
      
      // Edge Score = Expectancy × sqrt(sample size) / 10
      // Normalized to give meaningful values
      const sampleSize = setupTrades.length;
      const edgeScore = sampleSize > 0 
        ? (expectancy * Math.sqrt(sampleSize)) / 10
        : 0;

      return {
        setup,
        edgeScore: parseFloat(edgeScore.toFixed(2)),
        winRate: parseFloat(winRate.toFixed(1)),
        avgR: parseFloat(avgR.toFixed(2)),
        expectancy: parseFloat(expectancy.toFixed(2)),
        maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
        sampleSize,
      };
    });

    return metrics;
  }, [trades, dateRange, selectedSetups, sessionFilter]);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Setup Edge Score
        </h2>
        <p className="text-xs text-muted-foreground">
          Which setups deserve capital
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {setupMetrics.map((metric) => {
          const colors = getEdgeColor(metric.edgeScore);
          const isActive = activeSetup === metric.setup;
          
          return (
            <button
              key={metric.setup}
              onClick={() => onSetupClick(metric.setup)}
              className={cn(
                'relative p-5 text-left transition-all duration-150',
                'bg-card border border-border',
                'hover:border-muted-foreground/50',
                isActive && 'ring-2 ring-primary border-primary',
                colors.accent
              )}
            >
              {/* Setup Name */}
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {metric.setup}
              </div>
              
              {/* Edge Score - Prominent */}
              <div className={cn('text-4xl font-bold mb-4', colors.text)}>
                {metric.edgeScore.toFixed(2)}
              </div>
              
              {/* Supporting Metrics */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className="font-medium text-foreground">{metric.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg R</span>
                  <span className="font-medium text-foreground">{metric.avgR}R</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expectancy</span>
                  <span className="font-medium text-foreground">{metric.expectancy}R</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max DD</span>
                  <span className="font-medium text-foreground">{metric.maxDrawdown}R</span>
                </div>
                <div className="col-span-2 flex justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Sample Size</span>
                  <span className="font-medium text-foreground">{metric.sampleSize}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
