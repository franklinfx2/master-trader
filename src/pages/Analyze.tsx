import { useState, useEffect } from 'react';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Clock, TrendingUp, AlertCircle, BarChart3, Target, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TradingSessionChart } from '@/components/trading/TradingSessionChart';
import { TimeOfDayChart } from '@/components/trading/TimeOfDayChart';
import { SetupAnalysisChart } from '@/components/trading/SetupAnalysisChart';
import { AIInsightCard } from '@/components/trading/AIInsightCard';
import { TradeFilters } from '@/components/trading/TradeFilters';
import { OpenAITester } from '@/components/testing/OpenAITester';
import { AIFeaturesSummary } from '@/components/ai/AIFeaturesSummary';
import { EndToEndAITest } from '@/components/testing/EndToEndAITest';

export default function Analyze() {
  const { trades } = useTrades();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [filteredTrades, setFilteredTrades] = useState(trades);
  const [activeTab, setActiveTab] = useState('overview');

  // Update filtered trades when trades change
  useEffect(() => {
    setFilteredTrades(trades);
  }, [trades]);

  const canAnalyze = () => {
    if (profile?.plan === 'pro') return true;
    
    if (!profile?.ai_last_analysis_at) return true;
    
    const lastAnalysis = new Date(profile.ai_last_analysis_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastAnalysis < weekAgo;
  };

  const getDaysUntilNextAnalysis = () => {
    if (!profile?.ai_last_analysis_at) return 0;
    
    const lastAnalysis = new Date(profile.ai_last_analysis_at);
    const nextAnalysis = new Date(lastAnalysis.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const diffTime = nextAnalysis.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const handleAnalyze = async () => {
    if (!canAnalyze()) {
      toast({
        title: "Analysis Limit Reached",
        description: "Free users can analyze trades once per week. Upgrade to Pro for unlimited analysis.",
        variant: "destructive",
      });
      return;
    }

    if (trades.length < 5) {
      toast({
        title: "Insufficient Data",
        description: "You need at least 5 trades for meaningful analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get last 20 trades for analysis
      const recentTrades = trades.slice(0, 20);
      
      const { data, error } = await supabase.functions.invoke('analyze-trades', {
        body: { trades: recentTrades }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from analysis function');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      
      // Update last analysis timestamp
      await updateProfile({
        ai_last_analysis_at: new Date().toISOString()
      });

      toast({
        title: "Analysis Complete",
        description: "Your trading analysis is ready!",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      
      let errorMessage = "There was an error analyzing your trades. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "OpenAI API key is not configured. Please check your settings.";
        } else if (error.message.includes('quota')) {
          errorMessage = "OpenAI API quota exceeded. Please check your billing or try again later.";
        } else if (error.message.includes('401')) {
          errorMessage = "Invalid OpenAI API key. Please check your configuration.";
        } else if (error.message.includes('429')) {
          errorMessage = "OpenAI API quota exceeded. Please check your billing or try again later.";
        } else if (error.message.includes('No data received')) {
          errorMessage = "Analysis service is not responding. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportTrades = () => {
    if (profile?.plan !== 'pro') {
      toast({
        title: "Pro Feature",
        description: "CSV export is available for Pro users only.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Pair', 'Direction', 'Entry', 'Exit', 'SL', 'TP', 'Risk%', 'R:R', 'Result', 'P&L', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        new Date(trade.executed_at).toLocaleDateString(),
        trade.pair,
        trade.direction,
        trade.entry,
        trade.exit || '',
        trade.sl || '',
        trade.tp || '',
        trade.risk_pct || '',
        trade.rr || '',
        trade.result,
        trade.pnl || '',
        `"${trade.notes || ''}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your trades have been exported to CSV.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analyze</h1>
            <p className="text-muted-foreground">
              Get AI-powered insights into your trading performance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportTrades}>
              Export CSV
              {profile?.plan !== 'pro' && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-1 rounded">PRO</span>
              )}
            </Button>
          </div>
        </div>

        {/* AI System Status & Testing */}
        <div className="grid lg:grid-cols-3 gap-6">
          <OpenAITester />
          <AIFeaturesSummary />
          <EndToEndAITest />
        </div>

        {/* Analysis Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>AI Trading Analysis</CardTitle>
                  <CardDescription>
                    Analyze your last 20 trades for patterns and insights
                  </CardDescription>
                </div>
              </div>
              {!canAnalyze() && profile?.plan === 'free' && (
                <div className="flex items-center space-x-2 text-amber-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Next analysis in {getDaysUntilNextAnalysis()} day(s)
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {trades.length < 5 ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <AlertCircle className="w-5 h-5" />
                <span>You need at least 5 trades to generate meaningful analysis.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ready to analyze {Math.min(trades.length, 20)} trades
                  </span>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={loading || (!canAnalyze() && profile?.plan === 'free')}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze My Trades
                      </>
                    )}
                  </Button>
                </div>

                {!canAnalyze() && profile?.plan === 'free' && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Free users can analyze trades once per week
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Upgrade to Pro for unlimited AI analysis
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Analysis Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="setups">Setups</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Coach</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <TradeFilters trades={trades} onFilterChange={setFilteredTrades} />
            
            {/* AI Coaching Insights Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AIInsightCard trades={filteredTrades} type="session" />
              <AIInsightCard trades={filteredTrades} type="time" />
              <AIInsightCard trades={filteredTrades} type="setup" />
              <AIInsightCard trades={filteredTrades} type="risk" />
            </div>

            {/* Key Performance Metrics */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last 10 trades:</span>
                      <span className="font-medium">
                        {filteredTrades.slice(0, 10).filter(t => t.result === 'win').length}/10 wins
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win rate:</span>
                      <span className="font-medium">
                        {filteredTrades.slice(0, 10).length > 0 
                          ? `${((filteredTrades.slice(0, 10).filter(t => t.result === 'win').length / filteredTrades.slice(0, 10).filter(t => t.result !== 'open').length) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Long trades:</span>
                      <span className="font-medium">
                        {filteredTrades.filter(t => t.direction === 'long').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Short trades:</span>
                      <span className="font-medium">
                        {filteredTrades.filter(t => t.direction === 'short').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg risk:</span>
                      <span className="font-medium">
                        {filteredTrades.filter(t => t.risk_pct).length > 0 
                          ? `${(filteredTrades.filter(t => t.risk_pct).reduce((sum, t) => sum + (t.risk_pct || 0), 0) / filteredTrades.filter(t => t.risk_pct).length).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg R:R:</span>
                      <span className="font-medium">
                        {filteredTrades.filter(t => t.rr).length > 0 
                          ? `1:${(filteredTrades.filter(t => t.rr).reduce((sum, t) => sum + (t.rr || 0), 0) / filteredTrades.filter(t => t.rr).length).toFixed(2)}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <CardTitle>Trading Sessions Performance</CardTitle>
                </div>
                <CardDescription>
                  Analyze your win rates across different trading sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradingSessionChart trades={filteredTrades} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-primary" />
                  <CardTitle>Time of Day Analysis</CardTitle>
                </div>
                <CardDescription>
                  Discover your most profitable trading hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimeOfDayChart trades={filteredTrades} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setups" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-primary" />
                  <CardTitle>Setup Analysis</CardTitle>
                </div>
                <CardDescription>
                  Identify your most successful trading patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SetupAnalysisChart trades={filteredTrades} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            {/* Premium AI Coach Header */}
            <div className="relative overflow-hidden rounded-2xl p-8 glass-effect border border-violet/20">
              <div className="absolute inset-0 bg-gradient-to-r from-violet/20 via-violet/10 to-violet/20" />
              <div className="relative z-10 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-violet text-white flex items-center justify-center shadow-premium">
                  <Brain className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-violet">AI Trading Coach</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your personal AI mentor analyzing every aspect of your trading performance to maximize profitability
                </p>
              </div>
            </div>

            {/* Premium Navigation Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="violet" size="lg" className="shadow-strong">
                <Target className="w-5 h-5 mr-2" />
                Risk Management
              </Button>
              <Button variant="outline" size="lg" className="border-violet/30 hover:bg-violet/10">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Patterns
              </Button>
              <Button variant="outline" size="lg" className="border-violet/30 hover:bg-violet/10">
                <Clock className="w-5 h-5 mr-2" />
                Timing Analysis
              </Button>
              <Button variant="outline" size="lg" className="border-violet/30 hover:bg-violet/10">
                <BarChart3 className="w-5 h-5 mr-2" />
                Setup Optimization
              </Button>
            </div>

            {/* AI Analysis Results */}
            {analysis && (
              <Card className="card-premium border-violet/30 bg-gradient-to-br from-violet/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-violet/10">
                      <Brain className="w-6 h-6 text-violet" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-violet">AI Trading Coach Analysis</CardTitle>
                      <CardDescription className="text-base">Personalized insights from your trading data</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed glass-effect p-6 rounded-xl border border-violet/20">
                      {analysis}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium AI Coach Description */}
            <Card className="card-premium">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-violet/10">
                    <TrendingUp className="w-6 h-6 text-violet" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-violet">What Your AI Coach Analyzes</CardTitle>
                    <CardDescription className="text-base">Comprehensive trading performance analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="glass-effect p-4 rounded-xl border border-violet/20">
                      <h4 className="font-semibold text-violet mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        Risk Management Analysis
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Analyzes your position sizing, risk-to-reward ratios, and stop-loss placement to identify optimal risk levels and prevent overexposure.
                      </p>
                    </div>
                    <div className="glass-effect p-4 rounded-xl border border-violet/20">
                      <h4 className="font-semibold text-violet mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Timing & Session Performance
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Identifies your most profitable trading hours and market sessions to help you focus your efforts when you perform best.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="glass-effect p-4 rounded-xl border border-violet/20">
                      <h4 className="font-semibold text-violet mb-2 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Setup & Pattern Recognition
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Evaluates your trading setups and entry/exit patterns to highlight your most successful strategies and eliminate losing patterns.
                      </p>
                    </div>
                    <div className="glass-effect p-4 rounded-xl border border-violet/20">
                      <h4 className="font-semibold text-violet mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Profitability Optimization
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Provides actionable recommendations to improve win rates, reduce drawdowns, and maximize your overall trading profitability.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-6 bg-gradient-to-r from-violet/10 via-violet/5 to-violet/10 rounded-xl border border-violet/20">
                  <h4 className="font-bold text-violet mb-3 text-lg">🎯 Key Benefits of AI Analysis</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full mt-2"></div>
                      <span><strong>Identify blind spots</strong> in your trading that you might miss</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full mt-2"></div>
                      <span><strong>Data-driven insights</strong> based on your actual performance</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full mt-2"></div>
                      <span><strong>Personalized recommendations</strong> tailored to your trading style</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full mt-2"></div>
                      <span><strong>Continuous improvement</strong> through regular analysis</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                  
            {!analysis && (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-violet/10 flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-violet" />
                </div>
                <h3 className="text-xl font-semibold text-violet mb-2">Ready for AI Analysis</h3>
                <p className="text-muted-foreground mb-8">
                  Analyze your trades to unlock personalized insights and optimization strategies.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}