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

    // Get environment variables for Paystack keys
    const isProduction = req.headers.get('host')?.includes('strat-guru.lovable.app') || false;
    const paystackSecretKey = isProduction 
      ? Deno.env.get('PAYSTACK_LIVE_SECRET_KEY')
      : Deno.env.get('PAYSTACK_TEST_SECRET_KEY');
      
    if (!paystackSecretKey) {
      throw new Error(`Paystack ${isProduction ? 'live' : 'test'} secret key not configured`)
    }

    // Single Pro plan pricing - $9/month
    const amount = 900; // $9.00 in cents

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
        currency: 'USD',
        reference: `${plan}_upgrade_${userId}_${Date.now()}`,
        callback_url: 'https://strat-guru.lovable.app/callback',
        metadata: {
          userId: userId,
          plan: plan,
          upgrade: true
        },
        channels: ['card']
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