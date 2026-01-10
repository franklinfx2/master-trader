import { useState } from 'react';
import { Trade } from '@/hooks/useTrades';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TradeScreenshotGallery, ScreenshotThumbnails } from './TradeScreenshotGallery';

interface MobileTradeCardProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onView: (trade: Trade) => void;
}

export const MobileTradeCard = ({ trade, onEdit, onDelete, onView }: MobileTradeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProfitLoss = () => {
    if (!trade.exit || trade.result === 'open') return null;
    const entry = typeof trade.entry === 'string' ? parseFloat(trade.entry) : trade.entry;
    const exit = typeof trade.exit === 'string' ? parseFloat(trade.exit) : trade.exit;
    const multiplier = trade.direction === 'long' ? 1 : -1;
    return ((exit - entry) * multiplier / entry) * 100;
  };

  const profitLoss = getProfitLoss();

  // Parse screenshots from trade
  const getScreenshots = (): string[] => {
    if (!trade.screenshot_url) return [];
    try {
      const parsed = JSON.parse(trade.screenshot_url);
      return Array.isArray(parsed) ? parsed : [trade.screenshot_url];
    } catch {
      return [trade.screenshot_url];
    }
  };

  const screenshots = getScreenshots();
  return (
    <Card className="card-premium mb-4 overflow-hidden">
      <CardContent className="p-4">
        {/* Header - Always Visible */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Badge 
              variant={trade.direction === 'long' ? 'default' : 'secondary'}
              className={cn(
                "text-xs font-semibold px-2 py-1",
                trade.direction === 'long' 
                  ? "bg-profit/20 text-profit border-profit/30" 
                  : "bg-loss/20 text-loss border-loss/30"
              )}
            >
              {trade.direction.toUpperCase()}
            </Badge>
            <div>
              <p className="font-bold text-sm">{trade.pair}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(trade.executed_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {trade.result !== 'open' && profitLoss !== null && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  profitLoss >= 0 
                    ? "border-profit/30 text-profit bg-profit/10" 
                    : "border-loss/30 text-loss bg-loss/10"
                )}
              >
                {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Info - Always Visible */}
        <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
          <div>
            <span className="text-muted-foreground">Entry:</span>
            <span className="ml-1 font-medium">${trade.entry}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Risk:</span>
            <span className="ml-1 font-medium">{trade.risk_pct}%</span>
          </div>
        </div>

        {/* Collapsible Section */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-border/50">
            {/* Trade Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {trade.exit && (
                <div>
                  <span className="text-muted-foreground">Exit:</span>
                  <span className="ml-1 font-medium">${trade.exit}</span>
                </div>
              )}
              {trade.sl && (
                <div>
                  <span className="text-muted-foreground">Stop Loss:</span>
                  <span className="ml-1 font-medium">${trade.sl}</span>
                </div>
              )}
              {trade.tp && (
                <div>
                  <span className="text-muted-foreground">Take Profit:</span>
                  <span className="ml-1 font-medium">${trade.tp}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Result:</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-1 text-xs",
                    trade.result === 'win' && "border-profit/30 text-profit bg-profit/10",
                    trade.result === 'loss' && "border-loss/30 text-loss bg-loss/10",
                    trade.result === 'be' && "border-border text-muted-foreground",
                    trade.result === 'open' && "border-violet/30 text-violet bg-violet/10"
                  )}
                >
                  {trade.result.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Trading Session */}
            {(trade as any).trading_session && (
              <div className="text-xs">
                <span className="text-muted-foreground">Session:</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {(trade as any).trading_session}
                </Badge>
              </div>
            )}

            {/* Notes */}
            {trade.notes && (
              <div className="text-xs">
                <span className="text-muted-foreground block mb-1">Notes:</span>
                <p className="text-foreground bg-muted/30 p-2 rounded text-xs">
                  {trade.notes}
                </p>
              </div>
            )}

            {/* Screenshot Thumbnails */}
            {screenshots.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Screenshots:</p>
                <ScreenshotThumbnails
                  screenshots={screenshots}
                  maxVisible={4}
                  size="sm"
                  onThumbnailClick={(index) => {
                    setGalleryInitialIndex(index);
                    setGalleryOpen(true);
                  }}
                />
              </div>
            )}

            {/* Screenshot Gallery */}
            <TradeScreenshotGallery
              screenshots={screenshots}
              pair={trade.pair}
              isOpen={galleryOpen}
              onClose={() => setGalleryOpen(false)}
              initialIndex={galleryInitialIndex}
            />

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(trade)}
                className="flex-1 text-xs h-8"
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(trade)}
                className="flex-1 text-xs h-8"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(trade.id)}
                className="flex-1 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};