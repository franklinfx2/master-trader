// Elite Trade Edit Modal — Allows editing existing trades
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import { CalendarIcon, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
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
  NEWS_IMPACTS,
  NEWS_TIMINGS,
  NEWS_TYPES,
  type LiquidityTarget,
  type GoldBehaviorTag,
} from '@/types/eliteTrade';

// Schema for edit form
const editTradeSchema = z.object({
  trade_date: z.date({ required_error: 'Trade date is required' }),
  trade_time: z.string().optional(),
  account_type: z.enum(['Demo', 'Live', 'Funded']),
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

export const EliteTradeEditModal = ({ trade, open, onOpenChange, onSuccess }: EliteTradeEditModalProps) => {
  const { updateTrade } = useEliteTrades();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditTradeFormValues>({
    resolver: zodResolver(editTradeSchema),
    defaultValues: {
      trade_date: new Date(trade.trade_date),
      trade_time: trade.trade_time || '',
      account_type: trade.account_type,
      session: trade.session,
      killzone: trade.killzone,
      day_of_week: trade.day_of_week,
      news_day: trade.news_day,
      news_impact: trade.news_impact || undefined,
      news_timing: trade.news_timing || undefined,
      news_type: trade.news_type || undefined,
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
      entry_price: String(trade.entry_price),
      stop_loss: String(trade.stop_loss),
      take_profit: String(trade.take_profit),
      exit_price: trade.exit_price ? String(trade.exit_price) : '',
      risk_per_trade_pct: String(trade.risk_per_trade_pct),
      rr_planned: String(trade.rr_planned),
      entry_precision: trade.entry_precision,
      stop_placement_quality: trade.stop_placement_quality,
      partial_taken: trade.partial_taken,
      rules_followed: trade.rules_followed,
      gold_behavior_tags: trade.gold_behavior_tags || [],
      first_move_was_fake: trade.first_move_was_fake,
      real_move_after_liquidity: trade.real_move_after_liquidity,
      trade_aligned_with_real_move: trade.trade_aligned_with_real_move,
      pre_trade_state: trade.pre_trade_state,
      confidence_level: trade.confidence_level,
      revenge_trade: trade.revenge_trade,
      fatigue_present: trade.fatigue_present,
      htf_screenshot: trade.htf_screenshot || '',
      ltf_entry_screenshot: trade.ltf_entry_screenshot || '',
      post_trade_screenshot: trade.post_trade_screenshot || '',
      annotations_present: trade.annotations_present,
      mae: trade.mae ? String(trade.mae) : '',
      mfe: trade.mfe ? String(trade.mfe) : '',
      would_i_take_this_trade_again: trade.would_i_take_this_trade_again || undefined,
      notes: trade.notes || '',
    },
  });

  // Reset form when trade changes
  useEffect(() => {
    if (open) {
      form.reset({
        trade_date: new Date(trade.trade_date),
        trade_time: trade.trade_time || '',
        account_type: trade.account_type,
        session: trade.session,
        killzone: trade.killzone,
        day_of_week: trade.day_of_week,
        news_day: trade.news_day,
        news_impact: trade.news_impact || undefined,
        news_timing: trade.news_timing || undefined,
        news_type: trade.news_type || undefined,
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
        entry_price: String(trade.entry_price),
        stop_loss: String(trade.stop_loss),
        take_profit: String(trade.take_profit),
        exit_price: trade.exit_price ? String(trade.exit_price) : '',
        risk_per_trade_pct: String(trade.risk_per_trade_pct),
        rr_planned: String(trade.rr_planned),
        entry_precision: trade.entry_precision,
        stop_placement_quality: trade.stop_placement_quality,
        partial_taken: trade.partial_taken,
        rules_followed: trade.rules_followed,
        gold_behavior_tags: trade.gold_behavior_tags || [],
        first_move_was_fake: trade.first_move_was_fake,
        real_move_after_liquidity: trade.real_move_after_liquidity,
        trade_aligned_with_real_move: trade.trade_aligned_with_real_move,
        pre_trade_state: trade.pre_trade_state,
        confidence_level: trade.confidence_level,
        revenge_trade: trade.revenge_trade,
        fatigue_present: trade.fatigue_present,
        htf_screenshot: trade.htf_screenshot || '',
        ltf_entry_screenshot: trade.ltf_entry_screenshot || '',
        post_trade_screenshot: trade.post_trade_screenshot || '',
        annotations_present: trade.annotations_present,
        mae: trade.mae ? String(trade.mae) : '',
        mfe: trade.mfe ? String(trade.mfe) : '',
        would_i_take_this_trade_again: trade.would_i_take_this_trade_again || undefined,
        notes: trade.notes || '',
      });
    }
  }, [trade, open, form]);

  const watchedValues = form.watch();

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

  const onSubmit = async (data: EditTradeFormValues) => {
    setIsSubmitting(true);

    const formData = {
      trade_date: format(data.trade_date, 'yyyy-MM-dd'),
      trade_time: data.trade_time || null,
      account_type: data.account_type,
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
          <DialogDescription>Update trade details, add exit price, or upload post-trade screenshot</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Auto-Calculated Preview */}
              {autoCalculatedFields.result && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm text-muted-foreground">Auto-calculated:</span>
                  <Badge variant={autoCalculatedFields.result === 'Win' ? 'default' : autoCalculatedFields.result === 'Loss' ? 'destructive' : 'outline'}>
                    {autoCalculatedFields.result}
                  </Badge>
                  <span className={cn(
                    "font-mono text-sm font-semibold",
                    Number(autoCalculatedFields.r_multiple) > 0 ? "text-profit" : "text-loss"
                  )}>
                    {Number(autoCalculatedFields.r_multiple) > 0 ? '+' : ''}{autoCalculatedFields.r_multiple}R
                  </span>
                </div>
              )}

              {/* Key Editable Fields Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Trade Closure (Complete the Trade)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="exit_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exit Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                  <FormField
                    control={form.control}
                    name="would_i_take_this_trade_again"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Would Take Again?</FormLabel>
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
              </div>

              <Separator />

              {/* Post-Trade Screenshot */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Post-Trade Screenshot</h3>
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

              <Separator />

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Trade Notes & Reflection</h3>
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

              <Separator />

              {/* Execution Discipline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Execution Discipline</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <FormField
                    control={form.control}
                    name="annotations_present"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annotations</FormLabel>
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
