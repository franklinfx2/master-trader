import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { screenshotUrl, marketContext, creditsRequired = 3 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check and deduct credits
    const { data: creditDeducted, error: creditError } = await supabaseClient
      .rpc('deduct_ai_credits', {
        p_user_id: user.id,
        p_credits: creditsRequired,
        p_feature_name: 'ai-copro-analyzer'
      });

    if (creditError || !creditDeducted) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient credits', 
          message: 'You do not have enough AI credits for this analysis. Please upgrade your plan.' 
        }),
        { 
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Construct AI prompt
    const prompt = `You are an expert trading analyst. Analyze the following market data and provide a detailed trade analysis.

${screenshotUrl ? `Chart Screenshot: ${screenshotUrl}` : ''}

Market Context:
${marketContext}

Please provide:
1. Price direction prediction (Bullish/Bearish/Neutral) with confidence percentage
2. Session volatility assessment (Low/Medium/High)
3. Any news threats or fundamental factors to consider
4. A complete trade setup with:
   - Entry point
   - Take Profit (TP)
   - Stop Loss (SL)
   - Risk:Reward ratio (must be at least 1:2)
5. Your reasoning for the analysis

Respond ONLY with valid JSON in this exact format:
{
  "priceDirection": "Bullish/Bearish/Neutral",
  "probability": 75,
  "volatility": "Medium",
  "newsThreats": ["threat1", "threat2"],
  "tradeSetup": {
    "entry": "1.2345",
    "tp": "1.2545",
    "sl": "1.2245",
    "riskReward": "1:2"
  },
  "reasoning": "detailed explanation"
}`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert trading analyst providing structured market analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded - please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Lovable AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0]?.message?.content || '';

    // Parse JSON response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Provide fallback response
      analysis = {
        priceDirection: "Neutral",
        probability: 50,
        volatility: "Medium",
        newsThreats: ["Unable to analyze - please provide more context"],
        tradeSetup: {
          entry: "N/A",
          tp: "N/A",
          sl: "N/A",
          riskReward: "N/A"
        },
        reasoning: "Failed to parse AI response. Please try again with more detailed context."
      };
    }

    return new Response(
      JSON.stringify({
        analysis,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Co-Pro Analyzer error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
