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
import { AIMentor } from '@/components/ai/AIMentor';

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
        <div>
          <h1 className="text-3xl font-bold">Analyze</h1>
          <p className="text-muted-foreground">
            Get AI-powered insights into your trading performance
          </p>
        </div>

        {/* AI Trading Mentor */}
        <AIMentor 
          trades={trades} 
          userPlan={profile?.plan || 'free'} 
          onUpgradeClick={() => {
            toast({
              title: "Upgrade to Pro",
              description: "Visit your settings to upgrade and unlock AI mentor features.",
            });
          }}
        />

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
            {/* Coming Soon - AI Coach */}
            <div className="text-center py-12 space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">🚀 AI Trading Coach Coming Soon!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We're developing an advanced AI coach that will provide personalized trading insights and recommendations based on your performance data.
                </p>
              </div>
              
              {/* Preview of Features */}
              <div className="max-w-2xl mx-auto mt-8">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 border rounded-lg space-y-2">
                    <Target className="w-5 h-5 text-primary mx-auto" />
                    <h4 className="font-semibold">Risk Analysis</h4>
                    <p className="text-muted-foreground">Optimize your position sizing and risk management</p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <TrendingUp className="w-5 h-5 text-primary mx-auto" />
                    <h4 className="font-semibold">Pattern Recognition</h4>
                    <p className="text-muted-foreground">Identify your most profitable setups</p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <Clock className="w-5 h-5 text-primary mx-auto" />
                    <h4 className="font-semibold">Timing Optimization</h4>
                    <p className="text-muted-foreground">Find your best trading hours and sessions</p>
                  </div>
                  <div className="p-4 border rounded-lg space-y-2">
                    <BarChart3 className="w-5 h-5 text-primary mx-auto" />
                    <h4 className="font-semibold">Performance Insights</h4>
                    <p className="text-muted-foreground">Get actionable recommendations for improvement</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}