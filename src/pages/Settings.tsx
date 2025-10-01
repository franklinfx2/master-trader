import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, CreditCard, User, CheckCircle, LogOut } from 'lucide-react';
import { formatPesewasToGHS, PLANS, isInFreeTrial, getTrialDaysRemaining } from '@/lib/paystack';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ReferralDashboard } from '@/components/referrals/ReferralDashboard';
import { AdminReferralDashboard } from '@/components/referrals/AdminReferralDashboard';

export default function Settings() {
  const { signOut } = useAuth();
  const { profile, updateProfile, fetchProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobileOrTablet();
  const isAdmin = profile?.is_admin || false;

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

  // ✅ Paystack upgrade handler with metadata
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
        toast({
          title: "Redirecting to Paystack",
          description: "Opening secure payment page...",
        });
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

  // ✅ NOWPayments upgrade handler with metadata
  const handleCryptoUpgrade = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-nowpayments-checkout', {
        body: {
          email: profile?.email,
          userId: profile?.id,
        }
      });

      if (error) throw error;

      if (data.payUrl) {
        // Open NOWPayments checkout in new tab
        window.open(data.payUrl, '_blank');
        toast({
          title: "Redirecting to NOWPayments",
          description: "Opening secure cryptocurrency payment page...",
        });
      }
    } catch (error) {
      console.error('Crypto checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error starting the crypto checkout. Please try again.",
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
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-4" : "space-y-6"
      )}>
        <div className="space-y-1">
          <h1 className={cn(
            "font-bold text-violet",
            isMobile ? "text-2xl" : "text-3xl"
          )}>
            Settings
          </h1>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-sm" : ""
          )}>
            Manage your account and subscription
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="account" className="space-y-6">

        {/* Profile Card - Mobile Optimized */}
        <Card className="card-premium animate-scale-in">
          <CardHeader className={cn(isMobile && "p-4 pb-2")}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-violet/10">
                <User className={cn(
                  "text-violet",
                  isMobile ? "w-5 h-5" : "w-6 h-6"
                )} />
              </div>
              <CardTitle className={cn(
                "text-violet",
                isMobile ? "text-lg" : "text-xl"
              )}>
                Profile
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className={cn(isMobile && "p-4 pt-2")}>
            <div className={cn(isMobile ? "space-y-3" : "space-y-4")}>
              <div>
                <label className={cn(
                  "font-medium text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  Email
                </label>
                <p className={cn(
                  "font-medium",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {profile?.email}
                </p>
              </div>
              <div>
                <label className={cn(
                  "font-medium text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  Member Since
                </label>
                <p className={cn(
                  "font-medium",
                  isMobile ? "text-base" : "text-lg"
                )}>
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
                {/* Free Trial Status */}
                {profile?.created_at && isInFreeTrial(profile.created_at) ? (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="font-medium">Free Trial Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You have {getTrialDaysRemaining(profile.created_at)} days left in your free trial. 
                      Enjoy all Pro features!
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-5 h-5 text-destructive" />
                      <span className="font-medium">Free Trial Expired</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your 3-day free trial has ended. Upgrade to Pro to continue using all features.
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-violet">Upgrade to Pro</h3>
                  <p className="text-muted-foreground text-lg">
                    Unlock unlimited trades, advanced AI analytics, premium insights, and exclusive features for just ₵120/month.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="status-premium text-sm">Unlimited Trades</span>
                    <span className="status-premium text-sm">AI Analysis</span>
                    <span className="status-premium text-sm">CSV Export</span>
                    <span className="status-premium text-sm">Premium Charts</span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-muted-foreground">Free Trial (3 Days)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• All Pro features included</li>
                      <li>• No credit card required</li>
                      <li>• Full access for 3 days</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-primary">Pro Plan (₵120/month)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Unlimited trades</li>
                      <li>• Advanced analytics</li>
                      <li>• Unlimited AI analysis</li>
                      <li>• CSV export</li>
                      <li>• Priority support</li>
                      <li>• API access</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Local Payments (Paystack)</h4>
                    <Button 
                      onClick={handleUpgrade}
                      disabled={loading}
                      variant="premium"
                      size="lg"
                      className="w-full sm:w-auto shadow-powerful"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5 mr-2" />
                          {profile?.created_at && isInFreeTrial(profile.created_at) 
                            ? 'Continue with Pro - ₵120/month' 
                            : 'Upgrade to Pro - ₵120/month'
                          }
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">International Payments (Cryptocurrency)</h4>
                    <Button 
                      onClick={handleCryptoUpgrade}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        'Pay with Cryptocurrency'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Bitcoin, Ethereum, and 150+ cryptocurrencies accepted
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
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
                {/* Free Trial Status */}
                {profile?.created_at && isInFreeTrial(profile.created_at) ? (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="font-medium">Free Trial Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You have {getTrialDaysRemaining(profile.created_at)} days left in your free trial. 
                      Enjoy all Pro features!
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-5 h-5 text-destructive" />
                      <span className="font-medium">Free Trial Expired</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your 3-day free trial has ended. Upgrade to Pro to continue using all features.
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-violet">Upgrade to Pro</h3>
                  <p className="text-muted-foreground text-lg">
                    Unlock unlimited trades, advanced AI analytics, premium insights, and exclusive features for just ₵120/month.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="status-premium text-sm">Unlimited Trades</span>
                    <span className="status-premium text-sm">AI Analysis</span>
                    <span className="status-premium text-sm">CSV Export</span>
                    <span className="status-premium text-sm">Premium Charts</span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-muted-foreground">Free Trial (3 Days)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• All Pro features included</li>
                      <li>• No credit card required</li>
                      <li>• Full access for 3 days</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-primary">Pro Plan (₵120/month)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Unlimited trades</li>
                      <li>• Advanced analytics</li>
                      <li>• Unlimited AI analysis</li>
                      <li>• CSV export</li>
                      <li>• Priority support</li>
                      <li>• API access</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Local Payments (Paystack)</h4>
                    <Button 
                      onClick={handleUpgrade}
                      disabled={loading}
                      variant="premium"
                      size="lg"
                      className="w-full sm:w-auto shadow-powerful"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5 mr-2" />
                          {profile?.created_at && isInFreeTrial(profile.created_at) 
                            ? 'Continue with Pro - ₵120/month' 
                            : 'Upgrade to Pro - ₵120/month'
                          }
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">International Payments (Cryptocurrency)</h4>
                    <Button 
                      onClick={handleCryptoUpgrade}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        'Pay with Cryptocurrency'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Bitcoin, Ethereum, and 150+ cryptocurrencies accepted
                    </p>
                  </div>
                </div>
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
                    <td className="py-2 px-4">Free trial period</td>
                    <td className="text-center py-2 px-4">3 days</td>
                    <td className="text-center py-2 px-4">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Number of trades</td>
                    <td className="text-center py-2 px-4">Unlimited*</td>
                    <td className="text-center py-2 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Advanced analytics</td>
                    <td className="text-center py-2 px-4">✓*</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">AI analysis</td>
                    <td className="text-center py-2 px-4">Unlimited*</td>
                    <td className="text-center py-2 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">CSV export</td>
                    <td className="text-center py-2 px-4">✓*</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Priority support</td>
                    <td className="text-center py-2 px-4">✓*</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">API access</td>
                    <td className="text-center py-2 px-4">✓*</td>
                    <td className="text-center py-2 px-4">✓</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                * Available during 3-day free trial period only
              </p>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralDashboard />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <AdminReferralDashboard />
          </TabsContent>
        )}
        </Tabs>
      </div>
    </Layout>
  );
}