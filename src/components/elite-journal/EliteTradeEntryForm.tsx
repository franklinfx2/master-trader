// ELITE BACKTESTING ENGINE — Fast Entry Form
// Universal backtesting for any instrument | ≤90 seconds per trade
// No psychology, no gold-specific tags, optional screenshots
import { useState, useMemo } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Save, AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { TradeDatePickerField } from './TradeDatePickerField';
import { EliteScreenshotUpload } from './EliteScreenshotUpload';
import { SetupTypeSelector } from './SetupTypeSelector';
import { useEliteTrades } from '@/hooks/useEliteTrades';
import {
  ACCOUNT_TYPES,
  SESSIONS,
  KILLZONES,
  DAYS_OF_WEEK,
  HTF_BIASES,
  HTF_TIMEFRAMES,
  STRUCTURE_STATES,
  LIQUIDITY_TARGETS,
  COMMON_SETUP_TYPES,
  SETUP_GRADES,
  EXECUTION_TFS,
  ENTRY_MODELS,
  YES_NO,
  PRICE_POSITIONS,
  TRADE_STATUSES,
  MISSED_REASONS,
  HYPOTHETICAL_RESULTS,
  type LiquidityTarget,
  type TradeStatus,
  type MissedReason,
  type HypotheticalResult,
} from '@/types/eliteTrade';

// Streamlined schema for fast backtesting (no psychology, no gold-specific fields)
const backtestSchema = z.object({
  // Trade Context
  trade_date: z.date({ required_error: 'Trade date is required' }),
  trade_time: z.string().optional(),
  instrument: z.string().min(1, 'Instrument is required'),
  account_type: z.enum(['Demo', 'Live', 'Funded'], { required_error: 'Account type is required' }),
  
  // Trade Status
  trade_status: z.enum(['Executed', 'Missed']).default('Executed'),
  missed_reason: z.enum(['Hesitation', 'Away', 'Technical', 'Fear', 'Other']).optional(),
  hypothetical_result: z.enum(['Win', 'Loss', 'BE', 'Unknown']).optional(),
  
  // Session & Time
  session: z.enum(['Asia', 'London', 'NY'], { required_error: 'Session is required' }),
  killzone: z.enum(['LO', 'NYO', 'NYPM', 'None']).optional(),
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], { required_error: 'Day is required' }),
  news_day: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // HTF Context (Objective)
  htf_bias: z.enum(['Bullish', 'Bearish', 'Range'], { required_error: 'HTF bias is required' }),
  htf_timeframe: z.string().min(1, 'HTF timeframe is required'),
  structure_state: z.string().min(1, 'Structure state is required'),
  is_htf_clear: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  price_at_level_or_open: z.enum(['At Level', 'Open'], { required_error: 'Required' }),
  
  // Liquidity (Generic)
  liquidity_targeted: z.array(z.string()).min(1, 'Select at least one liquidity target'),
  liquidity_taken_before_entry: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Setup Definition (via registry)
  setup_type_id: z.string().optional(), // FK to setup_types table
  setup_type: z.string().min(1, 'Setup type is required'), // Code for display
  setup_grade: z.enum(['A+', 'A', 'B', 'Trash'], { required_error: 'Setup grade is required' }),
  execution_tf: z.string().min(1, 'Execution TF is required'),
  entry_model: z.string().min(1, 'Entry model is required'),
  confirmation_present: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  
  // Price Levels & Risk
  entry_price: z.string().min(1, 'Entry price is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be valid'),
  stop_loss: z.string().min(1, 'Stop loss is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be valid'),
  take_profit: z.string().min(1, 'Take profit is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be valid'),
  exit_price: z.string().optional(),
  risk_per_trade_pct: z.string().min(1, 'Risk % is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0 && parseFloat(v) <= 10, '0.1-10%'),
  rr_planned: z.string().min(1, 'Planned RR is required').refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be valid'),
  mae: z.string().optional(),
  mfe: z.string().optional(),
  
  // Rules Integrity
  rules_followed: z.enum(['Yes', 'No'], { required_error: 'Required' }),
  would_i_take_this_trade_again: z.enum(['Yes', 'No']).optional(),
  
  // Visual Evidence (ALL OPTIONAL)
  htf_screenshot: z.string().optional(),
  ltf_entry_screenshot: z.string().optional(),
  ltf_trade_screenshot: z.string().optional(),
  post_trade_screenshot: z.string().optional(),
});

