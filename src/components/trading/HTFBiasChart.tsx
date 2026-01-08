import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trade } from '@/hooks/useTrades';

interface HTFBiasChartProps {
  trades: Trade[];
}

const biasColors = {
  'Bullish': 'hsl(var(--profit))',
  'Bearish': 'hsl(var(--loss))',
  'Neutral': 'hsl(var(--muted-foreground))',
};

export function HTFBiasChart({ trades }: HTFBiasChartProps) {
  const biasData = useMemo(() => {
    const stats: Record<string, { bias: string; wins: number; losses: number; total: number; winRate: number }> = {};

    trades.forEach(trade => {
      const bias = trade.htf_bias || 'Neutral';
      if (!stats[bias]) {
        stats[bias] = { bias, wins: 0, losses: 0, total: 0, winRate: 0 };
      }
      stats[bias].total++;
      if (trade.result === 'win') stats[bias].wins++;
      if (trade.result === 'loss') stats[bias].losses++;
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

  if (biasData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No HTF bias data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={biasData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bias" />
          <YAxis domain={[0, 100]} />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}%`,
              'Win Rate'
            ]}
          />
          <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
            {biasData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={biasColors[entry.bias as keyof typeof biasColors] || 'hsl(var(--muted))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
