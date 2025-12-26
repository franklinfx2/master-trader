// XAUUSD ELITE TRADING JOURNAL — Trade Card Component
// Displays individual trade with all fields + screenshots, no editing of auto-calculated fields
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Shield,
  Brain,
  Image,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { EliteTrade } from '@/types/eliteTrade';

interface EliteTradeCardProps {
  trade: EliteTrade;
}

export const EliteTradeCard = ({ trade }: EliteTradeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const resultColor = {
    Win: 'text-profit bg-profit/10 border-profit/30',
    Loss: 'text-loss bg-loss/10 border-loss/30',
    BE: 'text-muted-foreground bg-muted/50 border-muted',
  };

  const getResultIcon = () => {
    switch (trade.result) {
      case 'Win': return <TrendingUp className="w-4 h-4" />;
      case 'Loss': return <TrendingDown className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Card className={cn(
        "glass-card transition-all duration-200",
        isExpanded && "ring-2 ring-primary/30"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium text-sm",
                trade.result ? resultColor[trade.result] : resultColor.BE
              )}>
                {getResultIcon()}
                <span>{trade.result || 'Pending'}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(trade.trade_date)}</span>
              </div>

              <Badge variant="outline">{trade.session}</Badge>
              <Badge variant="secondary">{trade.setup_type}</Badge>
              <Badge variant={trade.setup_grade === 'A+' ? 'default' : 'outline'}>
                {trade.setup_grade}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {trade.r_multiple && (
                <span className={cn(
                  "font-mono font-semibold text-sm px-2 py-0.5 rounded",
                  Number(trade.r_multiple) > 0 ? "text-profit bg-profit/10" : "text-loss bg-loss/10"
                )}>
                  {Number(trade.r_multiple) > 0 ? '+' : ''}{trade.r_multiple}R
                </span>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            <Separator />
            
            {/* Session & Time */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DetailItem icon={<Clock className="w-4 h-4" />} label="Killzone" value={trade.killzone} />
              <DetailItem label="Day" value={trade.day_of_week} />
              <DetailItem label="News Day" value={trade.news_day} />
              <DetailItem label="Account" value={trade.account_type} />
            </div>

            <Separator />

            {/* HTF Context */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Higher-Timeframe Context
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailItem label="HTF Bias" value={trade.htf_bias} />
                <DetailItem label="HTF TF" value={trade.htf_timeframe} />
                <DetailItem label="Market Phase" value={trade.market_phase} />
                <DetailItem label="Structure" value={trade.structure_state} />
              </div>
            </div>

            <Separator />

            {/* Liquidity */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Liquidity</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {trade.liquidity_targeted?.map((liq, i) => (
                  <Badge key={i} variant="outline">{liq}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Taken Before Entry" value={trade.liquidity_taken_before_entry} />
                <DetailItem label="Against Bias" value={trade.liquidity_taken_against_bias} />
              </div>
            </div>

            <Separator />

            {/* Entry & Risk */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Entry & Risk</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <DetailItem label="Entry" value={`$${trade.entry_price}`} />
                <DetailItem label="Stop Loss" value={`$${trade.stop_loss}`} />
                <DetailItem label="Take Profit" value={`$${trade.take_profit}`} />
                <DetailItem label="Exit" value={trade.exit_price ? `$${trade.exit_price}` : '—'} />
                <DetailItem label="Risk %" value={`${trade.risk_per_trade_pct}%`} />
                <DetailItem label="RR Planned" value={`${trade.rr_planned}R`} />
              </div>
            </div>

            <Separator />

            {/* Auto-Calculated Fields (Read-Only) */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Auto-Calculated (Read-Only)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-3 rounded-md bg-muted/30 border border-muted">
                <DetailItem label="Result" value={trade.result || '—'} highlighted />
                <DetailItem label="R Multiple" value={trade.r_multiple ? `${trade.r_multiple}R` : '—'} highlighted />
                <DetailItem label="RR Realized" value={trade.rr_realized ? `${trade.rr_realized}R` : '—'} highlighted />
                <DetailItem label="MAE" value={trade.mae ? `${trade.mae}` : '—'} />
                <DetailItem label="MFE" value={trade.mfe ? `${trade.mfe}` : '—'} />
              </div>
            </div>

            <Separator />

            {/* Execution Discipline */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Execution Discipline</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailItem label="Entry Model" value={trade.entry_model} />
                <DetailItem label="Entry Candle" value={trade.entry_candle} />
                <DetailItem label="Entry Precision" value={trade.entry_precision} />
                <DetailItem label="Stop Placement" value={trade.stop_placement_quality} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <DetailItem label="Confirmation" value={trade.confirmation_present} />
                <DetailItem label="Partials Taken" value={trade.partial_taken} />
                <DetailItem 
                  label="Rules Followed" 
                  value={trade.rules_followed} 
                  valueClassName={trade.rules_followed === 'Yes' ? 'text-profit' : 'text-loss'}
                />
              </div>
            </div>

            <Separator />

            {/* Gold Behavior Tags */}
            {trade.gold_behavior_tags && trade.gold_behavior_tags.length > 0 && (
              <>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Gold Behavior Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {trade.gold_behavior_tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Sequence Logic */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Sequence Logic</h4>
              <div className="grid grid-cols-3 gap-4">
                <DetailItem label="First Move Fake" value={trade.first_move_was_fake} />
                <DetailItem label="Real Move After Liq" value={trade.real_move_after_liquidity} />
                <DetailItem label="Trade Aligned" value={trade.trade_aligned_with_real_move} />
              </div>
            </div>

            <Separator />

            {/* Psychology */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Psychology
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailItem label="Pre-Trade State" value={trade.pre_trade_state} />
                <DetailItem label="Confidence" value={`${trade.confidence_level}/5`} />
                <DetailItem 
                  label="Revenge Trade" 
                  value={trade.revenge_trade}
                  valueClassName={trade.revenge_trade === 'Yes' ? 'text-loss' : 'text-profit'}
                />
                <DetailItem 
                  label="Fatigue Present" 
                  value={trade.fatigue_present}
                  valueClassName={trade.fatigue_present === 'Yes' ? 'text-loss' : 'text-profit'}
                />
              </div>
            </div>

            <Separator />

            {/* Screenshots */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <Image className="w-4 h-4" /> Visual Evidence
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <ScreenshotThumbnail 
                  url={trade.htf_screenshot} 
                  label="HTF Screenshot" 
                  onClick={() => setSelectedImage(trade.htf_screenshot || null)}
                />
                <ScreenshotThumbnail 
                  url={trade.ltf_entry_screenshot} 
                  label="LTF Entry" 
                  onClick={() => setSelectedImage(trade.ltf_entry_screenshot || null)}
                />
                <ScreenshotThumbnail 
                  url={trade.post_trade_screenshot} 
                  label="Post-Trade" 
                  onClick={() => setSelectedImage(trade.post_trade_screenshot || null)}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Annotations:</span>
                <Badge variant={trade.annotations_present === 'Yes' ? 'default' : 'outline'}>
                  {trade.annotations_present || 'No'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Final Field */}
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-muted">
              <span className="font-medium">Would I take this trade again?</span>
              {trade.would_i_take_this_trade_again === 'Yes' ? (
                <Badge className="bg-profit text-profit-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Yes
                </Badge>
              ) : trade.would_i_take_this_trade_again === 'No' ? (
                <Badge variant="destructive">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> No
                </Badge>
              ) : (
                <Badge variant="outline">Not Set</Badge>
              )}
            </div>

            {/* Notes */}
            {trade.notes && (
              <div className="p-3 rounded-md bg-muted/20 border border-muted">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{trade.notes}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Screenshot Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Screenshot</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Trade screenshot" 
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper Components
const DetailItem = ({ 
  icon, 
  label, 
  value, 
  highlighted = false,
  valueClassName = ''
}: { 
  icon?: React.ReactNode; 
  label: string; 
  value: string | number | undefined | null;
  highlighted?: boolean;
  valueClassName?: string;
}) => (
  <div>
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      {icon}
      {label}
    </div>
    <div className={cn(
      "font-medium text-sm",
      highlighted && "text-primary",
      valueClassName
    )}>
      {value ?? '—'}
    </div>
  </div>
);

const ScreenshotThumbnail = ({ 
  url, 
  label, 
  onClick 
}: { 
  url: string | undefined | null; 
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={!url}
    className={cn(
      "aspect-video rounded-md border overflow-hidden flex items-center justify-center transition-all",
      url 
        ? "hover:ring-2 hover:ring-primary/50 cursor-pointer" 
        : "bg-muted/50 cursor-not-allowed opacity-50"
    )}
  >
    {url ? (
      <div className="relative w-full h-full group">
        <img src={url} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="w-6 h-6 text-white" />
        </div>
      </div>
    ) : (
      <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
        <AlertTriangle className="w-4 h-4" />
        <span>Missing</span>
      </div>
    )}
  </button>
);
