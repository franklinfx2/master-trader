import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Flame, Shield, Trophy } from 'lucide-react';
import { useStreakTracker } from '@/hooks/useStreakTracker';
import { Progress } from '@/components/ui/progress';

interface StreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StreakModal = ({ open, onOpenChange }: StreakModalProps) => {
  const { streakData, getNextMilestone, getLatestMilestone } = useStreakTracker();
  const nextMilestone = getNextMilestone();
  const latestMilestone = getLatestMilestone();

  const progressToNext = nextMilestone 
    ? (streakData.currentStreak / nextMilestone.day) * 100
    : 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Consistency Streak
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Streak */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              {streakData.currentStreak}
            </div>
            <p className="text-muted-foreground">
              {streakData.currentStreak === 1 ? 'Day' : 'Days'} of Consistency
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Best Streak</span>
              </div>
              <div className="text-lg font-bold">{streakData.highestStreak}</div>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Shields</span>
              </div>
              <div className="text-lg font-bold">{streakData.streakShields}</div>
            </div>
          </div>

          {/* Current Achievement */}
          {latestMilestone && (
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <Badge variant="default" className="mb-2">
                Latest Achievement
              </Badge>
              <p className="font-medium">{latestMilestone.title}</p>
              <p className="text-sm text-muted-foreground">
                {latestMilestone.day}-day milestone
              </p>
            </div>
          )}

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Next Milestone</span>
                <span className="text-sm text-muted-foreground">
                  {streakData.currentStreak}/{nextMilestone.day} days
                </span>
              </div>
              
              <Progress value={progressToNext} className="h-2" />
              
              <div className="text-center">
                <p className="font-medium text-sm">{nextMilestone.title}</p>
                {nextMilestone.shield && (
                  <p className="text-xs text-muted-foreground">
                    🛡️ Earn a Streak Shield
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Motivation */}
          <div className="text-center text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            💡 Log at least one trade daily to maintain your streak. 
            Shields protect your streak when you miss a day!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};