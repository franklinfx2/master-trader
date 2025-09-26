import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionStats {
  wins: number;
  total: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please check your Supabase secrets.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { trades } = await req.json();

    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No trades provided for mentor analysis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate comprehensive trade statistics
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

    // Session analysis
    const sessionStats: Record<string, SessionStats> = trades.reduce((acc, trade) => {
      const date = new Date(trade.executed_at);
      const hour = date.getUTCHours();
      
      let session = 'Asian';
      if (hour >= 8 && hour < 16) session = 'London';
      else if (hour >= 13 && hour < 21) session = 'New York';
      
      if (!acc[session]) acc[session] = { wins: 0, total: 0 };
      acc[session].total++;
      if (trade.result === 'win') acc[session].wins++;
      
      return acc;
    }, {} as Record<string, SessionStats>);

    // Prepare comprehensive trading data for AI mentor
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
      sessionPerformance: Object.entries(sessionStats).map(([session, stats]) => ({
        session,
        winRate: stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : '0',
        trades: stats.total
      })),
      recentTrades: trades.slice(0, 5).map(t => ({
        pair: t.pair,
        direction: t.direction,
        result: t.result,
        pnl: t.pnl,
        rr: t.rr,
        risk_pct: t.risk_pct
      }))
    };

    console.log('Sending mentor analysis request to OpenAI for', trades.length, 'trades');

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
            role: 'system',
            content: `You are an expert trading mentor and coach. Your role is to provide supportive, professional, and motivational guidance to help traders improve their performance.

Analyze the provided trading data and respond with a structured mentor-style response in the following JSON format:

{
  "summary": "A 2-3 sentence overall performance summary that's encouraging and balanced",
  "strengths": ["Array of 3-4 specific strengths the trader demonstrates"],
  "weaknesses": ["Array of 3-4 areas that need improvement, phrased constructively"],
  "actionPlan": ["Array of 4-6 specific, actionable steps the trader can take to improve"]
}

Guidelines:
- Be supportive and motivational while being honest about areas for improvement
- Focus on specific, actionable advice rather than generic statements
- Highlight what they're doing well to build confidence
- Frame weaknesses as opportunities for growth
- Make the action plan practical and achievable
- Use a professional but encouraging tone throughout`
          },
          {
            role: 'user',
            content: `Please analyze my trading performance and provide mentorship guidance:

**Trading Performance Data:**
- Total Trades: ${tradingSummary.totalTrades}
- Win Rate: ${tradingSummary.winRate}%
- Total P&L: $${tradingSummary.totalPnL}
- Average Risk/Reward: 1:${tradingSummary.avgRiskReward}
- Average Risk per Trade: ${tradingSummary.avgRiskPercentage}%
- Wins: ${tradingSummary.wins} | Losses: ${tradingSummary.losses}
- Trading Pairs: ${tradingSummary.pairs.join(', ')}
- Direction Split: ${tradingSummary.directions.long} Long, ${tradingSummary.directions.short} Short

**Session Performance:**
${tradingSummary.sessionPerformance.map(s => 
  `- ${s.session} Session: ${s.winRate}% win rate (${s.trades} trades)`
).join('\n')}

**Recent Trades Sample:**
${tradingSummary.recentTrades.map(t => 
  `- ${t.pair} ${t.direction} → ${t.result} (P&L: $${t.pnl || 'N/A'}, R:R: ${t.rr ? '1:' + t.rr.toFixed(2) : 'N/A'}, Risk: ${t.risk_pct || 'N/A'}%)`
).join('\n')}

Please provide your mentor analysis in the exact JSON format specified.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, response.statusText, errorData);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid OpenAI API key. Please check your configuration.' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API quota exceeded. Please check your billing or try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${response.status} ${response.statusText}` }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const data = await response.json();
    console.log('OpenAI mentor analysis completed successfully');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const mentorAnalysis = data.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let mentorResponse;
    try {
      mentorResponse = JSON.parse(mentorAnalysis);
    } catch (parseError) {
      console.error('Failed to parse mentor response:', parseError);
      // Fallback response if JSON parsing fails
      mentorResponse = {
        summary: "Your trading performance shows both strengths and areas for improvement. Keep focusing on consistency and risk management.",
        strengths: [
          "You're actively tracking your trades and seeking feedback",
          "You have experience across multiple trading pairs",
          "You're maintaining discipline in your trading approach"
        ],
        weaknesses: [
          "Consider improving your risk-reward ratio consistency",
          "Work on optimizing your win rate through better entry timing",
          "Focus on developing a more systematic approach to trade management"
        ],
        actionPlan: [
          "Review your most profitable trades to identify common patterns",
          "Set clear rules for position sizing and stick to them consistently",
          "Practice patience with trade entries and wait for high-probability setups",
          "Keep a detailed trading journal to track emotional state and market conditions",
          "Focus on one or two currency pairs to develop deeper expertise"
        ]
      };
    }

    return new Response(
      JSON.stringify({ 
        mentorResponse,
        summary: tradingSummary,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ai-mentor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred during mentor analysis',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});