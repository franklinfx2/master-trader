// Paystack configuration for live mode
export const PAYSTACK_CONFIG = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_your_public_key_here',
  baseUrl: 'https://api.paystack.co', // Live endpoint
  currency: 'USD',
  channels: ['card']
};

// Utility function to format amount in cents
export const formatAmountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

// Utility function to format cents to dollars
export const formatCentsToDollars = (cents: number): string => {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
};

// Plan configurations
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Up to 20 trades',
      'Basic analytics',
      'AI analysis (weekly)'
    ]
  },
  starter: {
    name: 'Starter',
    price: 900, // $9.00 in cents
    features: [
      'Up to 100 trades',
      'Advanced analytics',
      'AI analysis (daily)',
      'Email alerts'
    ]
  },
  growth: {
    name: 'Growth',
    price: 1900, // $19.00 in cents
    features: [
      'Up to 500 trades',
      'Advanced analytics',
      'Unlimited AI analysis',
      'CSV export',
      'Priority support',
      'Custom indicators'
    ]
  },
  pro: {
    name: 'Pro',
    price: 4900, // $49.00 in cents
    features: [
      'Unlimited trades',
      'Advanced analytics', 
      'Unlimited AI analysis',
      'CSV export',
      'Priority support',
      'Custom indicators',
      'API access',
      'White-label options'
    ]
  }
};