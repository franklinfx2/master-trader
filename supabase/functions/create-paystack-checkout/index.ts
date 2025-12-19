import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, userId, plan = 'pro' } = await req.json()

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: 'Email and userId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Always use live keys for production
    const paystackSecretKey = Deno.env.get('PAYSTACK_LIVE_SECRET_KEY');
      
    if (!paystackSecretKey) {
      throw new Error('Paystack live secret key not configured')
    }

    // Plan-based pricing in pesewas (GHS)
    const planPricing: Record<string, { amount: number; name: string }> = {
      go: { amount: 7500, name: 'Go Plan' },      // ₵75.00/month
      pro: { amount: 12000, name: 'Pro Plan' }    // ₵120.00/month
    };

    const selectedPlan = planPricing[plan] || planPricing.pro;
    const amount = selectedPlan.amount;

    console.log(`Creating checkout for plan: ${plan}, amount: ${amount} pesewas`);

    // Create Paystack checkout session
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amount,
        currency: 'GHS',
        reference: `${plan}_upgrade_${userId}_${Date.now()}`,
        callback_url: 'https://strat-guru.lovable.app/callback',
        metadata: {
          userId: userId,
          plan: plan,
          planName: selectedPlan.name,
          upgrade: true
        },
        channels: ['card', 'mobile_money']
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok) {
      throw new Error(paystackData.message || 'Failed to create Paystack checkout')
    }

    return new Response(
      JSON.stringify({
        payUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating Paystack checkout:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})