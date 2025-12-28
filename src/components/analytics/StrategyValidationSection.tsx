import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EliteTrade } from "@/types/eliteTrade";
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StrategyValidationSectionProps {
  trades: EliteTrade[];
  dateRange: { from: Date; to: Date };
}

interface StrategyMetrics {
  totalTrades: number;
  winRate: number;
  expectancy: number;
  avgRMultiple: number;
  profitFactor: number;
  maxDrawdown: number;
  longestLosingStreak: number;
  equityCurveDirection: 'rising' | 'flat' | 'declining';
}

interface ValidationResult {
  isValid: boolean;
  checks: {
    expectancy: boolean;
    profitFactor: boolean;
    sampleSize: boolean;
    equityCurve: boolean;
  };
}

const StrategyValidationSection = ({ trades, dateRange }: StrategyValidationSectionProps) => {
  const calculateMetrics = (): StrategyMetrics => {
    const completedTrades = trades.filter(t => t.result && t.r_multiple !== null);
    
    if (completedTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        expectancy: 0,
        avgRMultiple: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        longestLosingStreak: 0,
        equityCurveDirection: 'flat'
      };
    }

    const totalTrades = completedTrades.length;
    const wins = completedTrades.filter(t => t.result === 'Win').length;
    const winRate = (wins / totalTrades) * 100;

    // Calculate R multiples
    const rMultiples = completedTrades.map(t => t.r_multiple || 0);
    const totalR = rMultiples.reduce((sum, r) => sum + r, 0);
    const avgRMultiple = totalR / totalTrades;
    const expectancy = avgRMultiple;

    // Profit Factor
    const grossProfit = rMultiples.filter(r => r > 0).reduce((sum, r) => sum + r, 0);
    const grossLoss = Math.abs(rMultiples.filter(r => r < 0).reduce((sum, r) => sum + r, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Max Drawdown (R-based)
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;
    
    // Sort by trade date for equity curve
    const sortedTrades = [...completedTrades].sort((a, b) => 
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );
    
    for (const trade of sortedTrades) {
      runningTotal += trade.r_multiple || 0;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Longest Losing Streak
    let currentStreak = 0;
    let longestLosingStreak = 0;
    
    for (const trade of sortedTrades) {
      if (trade.result === 'Loss') {
        currentStreak++;
        longestLosingStreak = Math.max(longestLosingStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Equity Curve Direction (using linear regression slope)
    let equityCurveDirection: 'rising' | 'flat' | 'declining' = 'flat';
    
    if (sortedTrades.length >= 5) {
      const equityCurve: number[] = [];
      let cumulative = 0;
      for (const trade of sortedTrades) {
        cumulative += trade.r_multiple || 0;
        equityCurve.push(cumulative);
      }
      
      // Simple slope calculation
      const n = equityCurve.length;
      const xMean = (n - 1) / 2;
      const yMean = equityCurve.reduce((a, b) => a + b, 0) / n;
      
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (equityCurve[i] - yMean);
        denominator += (i - xMean) ** 2;
      }
      
      const slope = denominator !== 0 ? numerator / denominator : 0;
      
      if (slope > 0.02) {
        equityCurveDirection = 'rising';
      } else if (slope < -0.02) {
        equityCurveDirection = 'declining';
      } else {
        equityCurveDirection = 'flat';
      }
    }

    return {
      totalTrades,
      winRate,
      expectancy,
      avgRMultiple,
      profitFactor,
      maxDrawdown,
      longestLosingStreak,
      equityCurveDirection
    };
  };

  const validateStrategy = (metrics: StrategyMetrics): ValidationResult => {
    const checks = {
      expectancy: metrics.expectancy > 0.20,
      profitFactor: metrics.profitFactor >= 1.3,
      sampleSize: metrics.totalTrades >= 300,
      equityCurve: metrics.equityCurveDirection === 'rising'
    };

    const isValid = checks.expectancy && checks.profitFactor && checks.sampleSize && checks.equityCurve;

    return { isValid, checks };
  };

  const metrics = calculateMetrics();
  const validation = validateStrategy(metrics);
  const passedChecks = Object.values(validation.checks).filter(Boolean).length;

  const getEquityCurveIcon = () => {
    switch (metrics.equityCurveDirection) {
      case 'rising':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-amber-500" />;
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (!isFinite(num)) return '∞';
    return num.toFixed(decimals);
  };

  if (metrics.totalTrades === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Strategy Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No completed trades available for strategy validation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Strategy Validation</CardTitle>
          <Badge 
            variant={validation.isValid ? "default" : "secondary"}
            className={validation.isValid 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }
          >
            {validation.isValid ? "Forward-Test Ready" : `${passedChecks}/4 Criteria Met`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation Status */}
        <div className={`p-4 rounded-lg border ${
          validation.isValid 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {validation.isValid ? (
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            )}
            <div>
              <p className="font-semibold text-foreground">
                {validation.isValid 
                  ? "Strategy has statistical edge" 
                  : "Strategy needs more validation"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {validation.isValid 
                  ? "All criteria met for forward testing with real capital"
                  : "Continue refining before risking capital"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            label="Total Trades" 
            value={metrics.totalTrades.toString()}
            subtext={metrics.totalTrades >= 300 ? "Sufficient sample" : `${300 - metrics.totalTrades} more needed`}
            status={validation.checks.sampleSize}
          />
          <MetricCard 
            label="Win Rate" 
            value={`${formatNumber(metrics.winRate, 1)}%`}
            subtext="All trades"
          />
          <MetricCard 
            label="Expectancy" 
            value={`${metrics.expectancy >= 0 ? '+' : ''}${formatNumber(metrics.expectancy)}R`}
            subtext={metrics.expectancy > 0.20 ? "Above threshold" : "Below +0.20R threshold"}
            status={validation.checks.expectancy}
            highlighted
          />
          <MetricCard 
            label="Avg R Multiple" 
            value={`${metrics.avgRMultiple >= 0 ? '+' : ''}${formatNumber(metrics.avgRMultiple)}R`}
            subtext="Per trade"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            label="Profit Factor" 
            value={formatNumber(metrics.profitFactor)}
            subtext={metrics.profitFactor >= 1.3 ? "Above 1.3" : "Below 1.3"}
            status={validation.checks.profitFactor}
          />
          <MetricCard 
            label="Max Drawdown" 
            value={`${formatNumber(metrics.maxDrawdown)}R`}
            subtext="Peak to trough"
          />
          <MetricCard 
            label="Longest Loss Streak" 
            value={metrics.longestLosingStreak.toString()}
            subtext="Consecutive losses"
          />
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Equity Curve</p>
            <div className="flex items-center gap-2">
              {getEquityCurveIcon()}
              <span className="text-lg font-semibold capitalize">{metrics.equityCurveDirection}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {validation.checks.equityCurve ? (
                <span className="text-emerald-400">Trending upward</span>
              ) : (
                <span className="text-amber-400">Not rising</span>
              )}
            </p>
          </div>
        </div>

        {/* Validation Criteria Checklist */}
        <div className="border-t border-border/50 pt-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Validation Criteria</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CriteriaCheck 
              label="Expectancy > +0.20R" 
              passed={validation.checks.expectancy} 
            />
            <CriteriaCheck 
              label="Profit Factor ≥ 1.3" 
              passed={validation.checks.profitFactor} 
            />
            <CriteriaCheck 
              label="Sample Size ≥ 300" 
              passed={validation.checks.sampleSize} 
            />
            <CriteriaCheck 
              label="Rising Equity Curve" 
              passed={validation.checks.equityCurve} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  status?: boolean;
  highlighted?: boolean;
}

const MetricCard = ({ label, value, subtext, status, highlighted }: MetricCardProps) => (
  <div className={`p-3 rounded-lg border ${
    highlighted 
      ? 'bg-primary/10 border-primary/30' 
      : 'bg-muted/30 border-border/50'
  }`}>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-lg font-semibold ${highlighted ? 'text-primary' : ''}`}>{value}</p>
    {subtext && (
      <p className="text-xs text-muted-foreground mt-1">
        {status !== undefined ? (
          status ? (
            <span className="text-emerald-400">{subtext}</span>
          ) : (
            <span className="text-amber-400">{subtext}</span>
          )
        ) : (
          subtext
        )}
      </p>
    )}
  </div>
);

interface CriteriaCheckProps {
  label: string;
  passed: boolean;
}

const CriteriaCheck = ({ label, passed }: CriteriaCheckProps) => (
  <div className="flex items-center gap-2">
    {passed ? (
      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
    ) : (
      <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    )}
    <span className={`text-sm ${passed ? 'text-foreground' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </div>
);

export default StrategyValidationSection;
