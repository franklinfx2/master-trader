// Elite Trade Edit Modal — Full Edit Capability
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Save, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { EliteScreenshotUpload } from './EliteScreenshotUpload';
import { TradeDatePickerField } from './TradeDatePickerField';
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
  NEWS_IMPACTS,
  NEWS_TIMINGS,
  NEWS_TYPES,
  TRADE_STATUSES,
  MISSED_REASONS,
  HYPOTHETICAL_RESULTS,
  type LiquidityTarget,
  type GoldBehaviorTag,
} from '@/types/eliteTrade';

// Schema for edit form
const editTradeSchema = z.object({
  trade_date: z.date({ required_error: 'Trade date is required' }),
  trade_time: z.string().optional(),
  account_type: z.enum(['Demo', 'Live', 'Funded']),
  trade_status: z.enum(['Executed', 'Missed']),
  missed_reason: z.enum(['Hesitation', 'Away', 'Technical', 'Fear', 'Other']).optional(),
  hypothetical_result: z.enum(['Win', 'Loss', 'BE', 'Unknown']).optional(),
  session: z.enum(['Asia', 'London', 'NY']),
  killzone: z.enum(['LO', 'NYO', 'NYPM', 'None']),
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  news_day: z.enum(['Yes', 'No']),
  news_impact: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  news_timing: z.enum(['PRE_NEWS', 'AT_RELEASE', 'POST_NEWS']).optional(),
  news_type: z.enum(['INFLATION', 'RATES', 'EMPLOYMENT', 'RISK_SENTIMENT', 'NONE']).optional(),
  htf_bias: z.enum(['Bullish', 'Bearish', 'Range']),
  htf_timeframe: z.enum(['H4', 'H1']),
  market_phase: z.enum(['Expansion', 'Retracement', 'Consolidation']),
  structure_state: z.enum(['HH-HL', 'LH-LL', 'CHoCH', 'BOS']),
  liquidity_targeted: z.array(z.string()).min(1, 'Select at least one liquidity target'),
  liquidity_taken_before_entry: z.enum(['Yes', 'No']),
  liquidity_taken_against_bias: z.enum(['Yes', 'No']),
  setup_type: z.enum(['OBC', 'OBR', 'BB']),
  setup_grade: z.enum(['A+', 'A', 'B', 'Trash']),
  execution_tf: z.enum(['M1', 'M3', 'M5']),
  entry_model: z.enum(['OB retest', 'Sweep → Displacement → OB', 'BOS pullback']),
  entry_candle: z.enum(['Engulfing', 'Displacement', 'Rejection', 'Break & Retest']),
  confirmation_present: z.enum(['Yes', 'No']),
  entry_price: z.string().min(1, 'Entry price is required'),
  stop_loss: z.string().min(1, 'Stop loss is required'),
  take_profit: z.string().min(1, 'Take profit is required'),
  exit_price: z.string().optional(),
  risk_per_trade_pct: z.string().min(1, 'Risk % is required'),
  rr_planned: z.string().min(1, 'Planned RR is required'),
  entry_precision: z.enum(['Early', 'Optimal', 'Late']),
  stop_placement_quality: z.enum(['Clean', 'Wide', 'Tight']),
  partial_taken: z.enum(['Yes', 'No']),
  rules_followed: z.enum(['Yes', 'No']),
  gold_behavior_tags: z.array(z.string()).default([]),
  first_move_was_fake: z.enum(['Yes', 'No']),
  real_move_after_liquidity: z.enum(['Yes', 'No']),
  trade_aligned_with_real_move: z.enum(['Yes', 'No']),
  pre_trade_state: z.enum(['Calm', 'FOMO', 'Hesitant', 'Overconfident']),
  confidence_level: z.number().min(1).max(5),
  revenge_trade: z.enum(['Yes', 'No']),
  fatigue_present: z.enum(['Yes', 'No']),
  htf_screenshot: z.string().optional(),
  ltf_entry_screenshot: z.string().optional(),
  post_trade_screenshot: z.string().optional(),
  annotations_present: z.enum(['Yes', 'No']),
  mae: z.string().optional(),
  mfe: z.string().optional(),
  would_i_take_this_trade_again: z.enum(['Yes', 'No']).optional(),
  notes: z.string().optional(),
});

type EditTradeFormValues = z.infer<typeof editTradeSchema>;

