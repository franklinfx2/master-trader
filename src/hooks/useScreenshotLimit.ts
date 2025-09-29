import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';

export const useScreenshotLimit = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [screenshotCount, setScreenshotCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const MAX_FREE_SCREENSHOTS = 20;

  useEffect(() => {
    if (user && profile?.plan === 'free') {
      fetchScreenshotCount();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const fetchScreenshotCount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Count screenshots in trades table for this user
      const { data, error } = await supabase
        .from('trades')
        .select('screenshot_url')
        .eq('user_id', user.id)
        .not('screenshot_url', 'is', null);

      if (error) {
        console.error('Error fetching screenshot count:', error);
      } else {
        setScreenshotCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error counting screenshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const isProUser = profile?.plan === 'pro';
  const canUploadMore = isProUser || screenshotCount < MAX_FREE_SCREENSHOTS;
  const remainingScreenshots = isProUser ? Infinity : Math.max(0, MAX_FREE_SCREENSHOTS - screenshotCount);

  return {
    screenshotCount,
    maxScreenshots: MAX_FREE_SCREENSHOTS,
    canUploadMore,
    remainingScreenshots,
    isProUser,
    loading,
    refreshCount: fetchScreenshotCount
  };
};