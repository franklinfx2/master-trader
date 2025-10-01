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
    const { email, userId } = await req.json()

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: 'Email and userId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // NOWPayments API configuration
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')
    
    if (!nowpaymentsApiKey) {
      throw new Error('NOWPayments API key not configured')
    }

    // Create payment with metadata
    // Price: $30 USD equivalent (adjust as needed)
    const amount = 30
    const currency = 'usd'

    // Create NOWPayments invoice with IPN callback
    // Note: order_id format is "pro_upgrade_<userId>_<timestamp>" for webhook processing
    const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: currency,
        order_id: `pro_upgrade_${userId}_${Date.now()}`,
        order_description: 'StratGuru Pro Monthly Subscription',
        ipn_callback_url: 'https://lamwycpfcrfvwpbelhse.supabase.co/functions/v1/nowpayments-webhook',
        success_url: 'https://strat-guru.lovable.app/settings?payment=success',
        cancel_url: 'https://strat-guru.lovable.app/settings?payment=cancelled',
        is_fee_paid_by_user: true,
      }),
    })

    const nowpaymentsData = await nowpaymentsResponse.json()

    if (!nowpaymentsResponse.ok) {
      console.error('NOWPayments error:', nowpaymentsData)
      throw new Error(nowpaymentsData.message || 'Failed to create NOWPayments invoice')
    }

    console.log('NOWPayments invoice created:', { 
      invoiceId: nowpaymentsData.id, 
      userId,
      email 
    })

    return new Response(
      JSON.stringify({
        payUrl: nowpaymentsData.invoice_url,
        invoiceId: nowpaymentsData.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating NOWPayments checkout:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
