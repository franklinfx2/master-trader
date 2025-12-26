// XAUUSD ELITE TRADING JOURNAL — Legacy Trade Upgrade Form
// One legacy trade at a time, pre-fill exact mapped fields, force completion of missing fields
// Require screenshots before allowing fully_classified status
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ArrowLeft,
  ArrowRight,
  XCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { EliteScreenshotUpload } from './EliteScreenshotUpload';
import { useEliteTrades } from '@/hooks/useEliteTrades';
import { EliteTrade } from '@/types/eliteTrade';
import {
  ACCOUNT_TYPES,
  SESSIONS,
  KILLZONES,
  DAYS_OF_WEEK,
  HTF_BIASES,
  HTF_TIMEFRAMES,
  MARKET_PHASES,
  STRUCTURE_STATES,
  LIQUIDITY_TARGETS,
  SETUP_TYPES,
  SETUP_GRADES,
  EXECUTION_TFS,
  ENTRY_MODELS,
  ENTRY_CANDLES,
  ENTRY_PRECISIONS,
  STOP_PLACEMENT_QUALITIES,
  GOLD_BEHAVIOR_TAGS,
  PRE_TRADE_STATES,
  YES_NO,
  type LiquidityTarget,
  type GoldBehaviorTag,
} from '@/types/eliteTrade';

// Validation schema for upgrade (same as entry form)
const upgradeSchema = z.object({
  trade_date: z.date({ required_error: 'Trade date is required' }),
  account_type: z.enum(['Demo', 'Live', 'Funded'], { required_error: 'Account type is required' }),
  session: z.enum(['Asia', 'London', 'NY'], { required_error: 'Session is required' }),
  killzone: z.enum(['LO', 'NYO', 'NYPM', 'None'], { required_error: 'Killzone is required' }),
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], { required_error: 'Day of week is required' }),
  news_day: z.enum(['Yes', 'No'], { required_error: 'News day is required' }),
  htf_bias: z.enum(['Bullish', 'Bearish', 'Range'], { required_error: 'HTF bias is required' }),
  htf_timeframe: z.enum(['H4', 'H1'], { required_error: 'HTF timeframe is required' }),
  market_phase: z.enum(['Expansion', 'Retracement', 'Consolidation'], { required_error: 'Market phase is required' }),
  structure_state: z.enum(['HH-HL', 'LH-LL', 'CHoCH', 'BOS'], { required_error: 'Structure state is required' }),
  liquidity_targeted: z.array(z.string()).min(1, 'Select at least one liquidity target'),
  liquidity_taken_before_entry: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  liquidity_taken_against_bias: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  setup_type: z.enum(['OBC', 'OBR', 'BB'], { required_error: 'Setup type is required' }),
  setup_grade: z.enum(['A+', 'A', 'B', 'Trash'], { required_error: 'Setup grade is required' }),
  execution_tf: z.enum(['M1', 'M3', 'M5'], { required_error: 'Execution TF is required' }),
  entry_model: z.enum(['OB retest', 'Sweep → Displacement → OB', 'BOS pullback'], { required_error: 'Entry model is required' }),
  entry_candle: z.enum(['Engulfing', 'Displacement', 'Rejection', 'Break & Retest'], { required_error: 'Entry candle is required' }),
  confirmation_present: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  entry_price: z.string().min(1, 'Entry price is required'),
  stop_loss: z.string().min(1, 'Stop loss is required'),
  take_profit: z.string().min(1, 'Take profit is required'),
  exit_price: z.string().optional(),
  risk_per_trade_pct: z.string().min(1, 'Risk % is required'),
  rr_planned: z.string().min(1, 'Planned RR is required'),
  entry_precision: z.enum(['Early', 'Optimal', 'Late'], { required_error: 'Entry precision is required' }),
  stop_placement_quality: z.enum(['Clean', 'Wide', 'Tight'], { required_error: 'Stop placement quality is required' }),
  partial_taken: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  rules_followed: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  gold_behavior_tags: z.array(z.string()).default([]),
  first_move_was_fake: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  real_move_after_liquidity: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  trade_aligned_with_real_move: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  pre_trade_state: z.enum(['Calm', 'FOMO', 'Hesitant', 'Overconfident'], { required_error: 'Pre-trade state is required' }),
  confidence_level: z.number().min(1).max(5, 'Confidence must be 1-5'),
  revenge_trade: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  fatigue_present: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  htf_screenshot: z.string(),
  ltf_entry_screenshot: z.string(),
  post_trade_screenshot: z.string(),
  annotations_present: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  mae: z.string().optional(),
  mfe: z.string().optional(),
  would_i_take_this_trade_again: z.enum(['Yes', 'No']).optional(),
  notes: z.string().optional(),
});

