import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EliteTrade } from '@/types/eliteTrade';

// Define mistake tags based on trade attributes that indicate mistakes
const MISTAKE_INDICATORS = [
  { tag: 'Rules Broken', field: 'rules_followed', condition: (v: string) => v === 'No' },
  { tag: 'Revenge Trade', field: 'revenge_trade', condition: (v: string) => v === 'Yes' },
  { tag: 'FOMO Entry', field: 'pre_trade_state', condition: (v: string) => v === 'FOMO' },
  { tag: 'Overconfident', field: 'pre_trade_state', condition: (v: string) => v === 'Overconfident' },
  { tag: 'Late Entry', field: 'entry_precision', condition: (v: string) => v === 'Late' },
  { tag: 'Wide Stop', field: 'stop_placement_quality', condition: (v: string) => v === 'Wide' },
  { tag: 'Tight Stop', field: 'stop_placement_quality', condition: (v: string) => v === 'Tight' },
  { tag: 'No Confirmation', field: 'confirmation_present', condition: (v: string) => v === 'No' },
  { tag: 'Traded Fatigue', field: 'fatigue_present', condition: (v: string) => v === 'Yes' },
  { tag: 'Against Liquidity', field: 'liquidity_taken_against_bias', condition: (v: string) => v === 'Yes' },
  { tag: 'Trash Setup', field: 'setup_grade', condition: (v: string) => v === 'Trash' },
] as const;

interface MistakeData {
  tag: string;
  frequency: number;
  avgRLost: number;
  severityScore: number;
  relevantSetups: string[];
}

interface MistakePatternSectionProps {
  trades: EliteTrade[];
  dateRange: string;
  activeSetup: string | null;
}

export function MistakePatternSection({
  trades,
  dateRange,
  activeSetup,
}: MistakePatternSectionProps) {
  const mistakeData = useMemo(() => {
    // Filter trades by date range
    const now = new Date();
    const filteredTrades = trades.filter(trade => {
      if (dateRange === 'all') return true;
      const tradeDate = new Date(trade.trade_date);
      const daysAgo = (now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= parseInt(dateRange);
    });

    // Analyze each mistake indicator
    const mistakeMap = new Map<string, {
      trades: EliteTrade[];
      setups: Set<string>;
    }>();

    filteredTrades.forEach(trade => {
      MISTAKE_INDICATORS.forEach(indicator => {
        const fieldValue = trade[indicator.field as keyof EliteTrade] as string;
        if (fieldValue && indicator.condition(fieldValue)) {
          const existing = mistakeMap.get(indicator.tag) || { trades: [], setups: new Set() };
          existing.trades.push(trade);
          existing.setups.add(trade.setup_type);
          mistakeMap.set(indicator.tag, existing);
        }
      });
    });

    // Calculate metrics for each mistake
    const mistakes: MistakeData[] = [];
    
    mistakeMap.forEach((data, tag) => {
      // Calculate Avg R Lost (only from losing trades with this mistake)
      const losingTrades = data.trades.filter(t => 
        t.result === 'Loss' && t.r_multiple !== null
      );
      
      const totalRLost = losingTrades.reduce((sum, t) => 
        sum + Math.abs(t.r_multiple || 0), 0
      );
      
      const avgRLost = losingTrades.length > 0 
        ? totalRLost / losingTrades.length 
        : 0;

      // Severity = frequency * avgRLost (weighted impact)
      const severityScore = data.trades.length * avgRLost;

      mistakes.push({
        tag,
        frequency: data.trades.length,
        avgRLost,
        severityScore,
        relevantSetups: Array.from(data.setups),
      });
    });

    // Sort by Avg R Lost descending (worst mistakes first)
    return mistakes.sort((a, b) => b.avgRLost - a.avgRLost);
  }, [trades, dateRange]);

  // Filter by active setup if selected
  const displayedMistakes = useMemo(() => {
    if (!activeSetup) return mistakeData;
    return mistakeData.filter(m => m.relevantSetups.includes(activeSetup));
  }, [mistakeData, activeSetup]);

  // Get heat color based on Avg R Lost
  const getHeatColor = (avgRLost: number): string => {
    if (avgRLost <= 0.5) {
      return 'bg-destructive/10';
    } else if (avgRLost <= 1.0) {
      return 'bg-destructive/25';
    } else if (avgRLost <= 1.5) {
      return 'bg-destructive/40';
    } else {
      return 'bg-destructive/60';
    }
  };

  const getTextHeatColor = (avgRLost: number): string => {
    if (avgRLost <= 0.5) {
      return 'text-muted-foreground';
    } else if (avgRLost <= 1.0) {
      return 'text-amber-400';
    } else if (avgRLost <= 1.5) {
      return 'text-orange-400';
    } else {
      return 'text-red-400';
    }
  };

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Mistake Pattern Analysis
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          What is actually costing you money
        </p>
      </div>

      {/* Heatmap Table */}
      <div className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Mistake Tag
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center whitespace-nowrap">
                  Frequency
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center whitespace-nowrap">
                  Avg R Lost
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center whitespace-nowrap">
                  Severity Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedMistakes.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={4} 
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    {activeSetup 
                      ? `No mistake patterns found for ${activeSetup}`
                      : 'No mistake patterns detected'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                displayedMistakes.map((mistake) => (
                  <TableRow 
                    key={mistake.tag}
                    className={`border-border ${getHeatColor(mistake.avgRLost)}`}
                  >
                    <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">
                      {mistake.tag}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-center">
                      {mistake.frequency}
                    </TableCell>
                    <TableCell className={`text-sm font-medium text-center ${getTextHeatColor(mistake.avgRLost)}`}>
                      {mistake.avgRLost.toFixed(2)}R
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-center">
                      {mistake.severityScore.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