type BacktestFormValues = z.infer<typeof backtestSchema>;

interface EliteTradeEntryFormProps {
  onSuccess?: () => void;
}

export const EliteTradeEntryForm = ({ onSuccess }: EliteTradeEntryFormProps) => {
  const { addTrade } = useEliteTrades();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSetupType, setCustomSetupType] = useState('');

  const form = useForm<BacktestFormValues>({
    resolver: zodResolver(backtestSchema),
    defaultValues: {
      trade_date: new Date(),
      trade_time: '',
      instrument: 'XAUUSD',
      trade_status: 'Executed',
      killzone: 'None',
      liquidity_targeted: [],
      entry_price: '',
      stop_loss: '',
      take_profit: '',
      exit_price: '',
      risk_per_trade_pct: '1',
      rr_planned: '',
      mae: '',
      mfe: '',
      htf_screenshot: '',
      ltf_entry_screenshot: '',
      ltf_trade_screenshot: '',
      post_trade_screenshot: '',
      is_htf_clear: 'No',
      price_at_level_or_open: 'At Level',
    },
  });

  const watchedValues = form.watch();
  const isMissedTrade = watchedValues.trade_status === 'Missed';

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

  const onSubmit = async (data: BacktestFormValues) => {
    setIsSubmitting(true);

    // Normalize setup type
    const normalizedSetupType = data.setup_type === 'Custom' && customSetupType 
      ? customSetupType.trim().toUpperCase() 
      : data.setup_type;

    const formData = {
      trade_date: format(data.trade_date, 'yyyy-MM-dd'),
      trade_time: data.trade_time || undefined,
      instrument: data.instrument.toUpperCase(),
      account_type: data.account_type,
      trade_status: data.trade_status as TradeStatus,
      missed_reason: data.trade_status === 'Missed' ? data.missed_reason as MissedReason : undefined,
      hypothetical_result: data.trade_status === 'Missed' ? data.hypothetical_result as HypotheticalResult : undefined,
      session: data.session,
      killzone: data.killzone,
      day_of_week: data.day_of_week,
      news_day: data.news_day,
      htf_bias: data.htf_bias,
      htf_timeframe: data.htf_timeframe as any,
      structure_state: data.structure_state as any,
      is_htf_clear: data.is_htf_clear,
      price_at_level_or_open: data.price_at_level_or_open as any,
      liquidity_targeted: data.liquidity_targeted as LiquidityTarget[],
      liquidity_taken_before_entry: data.liquidity_taken_before_entry,
      setup_type_id: data.setup_type_id, // New canonical FK
      setup_type: data.setup_type, // Code for display
      setup_grade: data.setup_grade,
      execution_tf: data.execution_tf as any,
      entry_model: data.entry_model as any,
      confirmation_present: data.confirmation_present,
      entry_price: data.entry_price,
      stop_loss: data.stop_loss,
      take_profit: data.take_profit,
      exit_price: data.exit_price || '',
      risk_per_trade_pct: data.risk_per_trade_pct,
      rr_planned: data.rr_planned,
      rules_followed: data.rules_followed,
      would_i_take_this_trade_again: data.would_i_take_this_trade_again,
      htf_screenshot: data.htf_screenshot || '',
      ltf_entry_screenshot: data.ltf_entry_screenshot || '',
      ltf_trade_screenshot: data.ltf_trade_screenshot || '',
      post_trade_screenshot: data.post_trade_screenshot || '',
      mae: data.mae || '',
      mfe: data.mfe || '',
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
        description: "Backtest entry logged successfully.",
      });
      form.reset();
      setCustomSetupType('');
      onSuccess?.();
    }
  };

  const onInvalid = (errors: FieldErrors<BacktestFormValues>) => {
    const firstKey = Object.keys(errors)[0] as keyof BacktestFormValues | undefined;

    toast({
      title: 'Missing required fields',
      description: 'Please complete the required fields marked with * before saving.',
      variant: 'destructive',
    });

    if (firstKey) {
      // Focus the first invalid field to make the failure obvious.
      form.setFocus(firstKey);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        {/* Backtesting Engine Banner */}
        <Alert className="border-primary/30 bg-primary/5">
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-medium">Backtesting Engine</span>
              <span className="text-muted-foreground text-sm">— Fast data capture, any instrument</span>
            </div>
            <Badge variant="secondary">
              Use Trades for psychology & journaling
            </Badge>
          </AlertDescription>
        </Alert>

        {/* SECTION 0: Trade Status */}
        {isMissedTrade && (
          <Card className="glass-card border-amber-500/50 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Missed Trade
                <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">Recording</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="missed_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why missed?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <FormLabel>Hypothetical Result</FormLabel>
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
            </CardContent>
          </Card>
        )}

        {/* SECTION 1: Trade Context */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Trade Context</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <FormField
              control={form.control}
              name="instrument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrument *</FormLabel>
                  <FormControl>
                    <Input placeholder="XAUUSD" {...field} className="uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trade_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <TradeDatePickerField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trade_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="trade_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRADE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 2: HTF Context */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">HTF Context</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
              name="structure_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Structure *</FormLabel>
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

            <FormField
              control={form.control}
              name="is_htf_clear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is HTF Clear? *</FormLabel>
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
              name="price_at_level_or_open"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Position *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRICE_POSITIONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Liquidity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField
              control={form.control}
              name="liquidity_targeted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liquidity Targeted * (multi-select)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {LIQUIDITY_TARGETS.map(target => (
                      <label key={target} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors text-sm">
                        <Checkbox
                          checked={field.value?.includes(target)}
                          onCheckedChange={(checked) => {
                            const updated = checked 
                              ? [...(field.value || []), target]
                              : field.value?.filter((v: string) => v !== target) || [];
                            field.onChange(updated);
                          }}
                        />
                        <span>{target}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="liquidity_taken_before_entry"
              render={({ field }) => (
                <FormItem className="max-w-xs">
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
          </CardContent>
        </Card>

        {/* SECTION 4: Setup Definition */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Setup Definition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="setup_type"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Setup Type *</FormLabel>
                    <SetupTypeSelector
                      value={form.getValues('setup_type_id') || null}
                      onChange={(id, code) => {
                        form.setValue('setup_type_id', id);
                        field.onChange(code);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setup_grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade *</FormLabel>
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
                        {EXECUTION_TFS.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="confirmation_present"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation *</FormLabel>
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
                  {watchedValues.setup_type === 'Custom' && customSetupType ? customSetupType.toUpperCase() : watchedValues.setup_type} — {watchedValues.setup_grade}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 5: Risk & Outcome */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Risk & Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="entry_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.00001" placeholder="Entry price" {...field} />
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
                      <Input type="number" step="0.00001" placeholder="SL price" {...field} />
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
                      <Input type="number" step="0.00001" placeholder="TP price" {...field} />
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
                      <Input type="number" step="0.00001" placeholder="If closed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="risk_per_trade_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk % *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="1.0" {...field} />
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
                      <Input type="number" step="0.1" placeholder="3.0" {...field} />
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

            {/* Auto-Calculated Fields */}
            {autoCalculatedFields.result && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Auto:</span>
                <Badge variant={autoCalculatedFields.result === 'Win' ? 'default' : autoCalculatedFields.result === 'Loss' ? 'destructive' : 'secondary'}>
                  {autoCalculatedFields.result}
                </Badge>
                <span className={cn(
                  "font-mono font-semibold",
                  parseFloat(autoCalculatedFields.r_multiple || '0') > 0 ? "text-profit" : "text-loss"
                )}>
                  {autoCalculatedFields.r_multiple}R
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 6: Rules Integrity */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rules Integrity</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rules_followed"
              render={({ field }) => (
                <FormItem className="max-w-xs">
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
            <FormField
              control={form.control}
              name="would_i_take_this_trade_again"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Would Take Again?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
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

        {/* SECTION 7: Visual Evidence (Optional) */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              Visual Evidence
              <Badge variant="secondary">Optional</Badge>
            </CardTitle>
            <CardDescription>Screenshots never block saving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="htf_screenshot"
                render={({ field }) => (
                  <FormItem>
                    <EliteScreenshotUpload
                      label="HTF Screenshot"
                      value={field.value || ''}
                      onChange={field.onChange}
                      required={false}
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
                      value={field.value || ''}
                      onChange={field.onChange}
                      required={false}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ltf_trade_screenshot"
                render={({ field }) => (
                  <FormItem>
                    <EliteScreenshotUpload
                      label="LTF Trade Screenshot"
                      value={field.value || ''}
                      onChange={field.onChange}
                      required={false}
                    />
                  </FormItem>
                )}
              />

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
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
            className="gap-2 min-w-[200px]"
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Backtest
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
