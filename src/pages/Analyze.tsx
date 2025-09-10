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

      if (error) throw error;

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
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your trades. Please try again.",
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
            {/* AI Analysis Results */}
            {analysis && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-6 h-6 text-primary" />
                    <CardTitle>AI Trading Coach Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed bg-background/50 p-4 rounded-lg border">
                      {analysis}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Summary Generator */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <CardTitle>Weekly Performance Summary</CardTitle>
                </div>
                <CardDescription>
                  Get personalized insights and actionable recommendations from your AI trading coach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Your AI Trading Coach</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      I analyze your trading patterns to provide precise, actionable insights. Think of me as your personal trading mentor,
                      helping you identify what's working and where you can improve.
                    </p>
                  </div>
                  
                  {!analysis && (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Ready to analyze your trading patterns and get personalized coaching insights?
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}