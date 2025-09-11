import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trade } from '@/hooks/useTrades';

interface TradingSessionChartProps {
  trades: Trade[];
}

const sessionColors = {
  'Asian': 'hsl(var(--chart-1))',
  'London': 'hsl(var(--chart-2))',
  'New York': 'hsl(var(--chart-3))',
  'Sydney': 'hsl(var(--chart-4))',
};

export function TradingSessionChart({ trades }: TradingSessionChartProps) {
  const sessionData = useMemo(() => {
    const sessions = trades.reduce((acc, trade) => {
      if (!trade?.executed_at) return acc;
      const hour = new Date(trade.executed_at).getHours();
      if (isNaN(hour)) return acc;
      let session = 'Other';
      
      // Determine session based on UTC hour
      if (hour >= 0 && hour < 8) session = 'Asian';
      else if (hour >= 8 && hour < 12) session = 'London';
      else if (hour >= 12 && hour < 20) session = 'New York';
      else if (hour >= 20 && hour < 24) session = 'Sydney';
      
      if (!acc[session]) {
        acc[session] = { session, wins: 0, losses: 0, total: 0, pnl: 0, winRate: 0 };
      }
      
      acc[session].total++;
      if (trade.result === 'win') acc[session].wins++;
      if (trade.result === 'loss') acc[session].losses++;
      if (trade.pnl) acc[session].pnl += trade.pnl;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(sessions).map((s: any) => ({
      ...s,
      winRate: s.total > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0,
    }));
  }, [trades]);

  const chartConfig = {
    winRate: {
      label: 'Win Rate (%)',
      color: 'hsl(var(--primary))',
    },
    total: {
      label: 'Total Trades',
      color: 'hsl(var(--muted-foreground))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sessionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="session" />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value, name) => [
              name === 'winRate' ? `${Number(value).toFixed(1)}%` : value,
              name === 'winRate' ? 'Win Rate' : 'Total Trades'
            ]}
          />
          <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
            {sessionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={sessionColors[entry.session as keyof typeof sessionColors] || 'hsl(var(--muted))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}