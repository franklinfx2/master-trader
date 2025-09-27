import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StreakData {
  lastLogDate: Date | null;
  currentStreak: number;
  highestStreak: number;
  streakShields: number;
}

const MILESTONES = [
  { day: 1, title: "You Showed Up", shield: false },
  { day: 3, title: "Consistency Rookie", shield: false },
  { day: 7, title: "Disciplined Trader", shield: true },
  { day: 21, title: "Unstoppable", shield: false },
  { day: 50, title: "Mentor Mindset", shield: false },
  { day: 100, title: "Machine Mode", shield: false },
];

export const useStreakTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streakData, setStreakData] = useState<StreakData>({
    lastLogDate: null,
    currentStreak: 0,
    highestStreak: 0,
    streakShields: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStreakData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('last_log_date, current_streak, highest_streak, streak_shields')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching streak data:', error);
      return;
    }

    setStreakData({
      lastLogDate: data.last_log_date ? new Date(data.last_log_date) : null,
      currentStreak: data.current_streak || 0,
      highestStreak: data.highest_streak || 0,
      streakShields: data.streak_shields || 0,
    });
    setLoading(false);
  };

  const updateStreak = async (tradeDate: Date = new Date()) => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tradeDateOnly = new Date(tradeDate);
    tradeDateOnly.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = streakData.currentStreak;
    let newShields = streakData.streakShields;
    let shieldUsed = false;

    // Only process if trading today and haven't already logged today
    if (tradeDateOnly.getTime() === today.getTime()) {
      if (!streakData.lastLogDate || streakData.lastLogDate.getTime() !== today.getTime()) {
        if (!streakData.lastLogDate) {
          // First ever trade
          newStreak = 1;
        } else if (streakData.lastLogDate.getTime() === yesterday.getTime()) {
          // Consecutive day
          newStreak = streakData.currentStreak + 1;
        } else {
          // Missed day(s)
          if (streakData.streakShields > 0) {
            // Use shield to preserve streak
            newShields = streakData.streakShields - 1;
            newStreak = streakData.currentStreak + 1;
            shieldUsed = true;
            
            toast({
              title: "🛡️ Streak Shield Used!",
              description: "Your discipline shield protected your streak.",
              duration: 4000,
            });
          } else {
            // Reset streak
            newStreak = 1;
          }
        }

        // Check for milestone rewards
        const milestone = MILESTONES.find(m => m.day === newStreak);
        if (milestone) {
          if (milestone.shield) {
            newShields += 1;
          }
          
          toast({
            title: `🔥 ${milestone.title}!`,
            description: milestone.shield 
              ? `${newStreak}-day streak achieved! You earned a Streak Shield.`
              : `${newStreak}-day streak achieved!`,
            duration: 5000,
          });
        }

        const newHighest = Math.max(newStreak, streakData.highestStreak);

        // Update database
        const { error } = await supabase
          .from('profiles')
          .update({
            last_log_date: today.toISOString().split('T')[0],
            current_streak: newStreak,
            highest_streak: newHighest,
            streak_shields: newShields,
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating streak:', error);
          return;
        }

        setStreakData({
          lastLogDate: today,
          currentStreak: newStreak,
          highestStreak: newHighest,
          streakShields: newShields,
        });
      }
    }
  };

  const getNextMilestone = () => {
    return MILESTONES.find(m => m.day > streakData.currentStreak);
  };

  const getLatestMilestone = () => {
    return MILESTONES.filter(m => m.day <= streakData.currentStreak).pop();
  };

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  return {
    streakData,
    loading,
    updateStreak,
    getNextMilestone,
    getLatestMilestone,
    fetchStreakData,
  };
};