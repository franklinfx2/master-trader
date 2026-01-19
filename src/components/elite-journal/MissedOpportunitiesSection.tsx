// ELITE BACKTESTING ENGINE — Missed Opportunities Analysis
// Shows missed trades with hypothetical results for opportunity cost analysis
import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Eye } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EliteTrade } from '@/types/eliteTrade';
import { EliteTradeCard } from './EliteTradeCard';

interface MissedOpportunitiesSectionProps {
  trades: EliteTrade[];
  onUpdate?: () => void;
}

export const MissedOpportunitiesSection = ({ trades, onUpdate }: MissedOpportunitiesSectionProps) => {
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
          <EliteTradeCard 
            key={trade.id} 
            trade={trade} 
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default MissedOpportunitiesSection;
