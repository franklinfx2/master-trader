import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AICoProAnalyzerActive } from '@/components/ai/AICoProAnalyzerActive';
import { AICreditDisplay } from '@/components/ai/AICreditDisplay';

export default function Analyze() {
  const navigate = useNavigate();
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="text-center sm:text-left">
            <h1 className="font-bold text-lg sm:text-2xl lg:text-4xl leading-tight">Analyze</h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-lg mt-1 sm:mt-2">
              Get AI-powered insights into your trading performance
            </p>
          </div>

        {/* AI Features Section - Responsive Layout */}
        <div className="space-y-4 lg:space-y-6">
          {/* AI Trading Mentor */}
          <AIMentor 
            trades={trades} 
            userPlan={profile?.plan || 'free'} 
            onUpgradeClick={() => navigate('/settings')}
          />

          {/* AI Co-Pro Analyzer - Coming Soon for Premium */}
              <AICoProAnalyzerActive userPlan={profile?.plan || 'free'} />
              <AICreditDisplay className="mt-4" />
        </div>

        {/* Enhanced Analysis Dashboard - Responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions" className="hidden sm:inline-flex">Sessions</TabsTrigger>
            <TabsTrigger value="timing" className="hidden sm:inline-flex">Timing</TabsTrigger>
            <TabsTrigger value="setups" className="hidden sm:inline-flex">Setups</TabsTrigger>
            <TabsTrigger value="ai-insights">AI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 lg:space-y-6">
            <TradeFilters trades={trades} onFilterChange={setFilteredTrades} />
            
            {/* AI Coaching Insights Grid - Mobile: 2 cols, Desktop: 4 cols */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
              <AIInsightCard trades={filteredTrades} type="session" />
              <AIInsightCard trades={filteredTrades} type="time" />
              <AIInsightCard trades={filteredTrades} type="setup" />
              <AIInsightCard trades={filteredTrades} type="risk" />
            </div>

            {/* Key Performance Metrics - Mobile: stacked, Desktop: 3 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-6">
              <Card className="p-3 lg:p-6">
                <CardHeader className="p-0 pb-2 lg:pb-4">
                  <CardTitle className="text-xs sm:text-sm lg:text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex sm:flex-col justify-between sm:space-y-1.5 lg:space-y-2">
                    <div className="flex sm:justify-between items-center gap-2">
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">Last 10:</span>
                      <span className="font-medium text-[10px] sm:text-xs lg:text-sm">
                        {filteredTrades.slice(0, 10).filter(t => t.result === 'win').length}/10 wins
                      </span>
                    </div>
                    <div className="flex sm:justify-between items-center gap-2">
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">Win rate:</span>
                      <span className="font-medium text-[10px] sm:text-xs lg:text-sm">
                        {filteredTrades.slice(0, 10).length > 0 
                          ? `${((filteredTrades.slice(0, 10).filter(t => t.result === 'win').length / filteredTrades.slice(0, 10).filter(t => t.result !== 'open').length) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3 lg:p-6">
                <CardHeader className="p-0 pb-2 lg:pb-4">
                  <CardTitle className="text-xs sm:text-sm lg:text-lg">Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex sm:flex-col justify-between sm:space-y-1.5 lg:space-y-2">
                    <div className="flex sm:justify-between items-center gap-2">
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">Long:</span>
                      <span className="font-medium text-[10px] sm:text-xs lg:text-sm">
                        {filteredTrades.filter(t => t.direction === 'long').length}
                      </span>
                    </div>
                    <div className="flex sm:justify-between items-center gap-2">
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">Short:</span>
                      <span className="font-medium text-[10px] sm:text-xs lg:text-sm">
                        {filteredTrades.filter(t => t.direction === 'short').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-3 lg:p-6">
                <CardHeader className="p-0 pb-2 lg:pb-4">
                  <CardTitle className="text-xs sm:text-sm lg:text-lg">Risk</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex sm:flex-col justify-between sm:space-y-1.5 lg:space-y-2">
                    <div className="flex sm:justify-between items-center gap-2">
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">Avg risk:</span>
                      <span className="font-medium text-[10px] sm:text-xs lg:text-sm">
                        {filteredTrades.filter(t => t.risk_pct).length > 0 
                          ? `${(filteredTrades.filter(t => t.risk_pct).reduce((sum, t) => sum + (t.risk_pct || 0), 0) / filteredTrades.filter(t => t.risk_pct).length).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex sm:justify-between items-center gap-2">
                      <span className="text-muted-foreground text-[10px] sm:text-xs lg:text-sm">R:R:</span>
                      <span className="font-medium text-[10px] sm:text-xs lg:text-sm">
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
            <AIMentor 
              trades={filteredTrades} 
              userPlan={profile?.plan || 'free'}
              onUpgradeClick={() => navigate('/settings')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}