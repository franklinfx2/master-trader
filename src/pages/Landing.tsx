import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Shield, Zap, CheckCircle, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">TradingJournal</h1>
          </div>
          <div className="space-x-2">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-profit bg-clip-text text-transparent">
            Track Your Trades. Improve Your Performance.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate trading journal with AI-powered insights to help you analyze your performance, 
            identify patterns, and become a better trader.
          </p>
          <div className="space-x-4">
            <Link to="/auth">
              <Button size="lg" className="px-8 py-3 text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h3>
            <p className="text-lg text-muted-foreground">
              Powerful features designed for serious traders
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Track win rates, risk-reward ratios, and P&L with comprehensive statistics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="w-12 h-12 text-primary mb-4" />
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>
                  Get personalized analysis of your trading patterns and actionable improvement suggestions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your trading data is encrypted and secure. We never share your information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Quick trade entry with smart calculations for P&L, risk-reward, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Trade Validation</CardTitle>
                <CardDescription>
                  Validate your setups and maintain discipline with detailed trade logs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>
                  Monitor your progress over time and identify areas for improvement
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h3>
            <p className="text-lg text-muted-foreground">
              Start for free, upgrade when you're ready
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    Up to 20 trades
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    Basic analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    AI analysis (weekly)
                  </li>
                </ul>
                <Link to="/auth" className="block mt-6">
                  <Button className="w-full" variant="outline">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For serious traders</CardDescription>
                <div className="text-3xl font-bold">$9<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    Unlimited trades
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    Unlimited AI analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    CSV export
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-profit mr-2" />
                    Priority support
                  </li>
                </ul>
                <Link to="/auth" className="block mt-6">
                  <Button className="w-full">
                    Upgrade to Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Improve Your Trading?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of traders who are already improving their performance with TradingJournal
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>&copy; 2024 TradingJournal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}