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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not found',
          status: 'failed',
          message: 'OPENAI_API_KEY is not configured in Supabase secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Testing OpenAI API connection...');

    // Simple test call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with "OpenAI API is working correctly" to confirm the connection.'
          }
        ],
        max_tokens: 50,
        temperature: 0,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('OpenAI API test failed:', response.status, response.statusText, responseData);
      
      let errorMessage = 'Unknown error';
      let errorCode = response.status;
      
      if (response.status === 401) {
        errorMessage = 'Invalid API key - please check your OpenAI API key in Supabase secrets';
      } else if (response.status === 429) {
        errorMessage = 'API quota exceeded - please check your OpenAI billing or wait before retrying';
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
    
    console.log('OpenAI API test successful:', aiResponse);

    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'OpenAI API is working correctly',
        aiResponse: aiResponse,
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString(),
        usage: responseData.usage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error testing OpenAI API:', error);
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