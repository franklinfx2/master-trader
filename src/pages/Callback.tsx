import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function Callback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref'); // Paystack also sends trxref

    if (reference || trxref) {
      verifyPayment(reference || trxref);
    } else {
      setStatus('error');
      setMessage('No payment reference found in URL');
    }
  }, []);

  const verifyPayment = async (reference: string | null) => {
    if (!reference) {
      setStatus('error');
      setMessage('Invalid payment reference');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference }
      });

      if (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify payment. Please contact support.');
        return;
      }

      if (data.success) {
        setStatus('success');
        setMessage('Payment successful! Your account has been upgraded.');
        toast({
          title: "Payment Successful!",
          description: "Your account has been upgraded. Welcome to Pro!",
        });
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed');
        toast({
          title: "Payment Failed",
          description: data.message || "Payment was not successful",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying payment');
      toast({
        title: "Verification Error",
        description: "There was an error verifying your payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Payment...';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'error':
        return 'Verification Error';
      default:
        return 'Processing...';
    }
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>
            
            <div className="space-y-2">
              {status === 'success' && (
                <Button 
                  onClick={() => navigate('/settings')} 
                  className="w-full"
                  variant="premium"
                >
                  Go to Settings
                </Button>
              )}
              
              {(status === 'failed' || status === 'error') && (
                <Button 
                  onClick={() => navigate('/settings')} 
                  className="w-full"
                  variant="outline"
                >
                  Try Again
                </Button>
              )}
              
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="ghost"
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}