import { useMemo } from 'react';
import { EliteTrade, SetupGrade } from '@/types/eliteTrade';
import { cn } from '@/lib/utils';

interface SetupQualityMatrixProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
  selectedSetups: string[];
  sessionFilter: 'LN' | 'NY' | 'all';
}

interface QualityCell {
  setupType: string;
  grade: SetupGrade;
  tradeCount: number;
  winRate: number;
  avgR: number;
  expectancy: number;
  totalR: number;
}

interface MatrixRow {
  setupType: string;
  cells: Record<SetupGrade, QualityCell | null>;
  totalTrades: number;
  bestGrade: SetupGrade | null;
}

const GRADES: SetupGrade[] = ['A+', 'A', 'B', 'Trash'];

function calculateCellMetrics(trades: EliteTrade[]): Omit<QualityCell, 'setupType' | 'grade'> {
  if (trades.length === 0) {
    return { tradeCount: 0, winRate: 0, avgR: 0, expectancy: 0, totalR: 0 };
  }

  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const decided = wins + losses;

  const winRate = decided > 0 ? (wins / decided) * 100 : 0;

  const rMultiples = trades
    .filter(t => t.r_multiple !== undefined && t.r_multiple !== null)
    .map(t => t.r_multiple!);

  const totalR = rMultiples.reduce((sum, r) => sum + r, 0);
  const avgR = rMultiples.length > 0 ? totalR / rMultiples.length : 0;

  // Expectancy
  const winningRs = rMultiples.filter(r => r > 0);
  const losingRs = rMultiples.filter(r => r < 0);
  const avgWinR = winningRs.length > 0 ? winningRs.reduce((a, b) => a + b, 0) / winningRs.length : 0;
  const avgLossR = losingRs.length > 0 ? Math.abs(losingRs.reduce((a, b) => a + b, 0) / losingRs.length) : 0;
  const winPct = decided > 0 ? wins / decided : 0;
  const lossPct = decided > 0 ? losses / decided : 0;
  const expectancy = (winPct * avgWinR) - (lossPct * avgLossR);

  return {
    tradeCount: trades.length,
    winRate: parseFloat(winRate.toFixed(1)),
    avgR: parseFloat(avgR.toFixed(2)),
    expectancy: parseFloat(expectancy.toFixed(2)),
    totalR: parseFloat(totalR.toFixed(2)),
  };
}

function getExpectancyColor(expectancy: number): string {
  if (expectancy >= 0.5) return 'bg-green-500/20 border-green-500/30';
  if (expectancy >= 0) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/20 border-red-500/30';
}

function getTextColor(expectancy: number): string {
  if (expectancy >= 0.5) return 'text-green-500';
  if (expectancy >= 0) return 'text-amber-500';
  return 'text-red-500';
}