type UpgradeFormValues = z.infer<typeof upgradeSchema>;

interface LegacyTradeUpgradeFormProps {
  trade: EliteTrade;
  onSuccess: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalCount: number;
}

export const LegacyTradeUpgradeForm = ({ 
  trade, 
  onSuccess, 
  onSkip,
  currentIndex,
  totalCount 
}: LegacyTradeUpgradeFormProps) => {
  const { updateTrade } = useEliteTrades();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map legacy trade fields to form defaults
  const getDefaultValues = (): Partial<UpgradeFormValues> => ({
    trade_date: trade.trade_date ? new Date(trade.trade_date) : new Date(),
    account_type: trade.account_type,
    session: trade.session,
    killzone: trade.killzone,
    day_of_week: trade.day_of_week,
    news_day: trade.news_day,
    htf_bias: trade.htf_bias,
    htf_timeframe: trade.htf_timeframe,
    market_phase: trade.market_phase,
    structure_state: trade.structure_state,
    liquidity_targeted: trade.liquidity_targeted || [],
    liquidity_taken_before_entry: trade.liquidity_taken_before_entry,
    liquidity_taken_against_bias: trade.liquidity_taken_against_bias,
    setup_type: trade.setup_type,
    setup_grade: trade.setup_grade,
    execution_tf: trade.execution_tf,
    entry_model: trade.entry_model,
    entry_candle: trade.entry_candle,
    confirmation_present: trade.confirmation_present,
    entry_price: trade.entry_price?.toString() || '',
    stop_loss: trade.stop_loss?.toString() || '',
    take_profit: trade.take_profit?.toString() || '',
    exit_price: trade.exit_price?.toString() || '',
    risk_per_trade_pct: trade.risk_per_trade_pct?.toString() || '',
    rr_planned: trade.rr_planned?.toString() || '',
    entry_precision: trade.entry_precision,
    stop_placement_quality: trade.stop_placement_quality,
    partial_taken: trade.partial_taken,
    rules_followed: trade.rules_followed,
    gold_behavior_tags: trade.gold_behavior_tags || [],
    first_move_was_fake: trade.first_move_was_fake,
    real_move_after_liquidity: trade.real_move_after_liquidity,
    trade_aligned_with_real_move: trade.trade_aligned_with_real_move,
    pre_trade_state: trade.pre_trade_state,
    confidence_level: trade.confidence_level || 3,
    revenge_trade: trade.revenge_trade,
    fatigue_present: trade.fatigue_present,
    htf_screenshot: trade.htf_screenshot || '',
    ltf_entry_screenshot: trade.ltf_entry_screenshot || '',
    post_trade_screenshot: trade.post_trade_screenshot || '',
    annotations_present: trade.annotations_present || 'No',
    mae: trade.mae?.toString() || '',
    mfe: trade.mfe?.toString() || '',
    would_i_take_this_trade_again: trade.would_i_take_this_trade_again,
    notes: trade.notes || '',
  });

  const form = useForm<UpgradeFormValues>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when trade changes
  useEffect(() => {
    form.reset(getDefaultValues());
  }, [trade.id]);

  const watchedValues = form.watch();

  // Screenshot validation
  const screenshotsValid = Boolean(
    watchedValues.htf_screenshot &&
    watchedValues.ltf_entry_screenshot &&
    watchedValues.post_trade_screenshot
  );

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      'session', 'killzone', 'day_of_week', 'news_day',
      'htf_bias', 'htf_timeframe', 'market_phase', 'structure_state',
      'setup_type', 'setup_grade', 'execution_tf',
      'entry_model', 'entry_candle', 'confirmation_present',
      'entry_price', 'stop_loss', 'take_profit',
      'risk_per_trade_pct', 'rr_planned',
      'entry_precision', 'stop_placement_quality', 'partial_taken', 'rules_followed',
      'first_move_was_fake', 'real_move_after_liquidity', 'trade_aligned_with_real_move',
      'pre_trade_state', 'revenge_trade', 'fatigue_present', 'annotations_present'
    ];

    let filled = 0;
    requiredFields.forEach((field) => {
      const value = watchedValues[field as keyof UpgradeFormValues];
      if (value !== undefined && value !== '' && value !== null) {
        filled++;
      }
    });

    // Add liquidity check
    if (watchedValues.liquidity_targeted?.length > 0) filled++;

    // Add screenshots
    if (watchedValues.htf_screenshot) filled++;
    if (watchedValues.ltf_entry_screenshot) filled++;
    if (watchedValues.post_trade_screenshot) filled++;

    const total = requiredFields.length + 4; // +4 for liquidity and 3 screenshots
    return Math.round((filled / total) * 100);
  }, [watchedValues]);

  const onSubmit = async (data: UpgradeFormValues) => {
    if (!screenshotsValid) {
      toast({
        title: "Screenshots Required",
        description: "All three screenshots are mandatory for full classification.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const updateData = {
      trade_date: format(data.trade_date, 'yyyy-MM-dd'),
      account_type: data.account_type,
      session: data.session,
      killzone: data.killzone,
      day_of_week: data.day_of_week,
      news_day: data.news_day,
      htf_bias: data.htf_bias,
      htf_timeframe: data.htf_timeframe,
      market_phase: data.market_phase,
      structure_state: data.structure_state,
      liquidity_targeted: data.liquidity_targeted as LiquidityTarget[],
      liquidity_taken_before_entry: data.liquidity_taken_before_entry,
      liquidity_taken_against_bias: data.liquidity_taken_against_bias,
      setup_type: data.setup_type,
      setup_grade: data.setup_grade,
      execution_tf: data.execution_tf,
      entry_model: data.entry_model,
      entry_candle: data.entry_candle,
      confirmation_present: data.confirmation_present,
      entry_price: data.entry_price,
      stop_loss: data.stop_loss,
      take_profit: data.take_profit,
      exit_price: data.exit_price || '',
      risk_per_trade_pct: data.risk_per_trade_pct,
      rr_planned: data.rr_planned,
      entry_precision: data.entry_precision,
      stop_placement_quality: data.stop_placement_quality,
      partial_taken: data.partial_taken,
      rules_followed: data.rules_followed,
      gold_behavior_tags: data.gold_behavior_tags as GoldBehaviorTag[],
      first_move_was_fake: data.first_move_was_fake,
      real_move_after_liquidity: data.real_move_after_liquidity,
      trade_aligned_with_real_move: data.trade_aligned_with_real_move,
      pre_trade_state: data.pre_trade_state,
      confidence_level: data.confidence_level,
      revenge_trade: data.revenge_trade,
      fatigue_present: data.fatigue_present,
      htf_screenshot: data.htf_screenshot,
      ltf_entry_screenshot: data.ltf_entry_screenshot,
      post_trade_screenshot: data.post_trade_screenshot,
      annotations_present: data.annotations_present,
      mae: data.mae || '',
      mfe: data.mfe || '',
      would_i_take_this_trade_again: data.would_i_take_this_trade_again,
      notes: data.notes || '',
      // This will trigger the DB trigger to set fully_classified
    };

    const { error } = await updateTrade(trade.id, updateData as any);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade trade. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Trade Upgraded",
        description: "Legacy trade successfully classified.",
      });
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Legacy Upgrade</Badge>
              <span className="text-sm text-muted-foreground">
                Trade {currentIndex + 1} of {totalCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Completion:</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Legacy Trade Info */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>Pre-filled from Legacy Trade</AlertTitle>
        <AlertDescription>
          Entry: ${trade.entry_price} | SL: ${trade.stop_loss} | TP: ${trade.take_profit}
          {trade.exit_price && ` | Exit: $${trade.exit_price}`}
          {trade.legacy_trade_id && (
            <span className="ml-2 text-xs opacity-70">
              (Legacy ID: {trade.legacy_trade_id.slice(0, 8)}...)
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Screenshot Status */}
      <Alert className={cn(
        "border-2",
        screenshotsValid ? "border-profit/30 bg-profit/5" : "border-destructive/30 bg-destructive/5"
      )}>
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {screenshotsValid ? (
              <CheckCircle2 className="w-5 h-5 text-profit" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            )}
            <span className="font-medium">
              {screenshotsValid
                ? "All mandatory screenshots uploaded"
                : "3 mandatory screenshots required for full classification"
              }
            </span>
          </div>
          <Badge variant={screenshotsValid ? "default" : "destructive"}>
            {screenshotsValid ? "Ready" : "Incomplete"}
          </Badge>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Session & Time */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Session & Time</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <FormField
                control={form.control}
                name="trade_date"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Trade Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Select'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Account Type */}
              <FormField
                control={form.control}
                name="account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACCOUNT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Session */}
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Killzone */}
              <FormField
                control={form.control}
                name="killzone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Killzone *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KILLZONES.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Day of Week */}
              <FormField
                control={form.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* News Day */}
              <FormField
                control={form.control}
                name="news_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>News Day *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* HTF Context */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Higher-Timeframe Context</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="htf_bias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTF Bias *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HTF_BIASES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="htf_timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTF Timeframe *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HTF_TIMEFRAMES.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="market_phase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Phase *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MARKET_PHASES.map(mp => <SelectItem key={mp} value={mp}>{mp}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="structure_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Structure State *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STRUCTURE_STATES.map(ss => <SelectItem key={ss} value={ss}>{ss}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Liquidity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Liquidity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="liquidity_targeted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liquidity Targeted *</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {LIQUIDITY_TARGETS.map((target) => (
                        <div key={target} className="flex items-center space-x-2">
                          <Checkbox
                            id={`liq-${target}`}
                            checked={field.value?.includes(target)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, target]);
                              } else {
                                field.onChange(current.filter((v) => v !== target));
                              }
                            }}
                          />
                          <label htmlFor={`liq-${target}`} className="text-sm">{target}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="liquidity_taken_before_entry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taken Before Entry *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="liquidity_taken_against_bias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Against Bias *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Setup Classification */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Setup Classification</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="setup_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SETUP_TYPES.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setup_grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Grade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SETUP_GRADES.map(sg => <SelectItem key={sg} value={sg}>{sg}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="execution_tf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution TF *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXECUTION_TFS.map(etf => <SelectItem key={etf} value={etf}>{etf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Entry Mechanics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Entry Mechanics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="entry_model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Model *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENTRY_MODELS.map(em => <SelectItem key={em} value={em}>{em}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entry_candle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Candle *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENTRY_CANDLES.map(ec => <SelectItem key={ec} value={ec}>{ec}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmation_present"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Price Levels (Pre-filled, but editable) */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Price Levels</CardTitle>
              <CardDescription>Pre-filled from legacy trade</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="entry_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stop_loss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="take_profit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Risk & Execution */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Risk & Execution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="risk_per_trade_pct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk % *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rr_planned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RR Planned *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entry_precision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Precision *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ENTRY_PRECISIONS.map(ep => <SelectItem key={ep} value={ep}>{ep}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stop_placement_quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stop Placement *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STOP_PLACEMENT_QUALITIES.map(spq => <SelectItem key={spq} value={spq}>{spq}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="partial_taken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partials Taken *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rules_followed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rules Followed *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mae"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MAE</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mfe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MFE</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gold Behavior Tags */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Gold Behavior Tags</CardTitle>
              <CardDescription>Optional multi-select</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="gold_behavior_tags"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {GOLD_BEHAVIOR_TAGS.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={field.value?.includes(tag)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, tag]);
                              } else {
                                field.onChange(current.filter((v) => v !== tag));
                              }
                            }}
                          />
                          <label htmlFor={`tag-${tag}`} className="text-sm">{tag}</label>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sequence Logic */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Sequence Logic</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="first_move_was_fake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Move Fake *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="real_move_after_liquidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Real After Liq *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trade_aligned_with_real_move"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Aligned *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Psychology */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Psychology</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="pre_trade_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pre-Trade State *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRE_TRADE_STATES.map(pts => <SelectItem key={pts} value={pts}>{pts}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confidence_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence (1-5) *</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revenge_trade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenge Trade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatigue_present"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatigue Present *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Screenshots */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Visual Evidence (Mandatory)</CardTitle>
              <CardDescription>All three screenshots required for full classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="htf_screenshot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTF Screenshot *</FormLabel>
                      <FormControl>
                        <EliteScreenshotUpload
                          value={field.value}
                          onChange={field.onChange}
                          label="HTF Screenshot"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ltf_entry_screenshot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LTF Entry Screenshot *</FormLabel>
                      <FormControl>
                        <EliteScreenshotUpload
                          value={field.value}
                          onChange={field.onChange}
                          label="LTF Entry"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="post_trade_screenshot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-Trade Screenshot *</FormLabel>
                      <FormControl>
                        <EliteScreenshotUpload
                          value={field.value}
                          onChange={field.onChange}
                          label="Post-Trade"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="annotations_present"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annotations Present *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-32"><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Final Field */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Final Intelligence Field</CardTitle>
              <CardDescription>Most important field for learning acceleration</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="would_i_take_this_trade_again"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Would I take this trade again?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-32"><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(yn => <SelectItem key={yn} value={yn}>{yn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Trade observations, lessons learned..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={isSubmitting}
            >
              <XCircle className="w-4 h-4 mr-1" /> Skip for Now
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {totalCount}
              </span>
              <Button
                type="submit"
                disabled={isSubmitting || !screenshotsValid}
                className="min-w-[160px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Upgrading...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Upgrade Trade
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};
