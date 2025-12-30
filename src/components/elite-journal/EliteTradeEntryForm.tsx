// XAUUSD ELITE TRADING JOURNAL — Entry Form
// All fields required, ENUMs as dropdowns, mandatory screenshots, blocked save until valid
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Save, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { TradeDatePickerField } from './TradeDatePickerField';
import { EliteScreenshotUpload } from './EliteScreenshotUpload';
import { useEliteTrades } from '@/hooks/useEliteTrades';
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
  NEWS_IMPACTS,
  NEWS_TIMINGS,
  NEWS_TYPES,
  TRADE_STATUSES,
  MISSED_REASONS,
  HYPOTHETICAL_RESULTS,
  type LiquidityTarget,
  type GoldBehaviorTag,
  type NewsImpact,
  type NewsTiming,
  type NewsType,
  type TradeStatus,
  type MissedReason,
  type HypotheticalResult,
} from '@/types/eliteTrade';

// Base schema for field count calculation
const eliteTradeSchemaBase = z.object({
  // Trade Identity
  trade_date: z.date({ required_error: 'Trade date is required' }),
  trade_time: z.string().min(1, 'Trade time is required').regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  account_type: z.enum(['Demo', 'Live', 'Funded'], { required_error: 'Account type is required' }),
  
  // Trade Status (Executed vs Missed)
  trade_status: z.enum(['Executed', 'Missed']).default('Executed'),
  missed_reason: z.enum(['Hesitation', 'Away', 'Technical', 'Fear', 'Other']).optional(),
  hypothetical_result: z.enum(['Win', 'Loss', 'BE', 'Unknown']).optional(),
  
  // Session & Time
  session: z.enum(['Asia', 'London', 'NY'], { required_error: 'Session is required' }),
  killzone: z.enum(['LO', 'NYO', 'NYPM', 'None'], { required_error: 'Killzone is required' }),
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], { required_error: 'Day of week is required' }),
  news_day: z.enum(['Yes', 'No'], { required_error: 'News day is required' }),
  news_impact: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  news_timing: z.enum(['PRE_NEWS', 'AT_RELEASE', 'POST_NEWS']).optional(),
  news_type: z.enum(['INFLATION', 'RATES', 'EMPLOYMENT', 'RISK_SENTIMENT', 'NONE']).optional(),
  
  // HTF Context
  htf_bias: z.enum(['Bullish', 'Bearish', 'Range'], { required_error: 'HTF bias is required' }),
  htf_timeframe: z.enum(['H4', 'H1'], { required_error: 'HTF timeframe is required' }),
  market_phase: z.enum(['Expansion', 'Retracement', 'Consolidation'], { required_error: 'Market phase is required' }),
  structure_state: z.enum(['HH-HL', 'LH-LL', 'CHoCH', 'BOS'], { required_error: 'Structure state is required' }),
  
  // Liquidity
  liquidity_targeted: z.array(z.string()).min(1, 'Select at least one liquidity target'),
  liquidity_taken_before_entry: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  liquidity_taken_against_bias: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Setup Classification
  setup_type: z.enum(['OBC', 'OBR', 'BB'], { required_error: 'Setup type is required' }),
  setup_grade: z.enum(['A+', 'A', 'B', 'Trash'], { required_error: 'Setup grade is required' }),
  execution_tf: z.enum(['M1', 'M3', 'M5'], { required_error: 'Execution TF is required' }),
  
  // Entry Mechanics
  entry_model: z.enum(['OB retest', 'Sweep → Displacement → OB', 'BOS pullback'], { required_error: 'Entry model is required' }),
  entry_candle: z.enum(['Engulfing', 'Displacement', 'Rejection', 'Break & Retest'], { required_error: 'Entry candle is required' }),
  confirmation_present: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Price Levels
  entry_price: z.string().min(1, 'Entry price is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a valid positive number'),
  stop_loss: z.string().min(1, 'Stop loss is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a valid positive number'),
  take_profit: z.string().min(1, 'Take profit is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a valid positive number'),
  exit_price: z.string().optional(),
  
  // Risk & Execution
  risk_per_trade_pct: z.string().min(1, 'Risk % is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0 && parseFloat(v) <= 10, 'Must be between 0.1 and 10'),
  rr_planned: z.string().min(1, 'Planned RR is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a valid positive number'),
  
  // Execution Discipline
  entry_precision: z.enum(['Early', 'Optimal', 'Late'], { required_error: 'Entry precision is required' }),
  stop_placement_quality: z.enum(['Clean', 'Wide', 'Tight'], { required_error: 'Stop placement quality is required' }),
  partial_taken: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  rules_followed: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Gold Behavior Tags
  gold_behavior_tags: z.array(z.string()).default([]),
  
  // Sequence Logic
  first_move_was_fake: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  real_move_after_liquidity: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  trade_aligned_with_real_move: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Psychology
  pre_trade_state: z.enum(['Calm', 'FOMO', 'Hesitant', 'Overconfident'], { required_error: 'Pre-trade state is required' }),
  confidence_level: z.number().min(1).max(5, 'Confidence must be 1-5'),
  revenge_trade: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  fatigue_present: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Visual Evidence (validated separately)
  htf_screenshot: z.string().min(1, 'HTF screenshot is required'),
  ltf_entry_screenshot: z.string().min(1, 'LTF entry screenshot is required'),
  post_trade_screenshot: z.string().optional(), // Added after trade closes
  annotations_present: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Optional metrics for closed trades
  mae: z.string().optional(),
  mfe: z.string().optional(),
  
  // Final field
  would_i_take_this_trade_again: z.enum(['Yes', 'No']).optional(),
  
  // Notes
  notes: z.string().optional(),
});

