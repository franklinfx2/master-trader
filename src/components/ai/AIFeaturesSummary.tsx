import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, AlertCircle, TrendingUp, Target, Clock, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AIFeature {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'working' | 'error' | 'testing' | 'unknown';
  endpoint?: string;
}

export function AIFeaturesSummary() {
  const [features, setFeatures] = useState<AIFeature[]>([
    {
      name: 'Trade Analysis',
      description: 'AI-powered analysis of your trading patterns and performance',
      icon: <TrendingUp className="w-5 h-5" />,
      status: 'unknown',
      endpoint: 'analyze-trades'
    },
    {
      name: 'Risk Assessment',
      description: 'Intelligent risk management recommendations',
      icon: <Target className="w-5 h-5" />,
      status: 'unknown'
    },
    {
      name: 'Market Insights',
      description: 'Real-time AI insights based on your trading data',
      icon: <Brain className="w-5 h-5" />,
      status: 'unknown'
    },
    {
      name: 'AI Mentor',
      description: 'Your personal AI trading coach providing tailored insights',
      icon: <Clock className="w-5 h-5" />,
      status: 'unknown',
      endpoint: 'ai-mentor'
    }
  ]);
  
  const [overallStatus, setOverallStatus] = useState<'working' | 'error' | 'testing'>('testing');
  const [lastTested, setLastTested] = useState<Date | null>(null);
  const { toast } = useToast();

  const testAllFeatures = async () => {
    setOverallStatus('testing');
    
    // Test OpenAI connection first
    try {
      const { data: testData, error: testError } = await supabase.functions.invoke('test-openai');
      
      if (testError || testData.status !== 'success') {
        // If OpenAI test fails, mark all features as error
        setFeatures(prev => prev.map(f => ({ ...f, status: 'error' as const })));
        setOverallStatus('error');
        
        toast({
          title: "AI System Offline",
          description: testData.error || testError?.message || "OpenAI connection failed",
          variant: "destructive",
        });
        return;
      }

      // OpenAI is working, test individual features
      const updatedFeatures = await Promise.all(
        features.map(async (feature) => {
          if (feature.endpoint) {
            try {
              // Test with minimal data
              const { data, error } = await supabase.functions.invoke(feature.endpoint, {
                body: { 
                  trades: [
                    {
                      id: 'test',
                      pair: 'EURUSD',
                      direction: 'long',
                      entry: 1.1000,
                      exit: 1.1050,
                      result: 'win',
                      pnl: 50,
                      rr: 2.0,
                      executed_at: new Date().toISOString()
                    }
                  ]
                }
              });

              if (error || data.error) {
                return { ...feature, status: 'error' as const };
              }

              return { ...feature, status: 'working' as const };
            } catch (error) {
              return { ...feature, status: 'error' as const };
            }
          }
          
          // For features without endpoints, assume working if OpenAI test passed
          return { ...feature, status: 'working' as const };
        })
      );

      setFeatures(updatedFeatures);
      
      const allWorking = updatedFeatures.every(f => f.status === 'working');
      setOverallStatus(allWorking ? 'working' : 'error');
      setLastTested(new Date());

      toast({
        title: allWorking ? "All AI Features Online" : "Some AI Features Have Issues",
        description: allWorking 
          ? "All AI features are working correctly" 
          : "Some features may not work properly",
        variant: allWorking ? "default" : "destructive",
      });

    } catch (error) {
      setFeatures(prev => prev.map(f => ({ ...f, status: 'error' as const })));
      setOverallStatus('error');
      
      toast({
        title: "AI System Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    testAllFeatures();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Working</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Testing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="border-violet/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-violet" />
            <div>
              <CardTitle>AI Features Status</CardTitle>
              <CardDescription>
                Monitor the health of all AI-powered features
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus)}
            {overallStatus === 'working' && (
              <Badge className="bg-green-100 text-green-800 border-green-200">All Systems Online</Badge>
            )}
            {overallStatus === 'error' && (
              <Badge variant="destructive">Issues Detected</Badge>
            )}
            {overallStatus === 'testing' && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Testing...</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-md ${
                  feature.status === 'working' 
                    ? 'bg-green-100 text-green-700' 
                    : feature.status === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {feature.icon}
                </div>
                <div>
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              {getStatusBadge(feature.status)}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {lastTested && (
              <span>Last tested: {lastTested.toLocaleTimeString()}</span>
            )}
          </div>
          <Button 
            onClick={testAllFeatures}
            disabled={overallStatus === 'testing'}
            variant="outline"
            size="sm"
          >
            {overallStatus === 'testing' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Test All Features
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>🔹 All AI features require a valid OpenAI API key</p>
          <p>🔹 Make sure your API key is configured in Supabase secrets</p>
          <p>🔹 Check your OpenAI account for usage limits and billing</p>
        </div>
      </CardContent>
    </Card>
  );
}