interface EliteTradeEditModalProps {
  trade: EliteTrade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Collapsible Section Component
const Section = ({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
        <span className="font-semibold text-sm">{title}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const EliteTradeEditModal = ({ trade, open, onOpenChange, onSuccess }: EliteTradeEditModalProps) => {
  const { updateTrade } = useEliteTrades();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDefaultValues = (t: EliteTrade): EditTradeFormValues => ({
    trade_date: new Date(t.trade_date),
    trade_time: t.trade_time || '',
    account_type: t.account_type,
    trade_status: t.trade_status || 'Executed',
    missed_reason: t.missed_reason || undefined,
    hypothetical_result: t.hypothetical_result || undefined,
    session: t.session,
    killzone: t.killzone,
    day_of_week: t.day_of_week,
    news_day: t.news_day,
    news_impact: t.news_impact || undefined,
    news_timing: t.news_timing || undefined,
    news_type: t.news_type || undefined,
    htf_bias: t.htf_bias,
    htf_timeframe: t.htf_timeframe,
    market_phase: t.market_phase,
    structure_state: t.structure_state,
    liquidity_targeted: t.liquidity_targeted || [],
    liquidity_taken_before_entry: t.liquidity_taken_before_entry,
    liquidity_taken_against_bias: t.liquidity_taken_against_bias,
    setup_type: t.setup_type,
    setup_grade: t.setup_grade,
    execution_tf: t.execution_tf,
    entry_model: t.entry_model,
    entry_candle: t.entry_candle,
    confirmation_present: t.confirmation_present,
    entry_price: String(t.entry_price),
    stop_loss: String(t.stop_loss),
    take_profit: String(t.take_profit),
    exit_price: t.exit_price ? String(t.exit_price) : '',
    risk_per_trade_pct: String(t.risk_per_trade_pct),
    rr_planned: String(t.rr_planned),
    entry_precision: t.entry_precision,
    stop_placement_quality: t.stop_placement_quality,
    partial_taken: t.partial_taken,
    rules_followed: t.rules_followed,
    gold_behavior_tags: t.gold_behavior_tags || [],
    first_move_was_fake: t.first_move_was_fake,
    real_move_after_liquidity: t.real_move_after_liquidity,
    trade_aligned_with_real_move: t.trade_aligned_with_real_move,
    pre_trade_state: t.pre_trade_state,
    confidence_level: t.confidence_level,
    revenge_trade: t.revenge_trade,
    fatigue_present: t.fatigue_present,
    htf_screenshot: t.htf_screenshot || '',
    ltf_entry_screenshot: t.ltf_entry_screenshot || '',
    post_trade_screenshot: t.post_trade_screenshot || '',
    annotations_present: t.annotations_present || 'No',
    mae: t.mae ? String(t.mae) : '',
    mfe: t.mfe ? String(t.mfe) : '',
    would_i_take_this_trade_again: t.would_i_take_this_trade_again || undefined,
    notes: t.notes || '',
  });

  const form = useForm<EditTradeFormValues>({
    resolver: zodResolver(editTradeSchema),
    defaultValues: getDefaultValues(trade),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(trade));
    }
  }, [trade, open, form]);

  const watchedValues = form.watch();
  const isMissedTrade = watchedValues.trade_status === 'Missed';
  const isNewsDay = watchedValues.news_day === 'Yes';

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

  const onSubmit = async (data: EditTradeFormValues) => {
    setIsSubmitting(true);

    const formData = {
      trade_date: format(data.trade_date, 'yyyy-MM-dd'),
      trade_time: data.trade_time || null,
      account_type: data.account_type,
      trade_status: data.trade_status,
      missed_reason: data.trade_status === 'Missed' ? data.missed_reason : undefined,
      hypothetical_result: data.trade_status === 'Missed' ? data.hypothetical_result : undefined,
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
      post_trade_screenshot: data.post_trade_screenshot || '',
      annotations_present: data.annotations_present,
      mae: data.mae || '',
      mfe: data.mfe || '',
      would_i_take_this_trade_again: data.would_i_take_this_trade_again,
      notes: data.notes || '',
    };

    const { error } = await updateTrade(trade.id, formData);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update trade. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Trade Updated",
        description: "Elite trade updated successfully.",
      });
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>Modify any field. Existing values are preserved until changed.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Auto-Calculated Preview */}
              {autoCalculatedFields.result && !isMissedTrade && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm text-muted-foreground">Auto-calculated:</span>
                  <Badge variant={autoCalculatedFields.result === 'Win' ? 'default' : autoCalculatedFields.result === 'Loss' ? 'destructive' : 'outline'}>
                    {autoCalculatedFields.result}
                  </Badge>
                  <span className={cn(
                    "font-mono text-sm font-semibold",
                    Number(autoCalculatedFields.r_multiple) > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {Number(autoCalculatedFields.r_multiple) > 0 ? '+' : ''}{autoCalculatedFields.r_multiple}R
                  </span>
                </div>
              )}

              {/* Section 1: Trade Identity & Status */}
              <Section title="Trade Identity & Status" defaultOpen={true}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="trade_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade Date</FormLabel>
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
                        <FormLabel>Trade Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ACCOUNT_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Trade Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRADE_STATUSES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {isMissedTrade && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="missed_reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Missed Reason</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MISSED_REASONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                              <SelectTrigger><SelectValue placeholder="Select result" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {HYPOTHETICAL_RESULTS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </Section>

              {/* Section 2: Session & Timing */}
              <Section title="Session & Timing">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="session"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SESSIONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="killzone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Killzone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {KILLZONES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Day of Week</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>News Day</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                {isNewsDay && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="news_impact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>News Impact</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="news_timing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>News Timing</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="news_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>News Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                )}
              </Section>

              {/* Section 3: Higher-Timeframe Context */}
              <Section title="Higher-Timeframe Context">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="htf_bias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTF Bias</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {HTF_BIASES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>HTF Timeframe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {HTF_TIMEFRAMES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Market Phase</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MARKET_PHASES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Structure State</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STRUCTURE_STATES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Section>

              {/* Section 4: Liquidity Analysis */}
              <Section title="Liquidity Analysis">
                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="liquidity_targeted"
                    render={() => (
                      <FormItem>
                        <FormLabel>Liquidity Targeted (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {LIQUIDITY_TARGETS.map((target) => (
                            <FormField
                              key={target}
                              control={form.control}
                              name="liquidity_targeted"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
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
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">{target}</FormLabel>
                                </FormItem>
                              )}
                            />
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
                          <FormLabel>Liquidity Taken Before Entry</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
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
                          <FormLabel>Liquidity Taken Against Bias</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
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
                </div>
              </Section>

              {/* Section 5: Setup Classification */}
              <Section title="Setup Classification">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="setup_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setup Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SETUP_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Setup Grade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SETUP_GRADES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Execution TF</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXECUTION_TFS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Entry Model</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ENTRY_MODELS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Entry Candle</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ENTRY_CANDLES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Confirmation Present</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
              </Section>

              {/* Section 6: Price Levels & Risk */}
              <Section title="Price Levels & Risk" defaultOpen={true}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="entry_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Price</FormLabel>
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
                        <FormLabel>Stop Loss</FormLabel>
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
                        <FormLabel>Take Profit</FormLabel>
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
                          <Input type="number" step="0.01" placeholder="Enter to close trade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="risk_per_trade_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk %</FormLabel>
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
                        <FormLabel>RR Planned</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
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
                        <FormLabel>MAE (Max Adverse)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                        <FormLabel>MFE (Max Favorable)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Section>

              {/* Section 7: Execution Discipline */}
              <Section title="Execution Discipline">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="entry_precision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Precision</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ENTRY_PRECISIONS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Stop Placement</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STOP_PLACEMENT_QUALITIES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Partials Taken</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <FormLabel>Rules Followed</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
              </Section>

              {/* Section 8: Gold Behavior & Sequence */}
              <Section title="Gold Behavior & Sequence">
                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="gold_behavior_tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Gold Behavior Tags (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {GOLD_BEHAVIOR_TAGS.map((tag) => (
                            <FormField
                              key={tag}
                              control={form.control}
                              name="gold_behavior_tags"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
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
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">{tag}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="first_move_was_fake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Move Was Fake</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
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
                          <FormLabel>Real Move After Liquidity</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
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
                          <FormLabel>Aligned With Real Move</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue /></SelectTrigger>
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
                </div>
              </Section>

              {/* Section 9: Psychology */}
              <Section title="Psychology">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="pre_trade_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pre-Trade State</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRE_TRADE_STATES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
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
                        <FormLabel>Confidence (1-5)</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
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
                        <FormLabel>Revenge Trade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <FormLabel>Fatigue Present</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
              </Section>

              {/* Section 10: Visual Evidence */}
              <Section title="Visual Evidence">
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <FormMessage />
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
                          <FormMessage />
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
                        <FormLabel>Annotations Present</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
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
              </Section>

              {/* Section 11: Notes & Review */}
              <Section title="Notes & Review">
                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="would_i_take_this_trade_again"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Would I Take This Trade Again?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-32"><SelectValue placeholder="Select" /></SelectTrigger>
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
                            placeholder="What did you learn from this trade? Any observations?"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Section>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
