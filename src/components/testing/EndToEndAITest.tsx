import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2, Zap, Brain } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  error?: string;
}

export function EndToEndAITest() {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TestStep[]>([
    { name: 'Test OpenAI API Connection', status: 'pending' },
    { name: 'Test Trade Analysis Function', status: 'pending' },
    { name: 'Generate Sample Analysis', status: 'pending' },
    { name: 'Verify Response Quality', status: 'pending' }
  ]);
  const { toast } = useToast();

  const updateStep = (index: number, update: Partial<TestStep>) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, ...update } : step
    ));
  };

  const runFullTest = async () => {
    setTesting(true);
    setProgress(0);
    setCurrentStep(0);

    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', result: undefined, error: undefined })));

    try {
      // Step 1: Test OpenAI API Connection
      setCurrentStep(0);
      updateStep(0, { status: 'running' });
      setProgress(25);

      const { data: connectionTest, error: connectionError } = await supabase.functions.invoke('test-openai');
      
      if (connectionError || connectionTest.status !== 'success') {
        updateStep(0, { 
          status: 'error', 
          error: connectionTest.error || connectionError?.message || 'Connection failed'
        });
        throw new Error('OpenAI connection test failed');
      }

      updateStep(0, { 
        status: 'success', 
        result: `✅ Connected using ${connectionTest.model}`
      });

      // Step 2: Test Trade Analysis Function
      setCurrentStep(1);
      updateStep(1, { status: 'running' });
      setProgress(50);

      const sampleTrades = [
        {
          id: 'test-1',
          pair: 'EURUSD',
          direction: 'long',
          entry: 1.1000,
          exit: 1.1050,
          sl: 1.0950,
          tp: 1.1100,
          risk_pct: 1.0,
          rr: 2.0,
          result: 'win',
          pnl: 500,
          notes: 'Bullish breakout setup with strong momentum',
          executed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'test-2',
          pair: 'GBPUSD',
          direction: 'short',
          entry: 1.2500,
          exit: 1.2450,
          sl: 1.2550,
          tp: 1.2400,
          risk_pct: 1.5,
          rr: 1.0,
          result: 'win',
          pnl: 250,
          notes: 'Resistance level rejection with bearish divergence',
          executed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'test-3',
          pair: 'USDJPY',
          direction: 'long',
          entry: 150.00,
          exit: 149.50,
          sl: 149.00,
          tp: 151.00,
          risk_pct: 2.0,
          rr: 0.5,
          result: 'loss',
          pnl: -300,
          notes: 'False breakout, got stopped out quickly',
          executed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-trades', {
        body: { trades: sampleTrades }
      });

      if (analysisError || analysisData.error) {
        updateStep(1, { 
          status: 'error', 
          error: analysisData.error || analysisError?.message || 'Analysis function failed'
        });
        throw new Error('Trade analysis function test failed');
      }

      updateStep(1, { 
        status: 'success', 
        result: '✅ Analysis function responding correctly'
      });

      // Step 3: Generate Sample Analysis
      setCurrentStep(2);
      updateStep(2, { status: 'running' });
      setProgress(75);

      if (!analysisData.analysis || typeof analysisData.analysis !== 'string') {
        updateStep(2, { 
          status: 'error', 
          error: 'No analysis content received'
        });
        throw new Error('Analysis content is missing');
      }

      updateStep(2, { 
        status: 'success', 
        result: `✅ Generated ${analysisData.analysis.length} characters of analysis`
      });

      // Step 4: Verify Response Quality
      setCurrentStep(3);
      updateStep(3, { status: 'running' });
      setProgress(100);

      // Check if analysis contains key elements
      const analysis = analysisData.analysis.toLowerCase();
      const keyTerms = ['performance', 'risk', 'trade', 'recommendation'];
      const foundTerms = keyTerms.filter(term => analysis.includes(term));

      if (foundTerms.length < 2) {
        updateStep(3, { 
          status: 'error', 
          error: 'Analysis quality check failed - missing key trading terms'
        });
        throw new Error('Analysis quality is insufficient');
      }

      updateStep(3, { 
        status: 'success', 
        result: `✅ Quality check passed (${foundTerms.length}/${keyTerms.length} key terms found)`
      });

      toast({
        title: "🎉 All Tests Passed!",
        description: "Your OpenAI integration is fully functional and ready to use.",
      });

    } catch (error) {
      console.error('End-to-end test failed:', error);
      toast({
        title: "❌ Test Failed",
        description: error instanceof Error ? error.message : "One or more tests failed",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStepIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const allTestsPassed = steps.every(step => step.status === 'success');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <Card className="border-violet/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-violet" />
            <div>
              <CardTitle>Complete AI Integration Test</CardTitle>
              <CardDescription>
                Run comprehensive tests to verify all AI features are working
              </CardDescription>
            </div>
          </div>
          {allTestsPassed && !testing && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              All Tests Passed ✅
            </Badge>
          )}
          {hasErrors && !testing && (
            <Badge variant="destructive">
              Tests Failed ❌
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Test Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                index === currentStep && testing 
                  ? 'border-blue-200 bg-blue-50' 
                  : step.status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : step.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="mt-0.5">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{step.name}</p>
                {step.result && (
                  <p className="text-xs text-green-700 mt-1">{step.result}</p>
                )}
                {step.error && (
                  <p className="text-xs text-red-700 mt-1">❌ {step.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={runFullTest}
          disabled={testing}
          className="w-full"
          size="lg"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Complete AI Test
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>🔸 This test verifies your entire AI pipeline is working correctly</p>
          <p>🔸 Tests API connectivity, function execution, and response quality</p>
          <p>🔸 Run this test after setting up your OpenAI API key</p>
        </div>
      </CardContent>
    </Card>
  );
}