import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trade } from '@/hooks/useTrades';

interface TradeGradeChartProps {
  trades: Trade[];
}

const gradeColors = {
  'A': 'hsl(var(--chart-1))',
  'B': 'hsl(var(--chart-2))',
  'C': 'hsl(var(--chart-3))',
};

export function TradeGradeChart({ trades }: TradeGradeChartProps) {
  const gradeData = useMemo(() => {
    const grades: Record<string, { grade: string; wins: number; losses: number; total: number; winRate: number }> = {
      'A': { grade: 'A', wins: 0, losses: 0, total: 0, winRate: 0 },
      'B': { grade: 'B', wins: 0, losses: 0, total: 0, winRate: 0 },
      'C': { grade: 'C', wins: 0, losses: 0, total: 0, winRate: 0 },
    };

    trades.forEach(trade => {
      const grade = trade.trade_grade || 'B';
      if (grades[grade]) {
        grades[grade].total++;
        if (trade.result === 'win') grades[grade].wins++;
        if (trade.result === 'loss') grades[grade].losses++;
      }
    });

    return Object.values(grades)
      .map(g => ({
        ...g,
        winRate: g.wins + g.losses > 0 ? (g.wins / (g.wins + g.losses)) * 100 : 0,
      }))
      .filter(g => g.total > 0);
  }, [trades]);

  const chartConfig = {
    winRate: {
      label: 'Win Rate (%)',
      color: 'hsl(var(--primary))',
    },
  };

  if (gradeData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No trade grade data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={gradeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis domain={[0, 100]} />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}%`,
              'Win Rate'
            ]}
          />
          <Bar dataKey="winRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
            {gradeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={gradeColors[entry.grade as keyof typeof gradeColors] || 'hsl(var(--muted))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
