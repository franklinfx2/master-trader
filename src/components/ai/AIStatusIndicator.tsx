import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, CheckCircle, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AIStatusIndicatorProps {
  showFullTest?: boolean;
}

export function AIStatusIndicator({ showFullTest = false }: AIStatusIndicatorProps) {
  const [status, setStatus] = useState<'unknown' | 'connected' | 'error' | 'testing'>('unknown');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const checkAIStatus = async () => {
    setStatus('testing');
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-openai');

      if (error) {
        throw error;
      }

      if (data.status === 'success') {
        setStatus('connected');
        setLastChecked(new Date());
        if (showFullTest) {
          toast({
            title: "AI System Online",
            description: "OpenAI integration is working correctly",
          });
        }
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Unknown error');
        if (showFullTest) {
          toast({
            title: "AI System Error",
            description: data.error || 'OpenAI integration failed',
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'Connection failed';
      setErrorMessage(message);
      if (showFullTest) {
        toast({
          title: "AI System Error",
          description: message,
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    // Auto-check status on mount
    checkAIStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Brain className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">AI Online</Badge>;
      case 'error':
        return <Badge variant="destructive">AI Offline</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Testing...</Badge>;
      default:
        return <Badge variant="outline">AI Status Unknown</Badge>;
    }
  };

  if (!showFullTest) {
    // Compact version for header or quick status
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        {getStatusBadge()}
      </div>
    );
  }

  // Full test interface
  return (
    <Card className="border-violet/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">AI System Status</span>
            </div>
            {getStatusBadge()}
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {errorMessage}
              </p>
            </div>
          )}

          {status === 'connected' && lastChecked && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>✅ All AI features are working correctly</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            </div>
          )}

          <Button 
            onClick={checkAIStatus}
            disabled={status === 'testing'}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {status === 'testing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Test AI Connection
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• AI features include trade analysis and insights</p>
            <p>• Powered by OpenAI GPT models</p>
            <p>• Requires valid API key configuration</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}