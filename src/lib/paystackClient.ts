import { PAYSTACK_CONFIG } from './paystack';

// Paystack client for frontend integration
export class PaystackClient {
  private publicKey: string;
  private baseUrl: string;

  constructor() {
    this.publicKey = PAYSTACK_CONFIG.publicKey;
    this.baseUrl = PAYSTACK_CONFIG.baseUrl;
  }

  // Initialize inline payment (for future direct integration)
  initializeInlinePayment(config: {
    email: string;
    amount: number;
    currency?: string;
    callback?: (response: any) => void;
    onClose?: () => void;
    metadata?: any;
  }) {
    // This would be used if we implement direct Paystack inline payments
    // For now, we're using the checkout URL approach through our edge function
    return {
      publicKey: this.publicKey,
      ...config,
      amount: config.amount * 100, // Convert to kobo
      currency: config.currency || PAYSTACK_CONFIG.currency,
    };
  }

  // Verify payment status (client-side helper)
  async verifyPayment(reference: string) {
    // Note: Actual verification should always be done server-side
    // This is just a helper for client-side reference
    console.log(`Verifying payment reference: ${reference}`);
    return {
      reference,
      status: 'pending', // Always verify server-side
    };
  }
}

export const paystackClient = new PaystackClient();