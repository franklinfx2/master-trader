import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  status: 'success' | 'failed' | 'testing';
  message: string;
  details?: any;
  timestamp?: string;
}

export function OpenAITester() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testOpenAIConnection = async () => {
    setLoading(true);
    setTestResult({ status: 'testing', message: 'Testing OpenAI API connection...' });

    try {
      const { data, error } = await supabase.functions.invoke('test-openai');

      if (error) {
        throw error;
      }

      setTestResult({
        status: data.status,
        message: data.message,
        details: data,
        timestamp: data.timestamp
      });

      if (data.status === 'success') {
        toast({
          title: "✅ OpenAI API Test Successful",
          description: "Your OpenAI integration is working correctly!",
        });
      } else {
        toast({
          title: "❌ OpenAI API Test Failed",
          description: data.error || "There was an error testing the OpenAI connection",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('OpenAI test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setTestResult({
        status: 'failed',
        message: errorMessage,
        details: error,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "❌ OpenAI Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (testResult?.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Zap className="w-5 h-5 text-violet" />;
    }
  };

  const getStatusBadge = () => {
    switch (testResult?.status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Testing...</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <Card className="border-violet/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">OpenAI API Connection</CardTitle>
              <CardDescription>
                Test your OpenAI integration and API key status
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testOpenAIConnection}
          disabled={loading}
          className="w-full"
          variant={testResult?.status === 'success' ? 'outline' : 'default'}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              {testResult ? 'Test Again' : 'Test OpenAI Connection'}
            </>
          )}
        </Button>

        {testResult && (
          <div className="space-y-3">
            <div className={`p-3 rounded-md border ${
              testResult.status === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : testResult.status === 'failed'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <p className="text-sm font-medium">{testResult.message}</p>
              {testResult.timestamp && (
                <p className="text-xs opacity-75 mt-1">
                  Tested at: {new Date(testResult.timestamp).toLocaleString()}
                </p>
              )}
            </div>

            {testResult.status === 'success' && testResult.details && (
              <div className="text-sm space-y-2 bg-muted p-3 rounded-md">
                <p><strong>Model:</strong> {testResult.details.model}</p>
                <p><strong>AI Response:</strong> "{testResult.details.aiResponse}"</p>
                {testResult.details.usage && (
                  <p><strong>Usage:</strong> {testResult.details.usage.total_tokens} tokens</p>
                )}
              </div>
            )}

            {testResult.status === 'failed' && testResult.details && (
              <div className="text-sm bg-red-50 p-3 rounded-md border border-red-200">
                <p className="font-medium text-red-800 mb-2">Error Details:</p>
                <pre className="text-xs text-red-700 whitespace-pre-wrap">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• This test verifies your OpenAI API key configuration</p>
          <p>• Make sure your API key is set in Supabase Edge Function secrets</p>
          <p>• Check your OpenAI account for usage and billing status</p>
        </div>
      </CardContent>
    </Card>
  );
}