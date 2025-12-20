import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { Trade } from '@/hooks/useTrades';

interface AIInsightCardProps {
  trades: Trade[];
  type: 'session' | 'time' | 'setup' | 'risk';
}

export function AIInsightCard({ trades, type }: AIInsightCardProps) {
  const generateInsight = () => {
    switch (type) {
      case 'session':
        return analyzeSession();
      case 'time':
        return analyzeTime();
      case 'setup':
        return analyzeSetup();
      case 'risk':
        return analyzeRisk();
      default:
        return { title: 'Analysis', insight: 'No data available', recommendation: '', status: 'neutral' as const };
    }
  };

  const analyzeSession = () => {
    const sessions = trades.reduce((acc, trade) => {
      if (!trade?.executed_at) return acc;
      const hour = new Date(trade.executed_at).getHours();
      if (isNaN(hour)) return acc;
      let session = 'Other';
      
      if (hour >= 0 && hour < 8) session = 'Asian';
      else if (hour >= 8 && hour < 12) session = 'London';
      else if (hour >= 12 && hour < 20) session = 'New York';
      else if (hour >= 20 && hour < 24) session = 'Sydney';
      
      if (!acc[session]) {
        acc[session] = { wins: 0, total: 0, pnl: 0 };
      }
      
      acc[session].total++;
      if (trade.result === 'win') acc[session].wins++;
      if (trade.pnl) acc[session].pnl += trade.pnl;
      
      return acc;
    }, {} as Record<string, any>);

    const bestSession = Object.entries(sessions)
      .map(([session, data]: [string, any]) => ({
        session,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        ...data,
      }))
      .sort((a, b) => b.winRate - a.winRate)[0];

    return {
      title: 'Best Trading Session',
      insight: bestSession ? `${bestSession.session} session shows highest performance` : 'Insufficient data',
      recommendation: bestSession ? `Focus on ${bestSession.session} session trades. Win rate: ${bestSession.winRate.toFixed(1)}%` : 'Record more trades for analysis',
      status: bestSession?.winRate > 60 ? 'positive' as const : bestSession?.winRate > 40 ? 'neutral' as const : 'negative' as const,
    };
  };

  const analyzeTime = () => {
    const hourlyData = Array.from({ length: 24 }, () => ({ wins: 0, total: 0 }));
    
    trades.forEach(trade => {
      if (!trade?.executed_at) return;
      const hour = new Date(trade.executed_at).getHours();
      if (isNaN(hour)) return;
      hourlyData[hour].total++;
      if (trade.result === 'win') hourlyData[hour].wins++;
    });

    const bestHour = hourlyData
      .map((data, hour) => ({
        hour,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        total: data.total,
      }))
      .filter(h => h.total >= 2)
      .sort((a, b) => b.winRate - a.winRate)[0];

    const displayHour = bestHour
      ? (
          bestHour.hour === 0
            ? '12 AM'
            : bestHour.hour === 12
              ? '12 PM'
              : bestHour.hour < 12
                ? `${bestHour.hour} AM`
                : `${bestHour.hour - 12} PM`
        )
      : 'N/A';

    return {
      title: 'Optimal Trading Time',
      insight: bestHour ? `Peak performance at ${displayHour}` : 'Need more data',
      recommendation: bestHour ? `Schedule trades around ${displayHour}. Win rate: ${bestHour.winRate.toFixed(1)}%` : 'Trade at consistent times to identify patterns',
      status: bestHour?.winRate > 70 ? 'positive' as const : 'neutral' as const,
    };
  };

  const analyzeSetup = () => {
    const setups = trades.reduce((acc, trade) => {
      const setup = trade.notes?.split(' ')[0] || trade.pair;
      
      if (!acc[setup]) {
        acc[setup] = { wins: 0, total: 0, pnl: 0 };
      }
      
      acc[setup].total++;
      if (trade.result === 'win') acc[setup].wins++;
      if (trade.pnl) acc[setup].pnl += trade.pnl;
      
      return acc;
    }, {} as Record<string, any>);

    const bestSetup = Object.entries(setups)
      .map(([setup, data]: [string, any]) => ({
        setup,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
        ...data,
      }))
      .filter(s => s.total >= 3)
      .sort((a, b) => b.winRate - a.winRate)[0];

    return {
      title: 'Most Profitable Setup',
      insight: bestSetup ? `${bestSetup.setup} setup performing best` : 'Need more setup data',
      recommendation: bestSetup ? `Focus on ${bestSetup.setup} setups. Win rate: ${bestSetup.winRate.toFixed(1)}%` : 'Document trade setups in notes for better analysis',
      status: bestSetup?.winRate > 65 ? 'positive' as const : 'neutral' as const,
    };
  };

  const analyzeRisk = () => {
    const avgRisk = trades.filter(t => t.risk_pct).reduce((sum, t) => sum + (t.risk_pct || 0), 0) / trades.filter(t => t.risk_pct).length;
    const avgRR = trades.filter(t => t.rr).reduce((sum, t) => sum + (t.rr || 0), 0) / trades.filter(t => t.rr).length;
    
    const riskStatus = avgRisk <= 2 ? 'positive' as const : avgRisk <= 5 ? 'neutral' as const : 'negative' as const;
    
    return {
      title: 'Risk Management',
      insight: `Average risk: ${avgRisk?.toFixed(1)}% | R:R: 1:${avgRR?.toFixed(2)}`,
      recommendation: avgRisk > 3 ? 'Consider reducing position sizes for better risk management' : 'Good risk management discipline',
      status: riskStatus,
    };
  };

  const { title, insight, recommendation, status } = generateInsight();

  const getIcon = () => {
    switch (type) {
      case 'session': return <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case 'time': return <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case 'setup': return <Target className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
      case 'risk': return status === 'positive' ? <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:pb-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="flex-shrink-0">{getIcon()}</span>
            <CardTitle className="text-xs sm:text-lg truncate">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className={`${getStatusColor()} text-[10px] sm:text-xs px-1.5 py-0.5 w-fit`}>
            {status === 'positive' ? 'Strong' : status === 'negative' ? 'Needs Work' : 'Mod'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-sm font-medium line-clamp-2">{insight}</p>
          <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">{recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}