import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Lovable AI key not found',
          status: 'failed',
          message: 'LOVABLE_API_KEY is not configured in Supabase secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Testing Lovable AI connection...');

    // Simple test call to Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with "Lovable AI is working correctly" to confirm the connection.'
          }
        ],
        max_tokens: 50,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Lovable AI test failed:', response.status, response.statusText, responseData);
      
      let errorMessage = 'Unknown error';
      let errorCode = response.status;
      
      if (response.status === 401) {
        errorMessage = 'Invalid API key - please check your Lovable AI configuration';
      } else if (response.status === 429) {
        errorMessage = 'Rate limits exceeded - please try again later';
      } else if (response.status === 402) {
        errorMessage = 'Payment required - please add funds to your Lovable AI workspace';
      } else if (response.status === 403) {
        errorMessage = 'API access denied - your API key may not have the required permissions';
      } else if (responseData.error) {
        errorMessage = responseData.error.message || responseData.error;
      }

      return new Response(
        JSON.stringify({ 
          status: 'failed',
          error: errorMessage,
          statusCode: errorCode,
          details: responseData
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const aiResponse = responseData.choices?.[0]?.message?.content || 'No response content';
    
    console.log('Lovable AI test successful:', aiResponse);

    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'Lovable AI is working correctly',
        aiResponse: aiResponse,
        model: 'google/gemini-2.5-flash',
        timestamp: new Date().toISOString(),
        usage: responseData.usage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error testing Lovable AI:', error);
    return new Response(
      JSON.stringify({ 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
