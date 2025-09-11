import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trade } from '@/hooks/useTrades';

interface TimeOfDayChartProps {
  trades: Trade[];
}

export function TimeOfDayChart({ trades }: TimeOfDayChartProps) {
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      displayHour: i === 0 ? '12 AM' : i === 12 ? '12 PM' : i < 12 ? `${i} AM` : `${i - 12} PM`,
      wins: 0,
      losses: 0,
      total: 0,
      winRate: 0,
      pnl: 0,
    }));

    trades.forEach(trade => {
      if (!trade?.executed_at) return;
      const hour = new Date(trade.executed_at).getHours();
      if (isNaN(hour)) return;
      hours[hour].total++;
      if (trade.result === 'win') hours[hour].wins++;
      if (trade.result === 'loss') hours[hour].losses++;
      if (trade.pnl) hours[hour].pnl += trade.pnl;
    });

    return hours.map(h => ({
      ...h,
      winRate: h.total > 0 ? (h.wins / (h.wins + h.losses)) * 100 : 0,
    })).filter(h => h.total > 0);
  }, [trades]);

  const chartConfig = {
    winRate: {
      label: 'Win Rate (%)',
      color: 'hsl(var(--primary))',
    },
    pnl: {
      label: 'P&L',
      color: 'hsl(var(--profit))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="displayHour" 
            interval={2}
            fontSize={10}
          />
          <YAxis />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            formatter={(value, name) => [
              name === 'winRate' ? `${Number(value).toFixed(1)}%` : value,
              name === 'winRate' ? 'Win Rate' : 'P&L'
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="winRate" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}