export function SetupQualityMatrix({
  trades,
  dateRange,
  selectedSetups,
  sessionFilter,
}: SetupQualityMatrixProps) {
  const matrixData = useMemo(() => {
    // Filter by date range
    const now = new Date();
    let filteredTrades = [...trades];

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filteredTrades = filteredTrades.filter(t => new Date(t.trade_date) >= cutoff);
    }

    // Filter by session
    if (sessionFilter !== 'all') {
      const sessionMap = { 'LN': 'London', 'NY': 'NY' };
      filteredTrades = filteredTrades.filter(t => t.session === sessionMap[sessionFilter]);
    }

    // Filter by selected setups
    if (selectedSetups.length > 0) {
      filteredTrades = filteredTrades.filter(t => selectedSetups.includes(t.setup_type));
    }

    // Get unique setup types
    const setupTypes = [...new Set(filteredTrades.map(t => t.setup_type))].sort();

    // Build matrix rows
    const rows: MatrixRow[] = setupTypes.map(setupType => {
      const setupTrades = filteredTrades.filter(t => t.setup_type === setupType);
      
      const cells: Record<SetupGrade, QualityCell | null> = {
        'A+': null,
        'A': null,
        'B': null,
        'Trash': null,
      };

      let bestGrade: SetupGrade | null = null;
      let bestExpectancy = -Infinity;

      for (const grade of GRADES) {
        const gradeTrades = setupTrades.filter(t => t.setup_grade === grade);
        if (gradeTrades.length > 0) {
          const metrics = calculateCellMetrics(gradeTrades);
          cells[grade] = {
            setupType,
            grade,
            ...metrics,
          };
          
          if (metrics.expectancy > bestExpectancy && metrics.tradeCount >= 3) {
            bestExpectancy = metrics.expectancy;
            bestGrade = grade;
          }
        }
      }

      return {
        setupType,
        cells,
        totalTrades: setupTrades.length,
        bestGrade,
      };
    });

    // Sort by total trades descending
    return rows.sort((a, b) => b.totalTrades - a.totalTrades);
  }, [trades, dateRange, selectedSetups, sessionFilter]);

  // Calculate column summaries (best setup per grade)
  const columnSummaries = useMemo(() => {
    const summaries: Record<SetupGrade, { setup: string; expectancy: number } | null> = {
      'A+': null,
      'A': null,
      'B': null,
      'Trash': null,
    };

    for (const grade of GRADES) {
      let bestSetup = '';
      let bestExpectancy = -Infinity;

      for (const row of matrixData) {
        const cell = row.cells[grade];
        if (cell && cell.expectancy > bestExpectancy && cell.tradeCount >= 3) {
          bestExpectancy = cell.expectancy;
          bestSetup = cell.setupType;
        }
      }

      if (bestSetup) {
        summaries[grade] = { setup: bestSetup, expectancy: bestExpectancy };
      }
    }

    return summaries;
  }, [matrixData]);

  if (matrixData.length === 0) {
    return (
      <section className="space-y-4 mt-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Setup Quality Matrix
          </h2>
          <p className="text-xs text-muted-foreground">
            Setup × Grade cross-tabulation
          </p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No trades with setup and grade data found.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 mt-8">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Setup Quality Matrix
        </h2>
        <p className="text-xs text-muted-foreground">
          Which setup × grade combinations deserve capital
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Setup
              </th>
              {GRADES.map(grade => (
                <th key={grade} className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {grade}
                </th>
              ))}
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Best Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row, index) => (
              <tr
                key={row.setupType}
                className={cn(
                  'border-b border-border last:border-b-0 transition-colors',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                )}
              >
                {/* Setup Name */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{row.setupType}</span>
                    <span className="text-xs text-muted-foreground">{row.totalTrades} trades</span>
                  </div>
                </td>

                {/* Grade Cells */}
                {GRADES.map(grade => {
                  const cell = row.cells[grade];
                  if (!cell) {
                    return (
                      <td key={grade} className="py-3 px-4 text-center">
                        <span className="text-xs text-muted-foreground/50">—</span>
                      </td>
                    );
                  }

                  return (
                    <td key={grade} className="py-2 px-2">
                      <div className={cn(
                        'p-2 rounded-sm border',
                        getExpectancyColor(cell.expectancy)
                      )}>
                        <div className="text-xs space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">N:</span>
                            <span className="font-medium text-foreground">{cell.tradeCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">WR:</span>
                            <span className="font-medium text-foreground">{cell.winRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exp:</span>
                            <span className={cn('font-bold', getTextColor(cell.expectancy))}>
                              {cell.expectancy}R
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-border/50">
                            <span className="text-muted-foreground">Total:</span>
                            <span className={cn('font-medium', cell.totalR >= 0 ? 'text-green-500' : 'text-red-500')}>
                              {cell.totalR >= 0 ? '+' : ''}{cell.totalR}R
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  );
                })}

                {/* Best Grade */}
                <td className="py-3 px-4 text-center">
                  {row.bestGrade ? (
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded text-xs font-bold',
                      row.bestGrade === 'A+' && 'bg-green-500/20 text-green-500',
                      row.bestGrade === 'A' && 'bg-emerald-500/20 text-emerald-500',
                      row.bestGrade === 'B' && 'bg-amber-500/20 text-amber-500',
                      row.bestGrade === 'Trash' && 'bg-red-500/20 text-red-500'
                    )}>
                      {row.bestGrade}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
              </tr>
            ))}

            {/* Summary Row: Best Setup per Grade */}
            <tr className="bg-muted/30 border-t-2 border-border">
              <td className="py-3 px-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Best Setup
                </span>
              </td>
              {GRADES.map(grade => {
                const summary = columnSummaries[grade];
                return (
                  <td key={grade} className="py-3 px-4 text-center">
                    {summary ? (
                      <div className="text-xs">
                        <div className="font-bold text-foreground">{summary.setup}</div>
                        <div className={cn('font-medium', getTextColor(summary.expectancy))}>
                          {summary.expectancy}R
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                );
              })}
              <td className="py-3 px-4" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="p-4 bg-card border border-border rounded-sm space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Key Insights</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <span className="text-green-500 font-medium">Green cells</span>: Positive expectancy ≥0.5R — allocate more capital</li>
          <li>• <span className="text-amber-500 font-medium">Amber cells</span>: Breakeven zone (0-0.5R) — review and refine</li>
          <li>• <span className="text-red-500 font-medium">Red cells</span>: Negative expectancy — consider eliminating</li>
          <li>• Cells with N &lt; 3 trades are not considered for "Best Grade" ranking</li>
        </ul>
      </div>
    </section>
  );
}
