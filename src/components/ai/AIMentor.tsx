import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from '@/hooks/useTrades';
import { useAICredits } from '@/hooks/useAICredits';
import { UpgradeModal } from './UpgradeModal';
import { Badge } from '@/components/ui/badge';

interface AIMentorProps {
  trades: Trade[];
  userPlan: string;
  onUpgradeClick?: () => void;
}

interface MentorResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
}

export const AIMentor = ({ trades, userPlan, onUpgradeClick }: AIMentorProps) => {
  const [loading, setLoading] = useState(false);
  const [mentorResponse, setMentorResponse] = useState<MentorResponse | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  const { credits, hasEnoughCredits, fetchCredits } = useAICredits();

  const CREDIT_COST = 0; // AI Mentor is now free for all users
  const canUseMentor = true; // All users can use the mentor

  const handleMentorClick = async () => {

    if (trades.length < 5) {
      toast({
        title: "Insufficient Data",
        description: "You need at least 5 trades for AI mentor insights.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get last 20 trades for analysis
      const recentTrades = trades.slice(0, 20);
      
      const { data, error } = await supabase.functions.invoke('ai-mentor', {
        body: { 
          trades: recentTrades,
          creditsRequired: CREDIT_COST,
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from mentor function');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setMentorResponse(data.mentorResponse);
      await fetchCredits(); // Refresh credit count
      
      toast({
        title: "AI Mentor Ready! 🚀",
        description: "Your personal trading insights are ready to review.",
      });
    } catch (error) {
      console.error('Mentor error:', error);
      
      let errorMessage = "There was an error getting mentor insights. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "OpenAI API key is not configured. Please contact support.";
        } else if (error.message.includes('quota')) {
          errorMessage = "OpenAI API quota exceeded. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Mentor Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const UpgradeTeaser = () => (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-lg lg:text-xl">AI Trading Mentor 🧠</CardTitle>
        <CardDescription className="text-sm lg:text-base">
          Get AI insights & improve your strategy. Upgrade to Pro to unlock.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-3 lg:gap-4">
          <div className="p-3 lg:p-4 rounded-lg bg-background/50 border">
            <Target className="w-5 h-5 lg:w-6 lg:h-6 text-primary mb-2" />
            <h4 className="font-semibold text-sm lg:text-base mb-1">Personalized Analysis</h4>
            <p className="text-xs lg:text-sm text-muted-foreground">Deep insights into your trading patterns</p>
          </div>
          <div className="p-3 lg:p-4 rounded-lg bg-background/50 border">
            <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-primary mb-2" />
            <h4 className="font-semibold text-sm lg:text-base mb-1">Improvement Roadmap</h4>
            <p className="text-xs lg:text-sm text-muted-foreground">Clear action steps to level up your trading</p>
          </div>
          <div className="p-3 lg:p-4 rounded-lg bg-background/50 border">
            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-primary mb-2" />
            <h4 className="font-semibold text-sm lg:text-base mb-1">Strength Recognition</h4>
            <p className="text-xs lg:text-sm text-muted-foreground">Identify what you're doing well</p>
          </div>
          <div className="p-3 lg:p-4 rounded-lg bg-background/50 border">
            <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-primary mb-2" />
            <h4 className="font-semibold text-sm lg:text-base mb-1">Risk Management</h4>
            <p className="text-xs lg:text-sm text-muted-foreground">Optimize your position sizing and risk</p>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={handleMentorClick}
            className="w-full lg:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-4 lg:px-8 py-3 lg:py-6 text-sm lg:text-lg min-h-[44px]"
          >
            <Star className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Unlock AI Mentor 💡
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MentorResults = ({ response }: { response: MentorResponse }) => (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Performance Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{response.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <CardTitle className="text-green-700 dark:text-green-400">Your Strengths</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {response.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-orange-700 dark:text-orange-400">Areas to Improve</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {response.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Your Action Plan</CardTitle>
          </div>
          <CardDescription>
            Follow these steps to improve your trading performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {response.actionPlan.map((action, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-sm leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );

  // All users can use mentor - no upgrade teaser needed

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-lg lg:text-xl">AI Trading Mentor</CardTitle>
                  <CardDescription className="text-sm lg:text-base">
                    Get personalized insights from your AI trading coach
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default">{CREDIT_COST} credits</Badge>
            </div>
          </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Button 
              onClick={handleMentorClick}
              disabled={loading || trades.length < 5 || !hasEnoughCredits(CREDIT_COST)}
              className="w-full lg:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-4 lg:px-8 py-3 lg:py-6 text-sm lg:text-lg min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Your Trades...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Ask Your AI Mentor ({CREDIT_COST} credits)
                </>
              )}
            </Button>
            
            {trades.length < 5 && (
              <p className="text-sm text-muted-foreground">
                You need at least 5 trades for meaningful mentor insights
              </p>
            )}
            
            {!hasEnoughCredits(CREDIT_COST) && (
              <p className="text-sm text-destructive font-medium">
                Insufficient credits. You need {CREDIT_COST} credits but only have {credits?.remaining || 0} remaining.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {mentorResponse && <MentorResults response={mentorResponse} />}
    </div>

    <UpgradeModal
      open={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      reason="credits"
    />
  </>
  );
};