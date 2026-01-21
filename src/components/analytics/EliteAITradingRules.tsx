import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EliteTrade } from '@/types/eliteTrade';
import { Brain, ThumbsUp, ThumbsDown, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EliteAITradingRulesProps {
  trades: EliteTrade[];
  dateRange: '30' | '90' | 'all';
}

interface RuleData {
  rule: string;
  sampleSize: number;
  expectancy: number;
  avgR: number;
}

interface FieldAnalysis {
  field: string;
  value: string;
  wins: number;
  losses: number;
  totalR: number;
  sampleSize: number;
  winRate: number;
  expectancy: number;
  avgR: number;
}

const MIN_SAMPLE_SIZE = 5;
const SIGNIFICANT_WIN_RATE_DIFF = 15;
const SIGNIFICANT_EXPECTANCY = 0.3;

export function EliteAITradingRules({ trades, dateRange }: EliteAITradingRulesProps) {
  const analysis = useMemo(() => {
    // Filter by date range first
    const now = new Date();
    const daysBack = dateRange === '30' ? 30 : dateRange === '90' ? 90 : 3650;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const filteredTrades = trades.filter(t => {
      const tradeDate = new Date(t.trade_date);
      return tradeDate >= cutoffDate;
    });

    // Only analyze executed trades with results
    const closedTrades = filteredTrades.filter(t => 
      t.trade_status === 'Executed' && 
      (t.result === 'Win' || t.result === 'Loss')
    );
    
    if (closedTrades.length < MIN_SAMPLE_SIZE) {
      return { 
        insufficient: true, 
        message: `Need at least ${MIN_SAMPLE_SIZE} closed executed trades for analysis. Currently have ${closedTrades.length}.`,
        doMore: [],
        stopDoing: [],
        requiredConditions: [],
        noTradeScenarios: []
      };
    }

    // Calculate baseline stats
    const baselineWins = closedTrades.filter(t => t.result === 'Win').length;
    const baselineWinRate = (baselineWins / closedTrades.length) * 100;
    const baselineTotalR = closedTrades.reduce((sum, t) => {
      if (t.result === 'Win') return sum + (t.r_multiple || t.rr_realized || 1);
      return sum - 1;
    }, 0);
    const baselineExpectancy = baselineTotalR / closedTrades.length;

    const fieldAnalyses: FieldAnalysis[] = [];
    
    // Fields to analyze with their extractors
    const fieldsToAnalyze: { field: string; getValue: (t: EliteTrade) => string | null }[] = [
      { field: 'session', getValue: t => t.session || null },
      { field: 'killzone', getValue: t => t.killzone || null },
      { field: 'setup_type', getValue: t => t.setup_type || null },
      { field: 'setup_grade', getValue: t => t.setup_grade || null },
      { field: 'htf_bias', getValue: t => t.htf_bias || null },
      { field: 'htf_timeframe', getValue: t => t.htf_timeframe || null },
      { field: 'structure_state', getValue: t => t.structure_state || null },
      { field: 'is_htf_clear', getValue: t => t.is_htf_clear || null },
      { field: 'price_at_level_or_open', getValue: t => t.price_at_level_or_open || null },
      { field: 'entry_model', getValue: t => t.entry_model || null },
      { field: 'execution_tf', getValue: t => t.execution_tf || null },
      { field: 'confirmation_present', getValue: t => t.confirmation_present || null },
      { field: 'liquidity_taken', getValue: t => t.liquidity_taken_before_entry || null },
      { field: 'rules_followed', getValue: t => t.rules_followed || null },
      { field: 'news_day', getValue: t => t.news_day || null },
      { field: 'day_of_week', getValue: t => t.day_of_week || null },
      { field: 'account_type', getValue: t => t.account_type || null },
      { field: 'time_bucket', getValue: t => {
        if (!t.trade_time) return null;
        const [hourStr] = t.trade_time.split(':');
        const hour = parseInt(hourStr, 10);
        if (isNaN(hour)) return null;
        if (hour >= 0 && hour < 6) return 'Night (00-06)';
        if (hour >= 6 && hour < 10) return 'Early Morning (06-10)';
        if (hour >= 10 && hour < 14) return 'Midday (10-14)';
        if (hour >= 14 && hour < 18) return 'Afternoon (14-18)';
        return 'Evening (18-24)';
      }},
      { field: 'risk_level', getValue: t => {
        if (!t.risk_per_trade_pct) return null;
        if (t.risk_per_trade_pct <= 0.5) return 'Very Low (≤0.5%)';
        if (t.risk_per_trade_pct <= 1) return 'Low (0.5-1%)';
        if (t.risk_per_trade_pct <= 2) return 'Medium (1-2%)';
        return 'High (>2%)';
      }},
      { field: 'rr_planned_bucket', getValue: t => {
        if (!t.rr_planned) return null;
        if (t.rr_planned < 2) return 'Low RR (<2)';
        if (t.rr_planned < 3) return 'Medium RR (2-3)';
        return 'High RR (3+)';
      }},
    ];

    // Group trades by each field value
    fieldsToAnalyze.forEach(({ field, getValue }) => {
      const groups: Record<string, EliteTrade[]> = {};
      
      closedTrades.forEach(trade => {
        const value = getValue(trade);
        if (value) {
          if (!groups[value]) groups[value] = [];
          groups[value].push(trade);
        }
      });

      Object.entries(groups).forEach(([value, groupTrades]) => {
        if (groupTrades.length >= MIN_SAMPLE_SIZE) {
          const wins = groupTrades.filter(t => t.result === 'Win').length;
          const losses = groupTrades.length - wins;
          const totalR = groupTrades.reduce((sum, t) => {
            if (t.result === 'Win') return sum + (t.r_multiple || t.rr_realized || 1);
            return sum - 1;
          }, 0);
          const winRate = (wins / groupTrades.length) * 100;
          const expectancy = totalR / groupTrades.length;
          const avgR = wins > 0 
            ? groupTrades.filter(t => t.result === 'Win').reduce((sum, t) => sum + (t.r_multiple || t.rr_realized || 1), 0) / wins 
            : 0;

          fieldAnalyses.push({
            field,
            value,
            wins,
            losses,
            totalR,
            sampleSize: groupTrades.length,
            winRate,
            expectancy,
            avgR
          });
        }
      });
    });

    // Categorize findings into rules
    const doMore: RuleData[] = [];
    const stopDoing: RuleData[] = [];
    const requiredConditions: RuleData[] = [];
    const noTradeScenarios: RuleData[] = [];

    const formatField = (field: string) => {
      return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    fieldAnalyses.forEach(analysis => {
      const winRateDiff = analysis.winRate - baselineWinRate;

      // Strong positive patterns - Do More Of
      if (winRateDiff >= SIGNIFICANT_WIN_RATE_DIFF && analysis.expectancy >= SIGNIFICANT_EXPECTANCY) {
        doMore.push({
          rule: `Trade with ${analysis.value} (${formatField(analysis.field)})`,
          sampleSize: analysis.sampleSize,
          expectancy: analysis.expectancy,
          avgR: analysis.avgR
        });
      }

      // Very strong patterns become Required Conditions
      if (winRateDiff >= SIGNIFICANT_WIN_RATE_DIFF * 1.5 && analysis.expectancy >= SIGNIFICANT_EXPECTANCY * 1.5 && analysis.sampleSize >= MIN_SAMPLE_SIZE * 2) {
        requiredConditions.push({
          rule: `Ensure ${formatField(analysis.field)} = "${analysis.value}"`,
          sampleSize: analysis.sampleSize,
          expectancy: analysis.expectancy,
          avgR: analysis.avgR
        });
      }

      // Negative patterns - Stop Doing
      if (winRateDiff <= -SIGNIFICANT_WIN_RATE_DIFF && analysis.expectancy < 0) {
        stopDoing.push({
          rule: `Avoid ${analysis.value} (${formatField(analysis.field)})`,
          sampleSize: analysis.sampleSize,
          expectancy: analysis.expectancy,
          avgR: analysis.avgR
        });
      }

      // Severe negative patterns - No Trade Scenarios
      if (analysis.winRate <= 35 && analysis.expectancy <= -0.5 && analysis.sampleSize >= MIN_SAMPLE_SIZE) {
        noTradeScenarios.push({
          rule: `NO TRADE: ${formatField(analysis.field)} = "${analysis.value}"`,
          sampleSize: analysis.sampleSize,
          expectancy: analysis.expectancy,
          avgR: analysis.avgR
        });
      }
    });

    // Sort each category by impact
    doMore.sort((a, b) => b.expectancy - a.expectancy);
    stopDoing.sort((a, b) => a.expectancy - b.expectancy);
    requiredConditions.sort((a, b) => b.expectancy - a.expectancy);
    noTradeScenarios.sort((a, b) => a.expectancy - b.expectancy);

    return {
      insufficient: false,
      baselineWinRate,
      baselineExpectancy,
      totalAnalyzed: closedTrades.length,
      doMore: doMore.slice(0, 5),
      stopDoing: stopDoing.slice(0, 5),
      requiredConditions: requiredConditions.slice(0, 3),
      noTradeScenarios: noTradeScenarios.slice(0, 3)
    };
  }, [trades, dateRange]);

  const RuleItem = ({ rule, positive }: { rule: RuleData; positive: boolean }) => (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <div className={`mt-0.5 ${positive ? 'text-profit' : 'text-loss'}`}>
        {positive ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{rule.rule}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          <Badge variant="outline" className="text-xs">
            n={rule.sampleSize}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${rule.expectancy >= 0 ? 'text-profit border-profit/30' : 'text-loss border-loss/30'}`}
          >
            Exp: {rule.expectancy >= 0 ? '+' : ''}{rule.expectancy.toFixed(2)}R
          </Badge>
          {rule.avgR > 0 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Avg Win: {rule.avgR.toFixed(2)}R
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  if (analysis.insufficient) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Rules from Your Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.message}</p>
        </CardContent>
      </Card>
    );
  }

  const hasAnyRules = analysis.doMore.length > 0 || analysis.stopDoing.length > 0 || 
                      analysis.requiredConditions.length > 0 || analysis.noTradeScenarios.length > 0;

  if (!hasAnyRules) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Rules from Your Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No statistically significant patterns found yet. Your trading is consistent across all conditions, 
            or more data is needed to identify clear patterns. Keep backtesting with detailed field data.
          </p>
          <div className="mt-3 flex gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="outline">Baseline Win Rate: {analysis.baselineWinRate.toFixed(1)}%</Badge>
            <Badge variant="outline">Baseline Expectancy: {analysis.baselineExpectancy.toFixed(2)}R</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Rules from Your Data
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Based on {analysis.totalAnalyzed} executed trades
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Do More Of */}
          {analysis.doMore.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-profit">
                <CheckCircle2 className="w-4 h-4" />
                Do More Of
              </h4>
              <div className="bg-profit/5 rounded-lg p-3 border border-profit/20">
                {analysis.doMore.map((rule, i) => (
                  <RuleItem key={i} rule={rule} positive />
                ))}
              </div>
            </div>
          )}

          {/* Stop Doing */}
          {analysis.stopDoing.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-loss">
                <XCircle className="w-4 h-4" />
                Stop Doing
              </h4>
              <div className="bg-loss/5 rounded-lg p-3 border border-loss/20">
                {analysis.stopDoing.map((rule, i) => (
                  <RuleItem key={i} rule={rule} positive={false} />
                ))}
              </div>
            </div>
          )}

          {/* Required Conditions */}
          {analysis.requiredConditions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4" />
                Required Conditions
              </h4>
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                {analysis.requiredConditions.map((rule, i) => (
                  <RuleItem key={i} rule={rule} positive />
                ))}
              </div>
            </div>
          )}

          {/* No-Trade Scenarios */}
          {analysis.noTradeScenarios.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                <XCircle className="w-4 h-4" />
                No-Trade Scenarios
              </h4>
              <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/20">
                {analysis.noTradeScenarios.map((rule, i) => (
                  <RuleItem key={i} rule={rule} positive={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
          Rules derived from behavior → outcome patterns. Minimum {MIN_SAMPLE_SIZE} samples per condition. 
          Updates automatically as you add trades.
        </p>
      </CardContent>
    </Card>
  );
}
