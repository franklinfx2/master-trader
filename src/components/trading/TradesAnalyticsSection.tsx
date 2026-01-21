import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/hooks/useTrades';
import { SetupAnalysisChart } from './SetupAnalysisChart';
import { TradingSessionChart } from './TradingSessionChart';
import { TimeOfDayChart } from './TimeOfDayChart';
import { TradeGradeChart } from './TradeGradeChart';
import { RulesFollowedChart } from './RulesFollowedChart';
import { HTFBiasChart } from './HTFBiasChart';
import { AITradingRules } from './AITradingRules';
import { TrendingUp, TrendingDown, Target, BarChart3, Clock, Award } from 'lucide-react';

interface TradesAnalyticsSectionProps {
  trades: Trade[];
}

export function TradesAnalyticsSection({ trades }: TradesAnalyticsSectionProps) {
  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.result === 'win' || t.result === 'loss');
    const wins = closedTrades.filter(t => t.result === 'win').length;
    const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
    const avgRR = trades.reduce((sum, t) => sum + (t.rr || 0), 0) / (trades.filter(t => t.rr).length || 1);
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    // Best session calculation
    const sessionStats: Record<string, { wins: number; total: number }> = {};
    closedTrades.forEach(t => {
      const session = t.session || 'Unknown';
      if (!sessionStats[session]) sessionStats[session] = { wins: 0, total: 0 };
      sessionStats[session].total++;
      if (t.result === 'win') sessionStats[session].wins++;
    });
    
    let bestSession = 'N/A';
    let bestSessionWinRate = 0;
    Object.entries(sessionStats).forEach(([session, data]) => {
      const rate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
      if (rate > bestSessionWinRate && data.total >= 3) {
        bestSessionWinRate = rate;
        bestSession = session;
      }
    });

    // Best setup calculation
    const setupStats: Record<string, { wins: number; total: number }> = {};
    closedTrades.forEach(t => {
      const setup = t.setup_type || 'Unclassified';
      if (!setupStats[setup]) setupStats[setup] = { wins: 0, total: 0 };
      setupStats[setup].total++;
      if (t.result === 'win') setupStats[setup].wins++;
    });
    
    let bestSetup = 'N/A';
    let bestSetupWinRate = 0;
    Object.entries(setupStats).forEach(([setup, data]) => {
      const rate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
      if (rate > bestSetupWinRate && data.total >= 3) {
        bestSetupWinRate = rate;
        bestSetup = setup;
      }
    });

    return {
      totalTrades: trades.length,
      winRate,
      avgRR,
      totalPnL,
      bestSession,
      bestSetup,
    };
  }, [trades]);

  if (trades.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No trades to analyze yet.</p>
          <p className="text-sm text-muted-foreground">Add some trades to see analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Trading Rules */}
      <AITradingRules trades={trades} />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalTrades}</p>
            <p className="text-xs text-muted-foreground">Total Trades</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.avgRR.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Avg R:R</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            {stats.totalPnL >= 0 ? (
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-profit" />
            ) : (
              <TrendingDown className="w-5 h-5 mx-auto mb-2 text-loss" />
            )}
            <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Total P&L</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold truncate">{stats.bestSession}</p>
            <p className="text-xs text-muted-foreground">Best Session</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Award className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold truncate">{stats.bestSetup}</p>
            <p className="text-xs text-muted-foreground">Best Setup</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Session Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <TradingSessionChart trades={trades} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeOfDayChart trades={trades} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Setup Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SetupAnalysisChart trades={trades} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trade Grade Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeGradeChart trades={trades} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rules Discipline</CardTitle>
          </CardHeader>
          <CardContent>
            <RulesFollowedChart trades={trades} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">HTF Bias Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <HTFBiasChart trades={trades} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