// Final schema with conditional news validation
const eliteTradeSchema = eliteTradeSchemaBase.refine((data) => {
  // When news_day is Yes, news_impact and news_timing are required
  if (data.news_day === 'Yes') {
    if (!data.news_impact) return false;
    if (!data.news_timing) return false;
  }
  return true;
}, {
  message: 'News Impact and News Timing are required when News Day is Yes',
  path: ['news_impact'],
});

type EliteTradeFormValues = z.infer<typeof eliteTradeSchema>;

interface EliteTradeEntryFormProps {
  onSuccess?: () => void;
}

export const EliteTradeEntryForm = ({ onSuccess }: EliteTradeEntryFormProps) => {
  const { addTrade } = useEliteTrades();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EliteTradeFormValues>({
    resolver: zodResolver(eliteTradeSchema),
    defaultValues: {
      trade_date: new Date(),
      trade_time: '',
      trade_status: 'Executed',
      liquidity_targeted: [],
      gold_behavior_tags: [],
      confidence_level: 3,
      htf_screenshot: '',
      ltf_entry_screenshot: '',
      post_trade_screenshot: '',
      entry_price: '',
      stop_loss: '',
      take_profit: '',
      exit_price: '',
      risk_per_trade_pct: '',
      rr_planned: '',
      mae: '',
      mfe: '',
      notes: '',
    },
  });

  const watchedValues = form.watch();
  const isMissedTrade = watchedValues.trade_status === 'Missed';
  
  // Screenshot validation - only HTF and LTF Entry required at entry time (for executed trades)
  // For missed trades, screenshots are optional
  const screenshotsValid = isMissedTrade || Boolean(
    watchedValues.htf_screenshot && 
    watchedValues.ltf_entry_screenshot
  );

  // Calculate auto fields
  const autoCalculatedFields = useMemo(() => {
    const entry = parseFloat(watchedValues.entry_price || '0');
    const sl = parseFloat(watchedValues.stop_loss || '0');
    const tp = parseFloat(watchedValues.take_profit || '0');
    const exit = watchedValues.exit_price ? parseFloat(watchedValues.exit_price) : null;
    
    if (!entry || !sl || !tp) {
      return { result: null, rr_realized: null, r_multiple: null };
    }

    const isLong = sl < entry;
    const riskDistance = Math.abs(entry - sl);
    
    if (!exit || riskDistance === 0) {
      return { result: null, rr_realized: null, r_multiple: null };
    }

    const profitDistance = isLong ? exit - entry : entry - exit;
    const rMultiple = profitDistance / riskDistance;
    
    let result: 'Win' | 'Loss' | 'BE' = 'BE';
    if (rMultiple > 0.1) result = 'Win';
    else if (rMultiple < -0.1) result = 'Loss';

    return {
      result,
      rr_realized: rMultiple.toFixed(2),
      r_multiple: rMultiple.toFixed(2),
    };
  }, [watchedValues.entry_price, watchedValues.stop_loss, watchedValues.take_profit, watchedValues.exit_price]);

  // Check form completeness
  const formCompleteness = useMemo(() => {
    const errors = form.formState.errors;
    const totalFields = Object.keys(eliteTradeSchemaBase.shape).length;
    const errorCount = Object.keys(errors).length;
    const screenshotsMissing = !screenshotsValid ? 2 : 0;
    return {
      complete: errorCount === 0 && screenshotsValid,
      percentage: Math.round(((totalFields - errorCount - screenshotsMissing) / totalFields) * 100),
    };
  }, [form.formState.errors, screenshotsValid]);

  const onSubmit = async (data: EliteTradeFormValues) => {
    if (!screenshotsValid) {
      toast({
        title: "Screenshots Required",
        description: "HTF and LTF Entry screenshots are required to save.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = {
      trade_date: format(data.trade_date, 'yyyy-MM-dd'),
      trade_time: data.trade_time,
      account_type: data.account_type,
      trade_status: data.trade_status as TradeStatus,
      missed_reason: data.trade_status === 'Missed' ? data.missed_reason as MissedReason : undefined,
      hypothetical_result: data.trade_status === 'Missed' ? data.hypothetical_result as HypotheticalResult : undefined,
      session: data.session,
      killzone: data.killzone,
      day_of_week: data.day_of_week,
      news_day: data.news_day,
      news_impact: data.news_day === 'Yes' ? data.news_impact : undefined,
      news_timing: data.news_day === 'Yes' ? data.news_timing : undefined,
      news_type: data.news_day === 'Yes' ? data.news_type : undefined,
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
      htf_screenshot: data.htf_screenshot || '',
      ltf_entry_screenshot: data.ltf_entry_screenshot || '',
      post_trade_screenshot: data.post_trade_screenshot,
      annotations_present: data.annotations_present,
      would_i_take_this_trade_again: data.would_i_take_this_trade_again,
      mae: data.mae || '',
      mfe: data.mfe || '',
      notes: data.notes || '',
    };

    const { error } = await addTrade(formData);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save trade. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Trade Saved",
        description: "Elite trade logged successfully.",
      });
      form.reset();
      onSuccess?.();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Validation Status Banner */}
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
                {isMissedTrade 
                  ? "Missed trade — screenshots optional"
                  : screenshotsValid 
                    ? "Entry screenshots uploaded" 
                    : "2 screenshots required before saving (HTF + LTF Entry)"
                }
              </span>
            </div>
            <Badge variant={screenshotsValid ? "default" : "destructive"}>
              {isMissedTrade ? "Missed Trade" : screenshotsValid ? "Ready to Save" : "Incomplete"}
            </Badge>
          </AlertDescription>
        </Alert>

        {/* SECTION 0: Trade Status */}
        <Card className={cn("glass-card", isMissedTrade && "border-amber-500/50 bg-amber-500/5")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Trade Status
              {isMissedTrade && <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">Missed Trade</Badge>}
            </CardTitle>
            <CardDescription>Did you execute this trade or was it a missed opportunity?</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trade Status */}
            <FormField
              control={form.control}
              name="trade_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Did you execute this trade? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Executed">Yes — Executed</SelectItem>
                      <SelectItem value="Missed">No — Missed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Missed Reason - only show when missed */}
            {isMissedTrade && (
              <>
                <FormField
                  control={form.control}
                  name="missed_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why did you miss it? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MISSED_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hypothetical_result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hypothetical Result (hindsight)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="What would have happened?" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HYPOTHETICAL_RESULTS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* SECTION 1: Trade Identity & Time */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Trade Identity & Time</CardTitle>
            <CardDescription>Session timing is critical for Gold trading</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Trade Date */}
            <FormField
              control={form.control}
              name="trade_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Date *</FormLabel>
                  <FormControl>
                    <TradeDatePickerField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trade Time */}
            <FormField
              control={form.control}
              name="trade_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time *</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                      className="w-full"
                    />
                  </FormControl>
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
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          {/* High Impact News Context - Only visible when News Day = Yes */}
          {watchedValues.news_day === 'Yes' && (
            <>
              <Separator />
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">High Impact News Context</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* News Impact */}
                  <FormField
                    control={form.control}
                    name="news_impact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>News Impact *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NEWS_IMPACTS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* News Timing */}
                  <FormField
                    control={form.control}
                    name="news_timing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>News Timing *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NEWS_TIMINGS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* News Type */}
                  <FormField
                    control={form.control}
                    name="news_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>News Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NEWS_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* SECTION 2: Higher-Timeframe Context */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Higher-Timeframe Context</CardTitle>
            <CardDescription>HTF bias determines trade direction</CardDescription>
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

        {/* SECTION 3: Liquidity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Liquidity</CardTitle>
            <CardDescription>Core language of Gold — identify liquidity targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="liquidity_targeted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liquidity Targeted * (multi-select)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {LIQUIDITY_TARGETS.map(target => (
                      <label key={target} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
                        <Checkbox
                          checked={field.value?.includes(target)}
                          onCheckedChange={(checked) => {
                            const updated = checked 
                              ? [...(field.value || []), target]
                              : field.value?.filter((v: string) => v !== target) || [];
                            field.onChange(updated);
                          }}
                        />
                        <span className="text-sm">{target}</span>
                      </label>
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
                    <FormLabel>Liquidity Taken Before Entry *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                    <FormLabel>Liquidity Taken Against Bias *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: Setup Classification */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Setup Classification</CardTitle>
            <CardDescription>Standardize setups for pattern recognition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            </div>

            {/* Live Classification Preview */}
            {watchedValues.setup_type && watchedValues.setup_grade && (
              <div className={cn(
                "p-3 rounded-md border text-center",
                watchedValues.setup_grade === 'A+' 
                  ? "bg-profit/10 border-profit/30" 
                  : watchedValues.setup_grade === 'A' 
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/50 border-muted"
              )}>
                <span className="text-lg font-semibold">
                  {watchedValues.setup_type} — {watchedValues.setup_grade} Setup
                </span>
              </div>
            )}

            {/* Discipline Signal for Weak Grades */}
            {(watchedValues.setup_grade === 'B' || watchedValues.setup_grade === 'Trash') && (
              <p className="text-xs text-muted-foreground text-center">
                Low-quality setup — execute only if rules allow.
              </p>
            )}
          </CardContent>
        </Card>

        {/* SECTION 5: Entry Mechanics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Entry Mechanics</CardTitle>
            <CardDescription>Precise entry model and candle type</CardDescription>
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
                  <FormLabel>Confirmation Present *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 6: Price Levels & Risk */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Price Levels & Risk</CardTitle>
            <CardDescription>Entry, SL, TP, and risk parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="entry_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 2650.50" {...field} />
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
                      <Input type="number" step="0.01" placeholder="e.g. 2645.00" {...field} />
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
                      <Input type="number" step="0.01" placeholder="e.g. 2670.00" {...field} />
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
                      <Input type="number" step="0.01" placeholder="If closed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="risk_per_trade_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk % *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g. 1.0" {...field} />
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
                    <FormLabel>Planned RR *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g. 3.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mae"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MAE (pips)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Max adverse" {...field} />
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
                    <FormLabel>MFE (pips)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Max favorable" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auto-Calculated Fields (Read-Only) */}
            {autoCalculatedFields.result && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Auto-calculated:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Result:</span>
                  <Badge variant={autoCalculatedFields.result === 'Win' ? 'default' : autoCalculatedFields.result === 'Loss' ? 'destructive' : 'secondary'}>
                    {autoCalculatedFields.result}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">R Multiple:</span>
                  <span className={cn(
                    "font-mono",
                    parseFloat(autoCalculatedFields.r_multiple || '0') > 0 ? "text-profit" : "text-loss"
                  )}>
                    {autoCalculatedFields.r_multiple}R
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 7: Execution Discipline */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Execution Discipline</CardTitle>
            <CardDescription>Quality of trade execution</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            <FormField
              control={form.control}
              name="partial_taken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partial Taken *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 8: Gold Behavior Tags */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Gold Behavior Tags</CardTitle>
            <CardDescription>Identify Gold's personality patterns (optional, multi-select)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="gold_behavior_tags"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {GOLD_BEHAVIOR_TAGS.map(tag => (
                      <label key={tag} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
                        <Checkbox
                          checked={field.value?.includes(tag)}
                          onCheckedChange={(checked) => {
                            const updated = checked 
                              ? [...(field.value || []), tag]
                              : field.value?.filter((v: string) => v !== tag) || [];
                            field.onChange(updated);
                          }}
                        />
                        <span className="text-xs">{tag}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-3 gap-4">
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
                        {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                    <FormLabel>Real Move After Liq *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                    <FormLabel>Aligned w/ Real Move *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 9: Psychology */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Psychology</CardTitle>
            <CardDescription>Mental state tracking (minimal but critical)</CardDescription>
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
                  <Select 
                    onValueChange={(v) => field.onChange(parseInt(v))} 
                    value={field.value?.toString()}
                  >
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
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 10: Visual Evidence */}
        <Card className="glass-card border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Visual Evidence 
              <Badge variant="destructive">REQUIRED</Badge>
            </CardTitle>
            <CardDescription>2 screenshots required at entry — post-trade screenshot added after trade closes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Required screenshots at entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="htf_screenshot"
                render={({ field }) => (
                  <FormItem>
                    <EliteScreenshotUpload
                      label="HTF Screenshot"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={!field.value ? "Required" : undefined}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ltf_entry_screenshot"
                render={({ field }) => (
                  <FormItem>
                    <EliteScreenshotUpload
                      label="LTF Entry Screenshot"
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={!field.value ? "Required" : undefined}
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional post-trade screenshot */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Add after trade closes
              </p>
              <div className="max-w-md">
                <FormField
                  control={form.control}
                  name="post_trade_screenshot"
                  render={({ field }) => (
                    <FormItem>
                      <EliteScreenshotUpload
                        label="Post-Trade Screenshot"
                        value={field.value || ''}
                        onChange={field.onChange}
                        required={false}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="annotations_present"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annotations Present *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-48"><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 11: Final Intelligence Field */}
        <Card className="glass-card border-2 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-lg">Final Intelligence Field</CardTitle>
            <CardDescription>Most important learning accelerator — answer after trade closes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="would_i_take_this_trade_again"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Would I Take This Trade Again?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-48"><SelectValue placeholder="Select after close" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {YES_NO.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional observations, lessons learned..."
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            disabled={!screenshotsValid || isSubmitting}
            className={cn(
              "gap-2 min-w-[200px]",
              !screenshotsValid && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Elite Trade
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
