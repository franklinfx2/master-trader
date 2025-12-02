import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Upload, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAICredits } from '@/hooks/useAICredits';
import { supabase } from '@/integrations/supabase/client';
import { UpgradeModal } from './UpgradeModal';

interface AICoProAnalyzerActiveProps {
  userPlan: string;
}

interface AnalysisResult {
  priceDirection: string;
  probability: number;
  volatility: string;
  newsThreats: string[];
  tradeSetup: {
    entry: string;
    tp: string;
    sl: string;
    riskReward: string;
  };
  reasoning: string;
}

export const AICoProAnalyzerActive = ({ userPlan }: AICoProAnalyzerActiveProps) => {
  const [loading, setLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [marketContext, setMarketContext] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  const { credits, hasEnoughCredits, fetchCredits } = useAICredits();

  const CREDIT_COST = 3; // AI Co-Pro uses 3 credits per analysis

  const handleAnalyze = async () => {
    if (!screenshotUrl && !marketContext) {
      toast({
        title: "Input Required",
        description: "Please provide a screenshot URL or market context to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughCredits(CREDIT_COST)) {
      setShowUpgradeModal(true);
      toast({
        title: "Insufficient Credits",
        description: `You need ${CREDIT_COST} AI credits for this analysis. Upgrade to continue!`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-copro-analyzer', {
        body: { 
          screenshotUrl,
          marketContext,
          creditsRequired: CREDIT_COST,
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to get analysis');
      }

      setAnalysis(data.analysis);
      await fetchCredits(); // Refresh credit count
      
      toast({
        title: "Analysis Complete! 🎯",
        description: "Your AI Co-Pro analysis is ready.",
      });
    } catch (error) {
      console.error('AI Co-Pro error:', error);
      
      let errorMessage = "Failed to analyze. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('credits')) {
          setShowUpgradeModal(true);
          errorMessage = "Insufficient credits. Please upgrade to continue.";
        } else if (error.message.includes('rate')) {
          errorMessage = "Rate limit reached. Please wait a moment and try again.";
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

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-amber-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-amber-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
                  AI Co-Pro Analyzer
                </CardTitle>
                <CardDescription>
                  Advanced market analysis with AI-powered trade setups
                </CardDescription>
              </div>
            </div>
            <Badge variant="default">
              {CREDIT_COST} credits per analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Screenshot URL (optional)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="https://example.com/chart-screenshot.png"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button variant="outline" size="icon">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Market Context
              </label>
              <Textarea
                placeholder="Describe the current market situation, pair, timeframe, and any relevant context..."
                value={marketContext}
                onChange={(e) => setMarketContext(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={loading || !hasEnoughCredits(CREDIT_COST)}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 hover:from-blue-700 hover:via-purple-700 hover:to-amber-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze with AI ({CREDIT_COST} credits)
              </>
            )}
          </Button>

          {/* Analysis Results */}
          {analysis && (
            <div className="mt-6 space-y-4 pt-6 border-t">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                      Price Direction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{analysis.priceDirection}</p>
                    <p className="text-sm text-muted-foreground">
                      Probability: {analysis.probability}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                      Volatility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{analysis.volatility}</p>
                  </CardContent>
                </Card>
              </div>

              {analysis.newsThreats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">News Threats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.newsThreats.map((threat, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                          <span className="text-sm">{threat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle>Recommended Trade Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entry</p>
                      <p className="font-semibold">{analysis.tradeSetup.entry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Risk:Reward</p>
                      <p className="font-semibold text-primary">{analysis.tradeSetup.riskReward}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Take Profit</p>
                      <p className="font-semibold text-green-500">{analysis.tradeSetup.tp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stop Loss</p>
                      <p className="font-semibold text-red-500">{analysis.tradeSetup.sl}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Analysis Reasoning:</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.reasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Credit Warning */}
          {!hasEnoughCredits(CREDIT_COST) && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                Insufficient Credits: You need {CREDIT_COST} credits but only have{' '}
                {credits?.remaining || 0} remaining. Upgrade to continue using AI Co-Pro!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="credits"
      />
    </>
  );
};
