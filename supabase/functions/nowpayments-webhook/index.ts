import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const nowpaymentsIpnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET')
      
    if (!nowpaymentsIpnSecret) {
      console.error('NOWPayments IPN secret not configured')
      throw new Error('NOWPayments IPN secret not configured')
    }

    // Verify NOWPayments signature
    const signature = req.headers.get('x-nowpayments-sig')
    const body = await req.text()
    
    if (!signature) {
      console.error('No signature provided in webhook')
      return new Response('No signature provided', { status: 400 })
    }

    // Create hash of the body with IPN secret
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(nowpaymentsIpnSecret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    )
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    )
    
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignatureHex) {
      console.error('Invalid signature on webhook')
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('NOWPayments webhook received:', { 
      payment_status: event.payment_status,
      order_id: event.order_id 
    })

    // Handle successful payment
    // NOWPayments sends 'finished' status for completed payments
    if (event.payment_status === 'finished') {
      const { order_id, customer_email } = event

      // Extract userId from order_id (format: pro_upgrade_<userId>_<timestamp>)
      const orderParts = order_id?.split('_')
      let userId = null

      if (orderParts && orderParts.length >= 3) {
        userId = orderParts[2] // Extract userId from order_id
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      if (userId) {
        // Update user profile to Pro plan using userId
        const { error } = await supabase
          .from('profiles')
          .update({
            plan: 'pro',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (error) {
          console.error('Error updating user plan by userId:', error)
          throw error
        }

        console.log(`Successfully upgraded user ${userId} to pro plan via NOWPayments`)
      } else if (customer_email) {
        // Fallback: Try to match by email if userId not found in order_id
        console.log('Attempting to match user by email:', customer_email)
        
        const { error } = await supabase
          .from('profiles')
          .update({
            plan: 'pro',
            updated_at: new Date().toISOString()
          })
          .eq('email', customer_email)

        if (error) {
          console.error('Error updating user plan by email:', error)
          throw error
        }

        console.log(`Successfully upgraded user with email ${customer_email} to pro plan via NOWPayments`)
      } else {
        console.error('No userId or email found in webhook data')
        throw new Error('Unable to identify user from webhook data')
      }
    } else if (event.payment_status === 'failed' || event.payment_status === 'expired') {
      // Log failed or expired payments
      console.log(`Payment ${event.payment_status} for order ${event.order_id}`)
    }

    return new Response('Webhook processed successfully', {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Error processing NOWPayments webhook:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
