// Paystack configuration for live mode
export const PAYSTACK_CONFIG = {
  publicKey: 'pk_live_your_public_key_here', // This will be replaced with your actual live public key
  baseUrl: 'https://api.paystack.co', // Live endpoint
  currency: 'NGN',
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
};

// Utility function to format amount in kobo
export const formatAmountToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

// Utility function to format kobo to naira
export const formatKoboToNaira = (kobo: number): string => {
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(naira);
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
  pro: {
    name: 'Pro',
    price: 29000, // ₦29,000 in kobo
    features: [
      'Unlimited trades',
      'Advanced analytics', 
      'Unlimited AI analysis',
      'CSV export',
      'Priority support'
    ]
  }
};