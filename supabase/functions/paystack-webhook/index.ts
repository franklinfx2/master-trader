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
    // Always use live keys for production
    const paystackSecretKey = Deno.env.get('PAYSTACK_LIVE_SECRET_KEY');
      
    if (!paystackSecretKey) {
      throw new Error('Paystack live secret key not configured')
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

    // Handle payment events
    if (event.event === 'charge.success') {
      const { customer, metadata, status, amount } = event.data

      if (metadata && metadata.userId) {
        // Only Pro plan is available now
        const planToSet = 'pro';

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Update user profile to the purchased plan
        const { error } = await supabase
          .from('profiles')
          .update({
            plan: planToSet,
            paystack_customer_code: customer.customer_code,
            updated_at: new Date().toISOString()
          })
          .eq('id', metadata.userId)

        if (error) {
          console.error('Error updating user plan:', error)
          throw error
        }

        console.log(`Successfully upgraded user ${metadata.userId} to ${planToSet} plan - Amount: ₵${amount/100} GHS`)
      }
    } else if (event.event === 'charge.failed' || event.event === 'charge.abandoned') {
      // Handle failed or abandoned payments
      const { metadata, status } = event.data
      
      if (metadata && metadata.userId) {
        console.log(`Payment ${status} for user ${metadata.userId} - Plan: ${metadata.plan}`)
        
        // You could add additional logging or notification logic here
        // For now, we just log the failed payment
      }
    }

    return new Response('Webhook processed successfully', {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error processing Paystack webhook:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})