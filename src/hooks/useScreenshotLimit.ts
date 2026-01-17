import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';

export const useScreenshotLimit = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);

  // All users now have unlimited screenshots
  const isProUser = profile?.plan === 'pro' || profile?.role === 'owner';

  return {
    screenshotCount: 0,
    maxScreenshots: Infinity,
    canUploadMore: true,
    remainingScreenshots: Infinity,
    isProUser,
    loading,
    refreshCount: () => Promise.resolve()
  };
};