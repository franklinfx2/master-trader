import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trade } from '@/hooks/useTrades';

interface RulesFollowedChartProps {
  trades: Trade[];
}

export function RulesFollowedChart({ trades }: RulesFollowedChartProps) {
  const rulesData = useMemo(() => {
    const stats = {
      followed: { label: 'Rules Followed', wins: 0, losses: 0, total: 0, winRate: 0 },
      broken: { label: 'Rules Broken', wins: 0, losses: 0, total: 0, winRate: 0 },
    };

    trades.forEach(trade => {
      const followed = trade.rules_followed === 'Yes';
      const key = followed ? 'followed' : 'broken';
      stats[key].total++;
      if (trade.result === 'win') stats[key].wins++;
      if (trade.result === 'loss') stats[key].losses++;
    });

    return Object.values(stats)
      .map(s => ({
        ...s,
        winRate: s.wins + s.losses > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0,
      }))
      .filter(s => s.total > 0);
  }, [trades]);

  const chartConfig = {
    winRate: {
      label: 'Win Rate (%)',
      color: 'hsl(var(--primary))',
    },
  };

  if (rulesData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No rules data available
      </div>
    );
  }

  const colors = ['hsl(var(--profit))', 'hsl(var(--loss))'];

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rulesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={[0, 100]} />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}%`,
              'Win Rate'
            ]}
          />
          <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
            {rulesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
