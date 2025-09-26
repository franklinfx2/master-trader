import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, referralCode?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Check if it's an email not confirmed error
      if (error.message.includes('Email not confirmed')) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and click the verification link before signing in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else if (data.user && !data.user.email_confirmed_at) {
      // Additional check for email confirmation
      await supabase.auth.signOut();
      toast({
        title: "Email Not Verified",
        description: "Please verify your email address before signing in. Check your inbox for the verification link.",
        variant: "destructive",
      });
      return { error: { message: "Email not verified" } };
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/auth?verified=true`;
    
    // If there's a referral code, include it in metadata
    const metadata = referralCode ? { referral_code: referralCode } : undefined;
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });

    // If signup is successful and there's a referral code, handle the referral
    if (!error && data.user && referralCode) {
      handleReferralSignup(data.user.id, referralCode);
    }
    
    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created Successfully",
        description: "Please check your email and click the verification link to activate your account. You cannot sign in until you verify your email.",
        duration: 8000,
      });
    }
    
    return { error };
  };

  const handleReferralSignup = async (newUserId: string, referralCode: string) => {
    try {
      // Find the referrer by referral code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrer && referrer.id !== newUserId) { // Prevent self-referrals
        // Create referral record
        await supabase
          .from('referrals')
          .insert({
            referrer_id: referrer.id,
            referred_id: newUserId,
            referral_code: referralCode
          });
      }
    } catch (error) {
      console.error('Error handling referral:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    
    if (error) {
      toast({
        title: "Reset Password Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions. Click the link in the email to reset your password.",
        duration: 8000,
      });
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};