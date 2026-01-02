// ELITE BACKTESTING ENGINE — Edit Modal (Streamlined)
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Save, ChevronDown, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

import { EliteScreenshotUpload } from './EliteScreenshotUpload';
import { TradeDatePickerField } from './TradeDatePickerField';
import { SetupTypeSelector } from './SetupTypeSelector';
import { useEliteTrades } from '@/hooks/useEliteTrades';
import { EliteTrade } from '@/types/eliteTrade';
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
  TRADE_STATUSES,
  MISSED_REASONS,
  HYPOTHETICAL_RESULTS,
  type LiquidityTarget,
} from '@/types/eliteTrade';

// Streamlined schema for backtesting engine
const editTradeSchema = z.object({
  // Trade Context
  trade_date: z.date({ required_error: 'Trade date is required' }),
  trade_time: z.string().optional(),
  instrument: z.string().min(1, 'Instrument is required'),
  account_type: z.enum(['Demo', 'Live', 'Funded']),
  trade_status: z.enum(['Executed', 'Missed']),
  missed_reason: z.enum(['Hesitation', 'Away', 'Technical', 'Fear', 'Other']).optional(),
  hypothetical_result: z.enum(['Win', 'Loss', 'BE', 'Unknown']).optional(),
  
  // Session & Time
  session: z.enum(['Asia', 'London', 'NY']),
  killzone: z.string().optional(),
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
  news_day: z.enum(['Yes', 'No']),
  
  // HTF Context (Objective)
  htf_bias: z.enum(['Bullish', 'Bearish', 'Range']),
  htf_timeframe: z.string().min(1, 'Required'),
  structure_state: z.string().min(1, 'Required'),
  
  // Liquidity (Generic)
  liquidity_targeted: z.array(z.string()).min(1, 'Select at least one'),
  liquidity_taken_before_entry: z.enum(['Yes', 'No']),
  
  // Setup Definition (via registry)
  setup_type_id: z.string().optional(), // FK to setup_types
  setup_type: z.string().min(1, 'Required'), // Code for display
  setup_grade: z.enum(['A+', 'A', 'B', 'Trash']),
  execution_tf: z.string().min(1, 'Required'),
  entry_model: z.string().min(1, 'Required'),
  confirmation_present: z.enum(['Yes', 'No']),
  
  // Price Levels & Risk
  entry_price: z.string().min(1, 'Entry price is required'),
  stop_loss: z.string().min(1, 'Stop loss is required'),
  take_profit: z.string().min(1, 'Take profit is required'),
  exit_price: z.string().optional(),
  risk_per_trade_pct: z.string().min(1, 'Risk % is required'),
  rr_planned: z.string().min(1, 'Planned RR is required'),
  mae: z.string().optional(),
  mfe: z.string().optional(),
  
  // Rules Integrity
  rules_followed: z.enum(['Yes', 'No']),
  
  // Visual Evidence (All optional)
  htf_screenshot: z.string().optional(),
  ltf_entry_screenshot: z.string().optional(),
  ltf_trade_screenshot: z.string().optional(),
  post_trade_screenshot: z.string().optional(),
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
  const [customSetupType, setCustomSetupType] = useState('');

  const getDefaultValues = (t: EliteTrade): EditTradeFormValues => ({
    trade_date: new Date(t.trade_date),
    trade_time: t.trade_time || '',
    instrument: t.instrument || 'XAUUSD',
    account_type: t.account_type,
    trade_status: t.trade_status || 'Executed',
    missed_reason: t.missed_reason || undefined,
    hypothetical_result: t.hypothetical_result || undefined,
    session: t.session,
    killzone: t.killzone || 'None',
    day_of_week: t.day_of_week,
    news_day: t.news_day,
    htf_bias: t.htf_bias,
    htf_timeframe: t.htf_timeframe || 'H4',
    structure_state: t.structure_state || 'Continuation',
    liquidity_targeted: t.liquidity_targeted || [],
    liquidity_taken_before_entry: t.liquidity_taken_before_entry,
    setup_type: t.setup_type || '',
    setup_grade: t.setup_grade,
    execution_tf: t.execution_tf || 'M5',
    entry_model: t.entry_model || 'Order Block',
    confirmation_present: t.confirmation_present,
    entry_price: String(t.entry_price),
    stop_loss: String(t.stop_loss),
    take_profit: String(t.take_profit),
    exit_price: t.exit_price ? String(t.exit_price) : '',
    risk_per_trade_pct: String(t.risk_per_trade_pct),
    rr_planned: String(t.rr_planned),
    mae: t.mae ? String(t.mae) : '',
    mfe: t.mfe ? String(t.mfe) : '',
    rules_followed: t.rules_followed,
    htf_screenshot: t.htf_screenshot || '',
    ltf_entry_screenshot: t.ltf_entry_screenshot || '',
    ltf_trade_screenshot: t.ltf_trade_screenshot || '',
    post_trade_screenshot: t.post_trade_screenshot || '',
  });

  const form = useForm<EditTradeFormValues>({
    resolver: zodResolver(editTradeSchema),
    defaultValues: getDefaultValues(trade),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(trade));
      // Check if setup_type is custom
      const currentSetup = trade.setup_type || '';
      if (!COMMON_SETUP_TYPES.includes(currentSetup) && currentSetup !== '') {
        setCustomSetupType(currentSetup);
      } else {
        setCustomSetupType('');
      }
    }
  }, [trade, open, form]);

  const watchedValues = form.watch();
  const isMissedTrade = watchedValues.trade_status === 'Missed';

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

    // Normalize setup type
    const normalizedSetupType = data.setup_type === 'Custom' && customSetupType 
      ? customSetupType.trim().toUpperCase() 
      : data.setup_type;

    const formData = {
      trade_date: format(data.trade_date, 'yyyy-MM-dd'),
      trade_time: data.trade_time || undefined,
      instrument: data.instrument.toUpperCase(),
      account_type: data.account_type,
      trade_status: data.trade_status,
      missed_reason: data.trade_status === 'Missed' ? data.missed_reason : undefined,
      hypothetical_result: data.trade_status === 'Missed' ? data.hypothetical_result : undefined,
      session: data.session,
      killzone: data.killzone as any,
      day_of_week: data.day_of_week,
      news_day: data.news_day,
      htf_bias: data.htf_bias,
      htf_timeframe: data.htf_timeframe as any,
      structure_state: data.structure_state as any,
      liquidity_targeted: data.liquidity_targeted as LiquidityTarget[],
      liquidity_taken_before_entry: data.liquidity_taken_before_entry,
      setup_type: normalizedSetupType,
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
      htf_screenshot: data.htf_screenshot || '',
      ltf_entry_screenshot: data.ltf_entry_screenshot || '',
      ltf_trade_screenshot: data.ltf_trade_screenshot || '',
      post_trade_screenshot: data.post_trade_screenshot || '',
      mae: data.mae || '',
      mfe: data.mfe || '',
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
        description: "Backtest entry updated successfully.",
      });
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Edit Backtest Entry
          </DialogTitle>
          <DialogDescription>Modify trade data. Screenshots never block saving.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Auto-Calculated Preview */}
              {autoCalculatedFields.result && !isMissedTrade && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
                  <span className="text-sm text-muted-foreground">Auto:</span>
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

              {/* Section 1: Trade Context */}
              <Section title="Trade Context" defaultOpen={true}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <FormField
                    control={form.control}
                    name="instrument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instrument</FormLabel>
                        <FormControl>
                          <Input {...field} className="uppercase" />
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
                        <FormLabel>Date</FormLabel>
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
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account</FormLabel>
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
                    name="day_of_week"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="trade_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
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
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <FormField
                      control={form.control}
                      name="missed_reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Missed Reason</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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

              {/* Section 2: HTF Context */}
              <Section title="HTF Context" defaultOpen={false}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
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
                    name="structure_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Structure</FormLabel>
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

              {/* Section 3: Liquidity */}
              <Section title="Liquidity" defaultOpen={false}>
                <div className="space-y-3 pt-2">
                  <FormField
                    control={form.control}
                    name="liquidity_targeted"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Liquidity Targeted</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {LIQUIDITY_TARGETS.map(target => (
                            <label key={target} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent cursor-pointer text-xs">
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
                </div>
              </Section>

              {/* Section 4: Setup Definition */}
              <Section title="Setup Definition" defaultOpen={false}>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="setup_type"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Setup Type</FormLabel>
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
                          <FormLabel>Grade</FormLabel>
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
                      name="confirmation_present"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmation</FormLabel>
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

              {/* Section 5: Risk & Outcome */}
              <Section title="Risk & Outcome" defaultOpen={false}>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FormField
                      control={form.control}
                      name="entry_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entry</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.00001" {...field} />
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
                            <Input type="number" step="0.00001" {...field} />
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
                            <Input type="number" step="0.00001" {...field} />
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
                          <FormLabel>Planned RR</FormLabel>
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
                          <FormLabel>MAE (pips)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
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
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="rules_followed"
                    render={({ field }) => (
                      <FormItem className="max-w-xs">
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

              {/* Section 6: Visual Evidence */}
              <Section title="Visual Evidence (Optional)" defaultOpen={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
              </Section>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
