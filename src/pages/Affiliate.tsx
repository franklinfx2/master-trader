import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Affiliate() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Affiliate Program</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our affiliate program and earn by referring others to MasterTraderAI. 
            Help traders improve their skills while earning commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <DollarSign className="w-8 h-8 mx-auto text-primary" />
              <CardTitle className="text-lg">30% Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn 30% commission on every successful referral
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-8 h-8 mx-auto text-primary" />
              <CardTitle className="text-lg">Lifetime Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Earn from your referrals for as long as they stay subscribed
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-8 h-8 mx-auto text-primary" />
              <CardTitle className="text-lg">Performance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time dashboard to track your referrals and earnings
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Gift className="w-8 h-8 mx-auto text-primary" />
              <CardTitle className="text-lg">Quick Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monthly payouts with low minimum threshold
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Simple steps to start earning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center">
                  1
                </Badge>
                <div>
                  <h4 className="font-medium text-foreground">Sign Up</h4>
                  <p className="text-sm text-muted-foreground">
                    Create your MasterTraderAI account and access your unique referral link
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center">
                  2
                </Badge>
                <div>
                  <h4 className="font-medium text-foreground">Share</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your referral link with traders who could benefit from our AI insights
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center">
                  3
                </Badge>
                <div>
                  <h4 className="font-medium text-foreground">Earn</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive 30% commission when your referrals subscribe to our Pro plan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affiliate Benefits</CardTitle>
              <CardDescription>What you get as our affiliate partner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Real-time tracking dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Marketing materials and resources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Dedicated affiliate support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Monthly performance reports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Competitive commission rates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">No signup fees or hidden costs</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="text-center">
          <CardHeader>
            <CardTitle>Ready to Start Earning?</CardTitle>
            <CardDescription>
              Join thousands of affiliates who are already earning with MasterTraderAI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/auth">Get Your Referral Link</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Already have an account? Check your dashboard for your referral link
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}