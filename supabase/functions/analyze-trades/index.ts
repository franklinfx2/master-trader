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
      console.error('Lovable AI API key not found');
      return new Response(
        JSON.stringify({ error: 'Lovable AI key not configured. Please check your Supabase secrets.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { trades } = await req.json();

    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No trades provided for analysis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate trade statistics
    const winTrades = trades.filter(t => t.result === 'win');
    const lossTrades = trades.filter(t => t.result === 'loss');
    const closedTrades = trades.filter(t => t.result !== 'open');
    const winRate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 0;
    
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgRR = trades.filter(t => t.rr).length > 0 
      ? trades.filter(t => t.rr).reduce((sum, t) => sum + (t.rr || 0), 0) / trades.filter(t => t.rr).length 
      : 0;
    
    const avgRisk = trades.filter(t => t.risk_pct).length > 0 
      ? trades.filter(t => t.risk_pct).reduce((sum, t) => sum + (t.risk_pct || 0), 0) / trades.filter(t => t.risk_pct).length 
      : 0;

    // Prepare trading data summary for AI analysis
    const tradingSummary = {
      totalTrades: trades.length,
      winRate: winRate.toFixed(1),
      totalPnL: totalPnL.toFixed(2),
      avgRiskReward: avgRR.toFixed(2),
      avgRiskPercentage: avgRisk.toFixed(1),
      wins: winTrades.length,
      losses: lossTrades.length,
      pairs: [...new Set(trades.map(t => t.pair))],
      directions: {
        long: trades.filter(t => t.direction === 'long').length,
        short: trades.filter(t => t.direction === 'short').length
      },
      recentTrades: trades.slice(0, 10).map(t => ({
        pair: t.pair,
        direction: t.direction,
        result: t.result,
        pnl: t.pnl,
        rr: t.rr,
        notes: t.notes?.substring(0, 100) // Limit notes length
      }))
    };

    console.log('Sending analysis request to Lovable AI for', trades.length, 'trades');

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
            role: 'system',
            content: `You are an expert trading coach and analyst. Analyze the provided trading data and give actionable insights. Focus on:
            1. Performance strengths and weaknesses
            2. Risk management assessment
            3. Trading patterns and behavior
            4. Specific actionable recommendations
            5. Areas for improvement
            
            Keep your analysis professional, encouraging, and actionable. Use markdown formatting for better readability.`
          },
          {
            role: 'user',
            content: `Please analyze my trading performance based on this data:

**Trading Summary:**
- Total Trades: ${tradingSummary.totalTrades}
- Win Rate: ${tradingSummary.winRate}%
- Total P&L: $${tradingSummary.totalPnL}
- Average Risk/Reward: 1:${tradingSummary.avgRiskReward}
- Average Risk per Trade: ${tradingSummary.avgRiskPercentage}%
- Wins: ${tradingSummary.wins} | Losses: ${tradingSummary.losses}
- Trading Pairs: ${tradingSummary.pairs.join(', ')}
- Direction Split: ${tradingSummary.directions.long} Long, ${tradingSummary.directions.short} Short

**Recent Trade Details:**
${tradingSummary.recentTrades.map(t => 
  `- ${t.pair} ${t.direction} → ${t.result} (P&L: $${t.pnl || 'N/A'}, R:R: ${t.rr ? '1:' + t.rr.toFixed(2) : 'N/A'}) ${t.notes ? '| Notes: ' + t.notes : ''}`
).join('\n')}

Please provide a comprehensive analysis with specific recommendations for improvement.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Lovable AI API error:', response.status, response.statusText, errorData);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid Lovable AI key. Please check your configuration.' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: `Lovable AI error: ${response.status} ${response.statusText}` }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const data = await response.json();
    console.log('Lovable AI analysis completed successfully');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from Lovable AI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        analysis,
        summary: tradingSummary,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analyze-trades function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during analysis',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});