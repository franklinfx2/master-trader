import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    // Verify Paystack webhook signature
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    if (!signature) {
      return new Response('No signature provided', { status: 400 })
    }

    // Create hash of the body with secret key
    const hash = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(paystackSecretKey),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    )
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      hash,
      new TextEncoder().encode(body)
    )
    
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignatureHex) {
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle successful payment
    if (event.event === 'charge.success') {
      const { customer, metadata } = event.data

      if (metadata && metadata.userId && metadata.plan === 'pro') {
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Update user profile to Pro plan
        const { error } = await supabase
          .from('profiles')
          .update({
            plan: 'pro',
            paystack_customer_code: customer.customer_code,
            updated_at: new Date().toISOString()
          })
          .eq('id', metadata.userId)

        if (error) {
          console.error('Error updating user plan:', error)
          throw error
        }

        console.log(`Successfully upgraded user ${metadata.userId} to Pro plan`)
      }
    }

    return new Response('Webhook processed successfully', {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error processing Paystack webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})