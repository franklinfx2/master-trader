import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, TrendingUp, Shield, Bell, CheckCircle, Camera, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AICoProAnalyzer = () => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleNotifyMe = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to get notified when AI Co-Pro Analyzer launches.",
        variant: "destructive",
      });
      return;
    }

    // Here you could add actual subscription logic
    setIsSubscribed(true);
    toast({
      title: "You're on the list! 🚀",
      description: "We'll notify you the moment AI Co-Pro Analyzer is available.",
    });
    setEmail('');
  };

  return (
    <>
      <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-amber-500/10 backdrop-blur-sm">
        {/* Premium glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-amber-500/20 opacity-50 blur-xl" />
        
        <CardHeader className="relative text-center pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-amber-500 flex items-center justify-center mb-4 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <CardTitle className="text-lg lg:text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 bg-clip-text text-transparent font-bold">
            AI Co-Pro Analyzer
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">
            Coming Soon – Premium
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <div className="text-center">
            <Button 
              onClick={() => setShowModal(true)}
              className="w-full lg:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 hover:from-blue-700 hover:via-purple-700 hover:to-amber-700 text-white font-semibold px-4 lg:px-8 py-3 lg:py-6 text-sm lg:text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Coming Soon – Premium
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teaser Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-amber-500 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
              AI Co-Pro Analyzer: The Future of Trading
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              Your next-level trading partner is coming soon
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-bold mb-4 text-center">What Makes It Revolutionary?</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The AI Co-Pro Analyzer is your next-level trading partner. Upload market screenshots for insights on price direction, session volatility, and news threats. Get probability-based trade evaluations and complete trade setups with entries, TP, and SL — always with a solid risk-to-reward ratio.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Backed by GPT, it will act as both mentor and analyst, helping you learn while you trade. Exclusive to Premium users with its own pricing when launched.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Screenshot-based market analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Price direction probability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Session volatility insights</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Complete trade setups</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Risk-reward optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">News threat detection</span>
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                🚀 This is the future of trading mentorship
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mb-4">
                Coming soon for Premium users. Be the first to unlock it.
              </p>
              
              {!isSubscribed ? (
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email for early access"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="max-w-sm mx-auto"
                  />
                  <Button 
                    onClick={handleNotifyMe}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me When Available
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">You're on the early access list!</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};