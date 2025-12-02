import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Rocket, Clock } from 'lucide-react';
import { useAICredits } from '@/hooks/useAICredits';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const AICreditDisplay = ({ className }: { className?: string }) => {
  const { credits, loading, isUnlimited } = useAICredits();

  if (loading || !credits) {
    return null;
  }

  const isLow = credits.remaining < 5 && !isUnlimited();
  const percentage = isUnlimited() ? 100 : (credits.remaining / credits.monthlyLimit) * 100;

  const resetDate = credits.resetDate ? new Date(credits.resetDate) : null;
  const daysUntilReset = resetDate
    ? Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const getPriorityIcon = () => {
    switch (credits.priority) {
      case 'fastest':
        return <Rocket className="w-4 h-4" />;
      case 'fast':
        return <Zap className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityLabel = () => {
    switch (credits.priority) {
      case 'fastest':
        return 'Fastest';
      case 'fast':
        return 'Fast';
      default:
        return 'Slow';
    }
  };

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">AI Credits</span>
          </div>
          <Badge variant={isLow ? "destructive" : "default"} className="text-xs">
            {getPriorityIcon()}
            <span className="ml-1">{getPriorityLabel()}</span>
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className={cn("font-bold", isLow && "text-destructive")}>
              {isUnlimited() ? '∞ Unlimited' : `${credits.remaining} / ${credits.monthlyLimit}`}
            </span>
          </div>

          {!isUnlimited() && (
            <>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isLow ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Resets in {daysUntilReset} days</span>
                {isLow && (
                  <Link to="/settings?tab=billing">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
