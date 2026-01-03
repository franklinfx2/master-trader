// ELITE BACKTESTING ENGINE — Missed Opportunities Analysis
// Shows missed trades with hypothetical results for opportunity cost analysis
import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EliteTrade, MISSED_REASONS } from '@/types/eliteTrade';

interface MissedOpportunitiesSectionProps {
  trades: EliteTrade[];
  onTradeClick?: (trade: EliteTrade) => void;
}

export const MissedOpportunitiesSection = ({ trades, onTradeClick }: MissedOpportunitiesSectionProps) => {
  // Filter only missed trades
  const missedTrades = useMemo(() => 
    trades.filter(t => t.trade_status === 'Missed'),
    [trades]
  );

  // Calculate opportunity cost statistics
  const stats = useMemo(() => {
    if (missedTrades.length === 0) return null;

    const byResult = {
      Win: missedTrades.filter(t => t.hypothetical_result === 'Win'),
      Loss: missedTrades.filter(t => t.hypothetical_result === 'Loss'),
      BE: missedTrades.filter(t => t.hypothetical_result === 'BE'),
      Unknown: missedTrades.filter(t => t.hypothetical_result === 'Unknown' || !t.hypothetical_result),
    };

    const byReason: Record<string, number> = {};
    missedTrades.forEach(t => {
      const reason = t.missed_reason || 'Unknown';
      byReason[reason] = (byReason[reason] || 0) + 1;
    });

    // Calculate potential R lost (from would-be wins)
    const potentialRLost = byResult.Win.reduce((sum, t) => sum + (t.rr_planned || 0), 0);
    
    // Calculate R saved (from avoided losses)
    const rSaved = byResult.Loss.length; // Each loss avoided = 1R saved

    return {
      total: missedTrades.length,
      wins: byResult.Win.length,
      losses: byResult.Loss.length,
      breakeven: byResult.BE.length,
      unknown: byResult.Unknown.length,
      byReason,
      potentialRLost,
      rSaved,
      netOpportunityCost: potentialRLost - rSaved,
      winRate: byResult.Win.length / (byResult.Win.length + byResult.Loss.length + byResult.BE.length) * 100 || 0,
    };
  }, [missedTrades]);

  if (missedTrades.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Eye className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Missed Opportunities</h3>
          <p className="text-muted-foreground">
            All your valid setups have been executed. Great discipline!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Opportunity Cost Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Missed</div>
            <div className="text-2xl font-bold mt-1">{stats?.total}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
              <TrendingUp className="w-3 h-3 text-green-500" />
              Would-Be Wins
            </div>
            <div className="text-2xl font-bold mt-1 text-green-500">{stats?.wins}</div>
            <div className="text-xs text-muted-foreground">-{stats?.potentialRLost.toFixed(1)}R lost</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wide">
              <TrendingDown className="w-3 h-3 text-red-500" />
              Avoided Losses
            </div>
            <div className="text-2xl font-bold mt-1 text-red-500">{stats?.losses}</div>
            <div className="text-xs text-muted-foreground">+{stats?.rSaved.toFixed(1)}R saved</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Hypo. Win Rate</div>
            <div className="text-2xl font-bold mt-1">{stats?.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className={cn(
          "glass-card",
          (stats?.netOpportunityCost || 0) > 0 ? "border-amber-500/30" : "border-green-500/30"
        )}>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Net Opportunity Cost</div>
            <div className={cn(
              "text-2xl font-bold mt-1",
              (stats?.netOpportunityCost || 0) > 0 ? "text-amber-500" : "text-green-500"
            )}>
              {(stats?.netOpportunityCost || 0) > 0 ? '-' : '+'}{Math.abs(stats?.netOpportunityCost || 0).toFixed(1)}R
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reason Breakdown */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Why You Missed Trades
          </CardTitle>
          <CardDescription>Pattern recognition for missed opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats?.byReason && Object.entries(stats.byReason)
              .sort((a, b) => b[1] - a[1])
              .map(([reason, count]) => (
                <Badge 
                  key={reason} 
                  variant="outline" 
                  className={cn(
                    "text-sm py-1 px-3",
                    reason === 'Hesitation' && "border-amber-500/50 bg-amber-500/10",
                    reason === 'Fear' && "border-red-500/50 bg-red-500/10",
                    reason === 'Away' && "border-blue-500/50 bg-blue-500/10",
                    reason === 'Technical' && "border-purple-500/50 bg-purple-500/10",
                  )}
                >
                  {reason}: {count} ({((count / (stats?.total || 1)) * 100).toFixed(0)}%)
                </Badge>
              ))
            }
          </div>
        </CardContent>
      </Card>

      {/* Missed Trades List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Missed Trade Details
        </h3>
        {missedTrades.map((trade) => (
          <MissedTradeCard 
            key={trade.id} 
            trade={trade} 
            onClick={() => onTradeClick?.(trade)}
          />
        ))}
      </div>
    </div>
  );
};

// Individual missed trade card
const MissedTradeCard = ({ trade, onClick }: { trade: EliteTrade; onClick?: () => void }) => {
  const resultColor = {
    Win: 'text-green-500 bg-green-500/10 border-green-500/30',
    Loss: 'text-red-500 bg-red-500/10 border-red-500/30',
    BE: 'text-muted-foreground bg-muted/50 border-border',
    Unknown: 'text-muted-foreground bg-muted/50 border-border',
  };

  const reasonIcon = {
    Hesitation: '⏳',
    Fear: '😰',
    Away: '🚶',
    Technical: '⚙️',
    Other: '❓',
  };

  return (
    <Card 
      className="glass-card cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Date & Setup Info */}
          <div className="flex items-center gap-4">
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold">{format(new Date(trade.trade_date), 'dd')}</div>
              <div className="text-xs text-muted-foreground">{format(new Date(trade.trade_date), 'MMM yyyy')}</div>
            </div>
            
            <div className="border-l border-border pl-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                  Missed
                </Badge>
                <span className="font-medium">{trade.setup_type}</span>
                <Badge variant="secondary">{trade.setup_grade}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {trade.session} • {trade.instrument} • {trade.day_of_week}
              </div>
            </div>
          </div>

          {/* Right: Reason & Result */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <span>{reasonIcon[trade.missed_reason as keyof typeof reasonIcon] || '❓'}</span>
                <span className="text-muted-foreground">{trade.missed_reason || 'Unknown'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Planned RR: {trade.rr_planned}:1
              </div>
            </div>
            
            <Badge 
              variant="outline"
              className={cn(
                "min-w-[80px] justify-center",
                resultColor[trade.hypothetical_result as keyof typeof resultColor] || resultColor.Unknown
              )}
            >
              {trade.hypothetical_result === 'Win' && `+${trade.rr_planned}R`}
              {trade.hypothetical_result === 'Loss' && '-1R'}
              {trade.hypothetical_result === 'BE' && '0R'}
              {(!trade.hypothetical_result || trade.hypothetical_result === 'Unknown') && '?'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissedOpportunitiesSection;
