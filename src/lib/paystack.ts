// Environment detection
const isProduction = window.location.hostname === 'strat-guru.lovable.app';

// Paystack configuration with environment switching
export const PAYSTACK_CONFIG = {
  publicKey: isProduction 
    ? import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY || 'pk_live_your_public_key_here'
    : import.meta.env.VITE_PAYSTACK_TEST_PUBLIC_KEY || 'pk_test_your_test_key_here',
  baseUrl: 'https://api.paystack.co',
  currency: 'GHS',
  channels: ['card', 'mobile_money'],
  isProduction
};

// Utility function to format amount in cents
export const formatAmountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

// Utility function to format pesewas to cedis
export const formatPesewasToGHS = (pesewas: number): string => {
  const cedis = pesewas / 100;
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(cedis);
};

// Check if user is in free trial period (3 days)
export const isInFreeTrial = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  return (now.getTime() - created.getTime()) < threeDaysInMs;
};

// Get days remaining in trial
export const getTrialDaysRemaining = (createdAt: string): number => {
  const created = new Date(createdAt);
  const now = new Date();
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  const timeLeft = threeDaysInMs - (now.getTime() - created.getTime());
  return Math.max(0, Math.ceil(timeLeft / (24 * 60 * 60 * 1000)));
};

// Single Pro Plan configuration
export const PLANS = {
  free: {
    name: 'Free Trial',
    price: 0,
    trialDays: 3,
    features: [
      '3-day free trial',
      'All Pro features included',
      'No credit card required'
    ]
  },
  pro: {
    name: 'Pro',
    price: 12000, // ₵120.00 in pesewas
    features: [
      'Unlimited trades',
      'Advanced analytics', 
      'Unlimited AI analysis',
      'CSV export',
      'Priority support',
      'Custom indicators',
      'API access',
      'Real-time insights'
    ]
  }
};