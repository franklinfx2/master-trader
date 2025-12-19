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
      console.error('Credit deduction error:', creditError);
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

    // Build the message content with image if provided
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    // Add text prompt
    const textPrompt = `You are an expert trading analyst. Analyze the following market data and provide a detailed trade analysis.

${marketContext ? `Market Context: ${marketContext}` : 'Please analyze the chart screenshot provided.'}

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

    messageContent.push({ type: 'text', text: textPrompt });

    // Add image if URL is provided
    if (screenshotUrl) {
      messageContent.push({
        type: 'image_url',
        image_url: { url: screenshotUrl }
      });
    }

    console.log('Sending request to Lovable AI with image:', !!screenshotUrl);

    // Call Lovable AI with vision-capable model
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
            content: 'You are an expert trading analyst providing structured market analysis. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: messageContent
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
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required - please add credits to your Lovable AI workspace' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Lovable AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');
    
    const analysisText = aiData.choices[0]?.message?.content || '';

    // Parse JSON response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      // Clean up any leading/trailing whitespace or newlines
      const cleanedJson = jsonText.trim();
      analysis = JSON.parse(cleanedJson);
    } catch (e) {
      console.error('Failed to parse AI response:', e, 'Raw response:', analysisText);
      // Provide fallback response
      analysis = {
        priceDirection: "Neutral",
        probability: 50,
        volatility: "Medium",
        newsThreats: ["Unable to fully parse analysis - please provide more context"],
        tradeSetup: {
          entry: "N/A",
          tp: "N/A",
          sl: "N/A",
          riskReward: "N/A"
        },
        reasoning: analysisText || "Failed to parse AI response. Please try again with more detailed context or a clearer chart image."
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
