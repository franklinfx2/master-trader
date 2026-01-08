import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Trade } from '@/hooks/useTrades';

interface SetupAnalysisChartProps {
  trades: Trade[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function SetupAnalysisChart({ trades }: SetupAnalysisChartProps) {
  const setupData = useMemo(() => {
    const setups = trades.reduce((acc, trade) => {
      // Use setup_type column if available, otherwise fall back to extracting from notes or pair
      const setup = trade.setup_type || trade.notes?.split(' ')[0] || trade.pair;
      
      if (!acc[setup]) {
        acc[setup] = { setup, wins: 0, losses: 0, total: 0, pnl: 0 };
      }
      
      acc[setup].total++;
      if (trade.result === 'win') acc[setup].wins++;
      if (trade.result === 'loss') acc[setup].losses++;
      if (trade.pnl) acc[setup].pnl += trade.pnl;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(setups)
      .map((s: any) => ({
        ...s,
        winRate: s.total > 0 ? (s.wins / (s.wins + s.losses)) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 setups
  }, [trades]);

  const chartConfig = {
    total: {
      label: 'Total Trades',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={setupData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ setup, total }) => `${setup} (${total})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
          >
            {setupData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, 'Trades']}
            labelFormatter={(label) => `Setup: ${label}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}