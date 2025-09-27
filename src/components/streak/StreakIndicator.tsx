import { useState } from 'react';
import { Flame } from 'lucide-react';
import { useStreakTracker } from '@/hooks/useStreakTracker';
import { StreakModal } from './StreakModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const StreakIndicator = () => {
  const { streakData, loading } = useStreakTracker();
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="h-auto p-2 gap-1 hover:bg-accent/50 transition-colors"
      >
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-medium">
          {streakData.currentStreak}-Day Streak
        </span>
        {streakData.streakShields > 0 && (
          <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
            🛡️ {streakData.streakShields}
          </Badge>
        )}
      </Button>

      <StreakModal 
        open={showModal} 
        onOpenChange={setShowModal}
      />
    </>
  );
};