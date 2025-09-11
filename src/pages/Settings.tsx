import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, CreditCard, User, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { profile, updateProfile, fetchProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Check for payment verification on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference) {
      verifyPayment(reference);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const verifyPayment = async (reference: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-paystack-payment', {
        body: { reference }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Successful!",
          description: "Your account has been upgraded to Pro. Welcome!",
        });
        // Refresh profile data
        await fetchProfile();
      } else {
        toast({
          title: "Payment Verification Failed",
          description: data.message || "Unable to verify payment. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "There was an error verifying your payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-paystack-checkout', {
        body: {
          email: profile?.email,
          userId: profile?.id,
        }
      });

      if (error) throw error;

      if (data.payUrl) {
        // Open Paystack checkout in new tab
        window.open(data.payUrl, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error starting the checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (profile?.plan !== 'pro') {
      toast({
        title: "No Active Subscription",
        description: "You don't have an active subscription to manage.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Manage Subscription",
      description: "Please contact support to manage your subscription.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and subscription
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6" />
              <CardTitle>Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{profile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="text-lg">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <CardTitle>Subscription</CardTitle>
              </div>
              <Badge variant={profile?.plan === 'pro' ? 'default' : 'secondary'}>
                {profile?.plan === 'pro' ? (
                  <div className="flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Pro</span>
                  </div>
                ) : (
                  'Free'
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {profile?.plan === 'pro' ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium">Pro Plan Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You have access to all premium features including unlimited trades and AI analysis.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  className="w-full sm:w-auto"
                >
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
                  <p className="text-muted-foreground mb-4">
                    Get unlimited trades, unlimited AI analysis, and CSV export for just $9/month.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-muted-foreground">Free Plan</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Up to 20 trades</li>
                      <li>• Basic analytics</li>
                      <li>• AI analysis (weekly)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-primary">Pro Plan</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Unlimited trades</li>
                      <li>• Advanced analytics</li>
                      <li>• Unlimited AI analysis</li>
                      <li>• CSV export</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro - $9/month
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>
              See what's included in each plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-center py-2 px-4">Free</th>
                    <th className="text-center py-2 px-4">Pro</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="py-2 px-4">Number of trades</td>
                    <td className="text-center py-2 px-4">20</td>
                    <td className="text-center py-2 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Basic analytics</td>
                    <td className="text-center py-2 px-4">✓</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Advanced analytics</td>
                    <td className="text-center py-2 px-4">✗</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">AI analysis</td>
                    <td className="text-center py-2 px-4">Weekly</td>
                    <td className="text-center py-2 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">CSV export</td>
                    <td className="text-center py-2 px-4">✗</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Priority support</td>
                    <td className="text-center py-2 px-4">✗</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}