import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Shield, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { FullFooter } from '@/components/ui/footer';


export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-background w-full">{/* Added w-full for proper width */}
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gradient">Master Trader AI</h1>
          </div>
          <div className="space-x-2">
            <Link to="/auth">
              <Button variant="outline" className="interactive-scale">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="btn-gradient shadow-soft">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 gradient-card">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-gradient leading-tight">
            AI-Powered Trading Journal
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Master Trader AI combines advanced AI with powerful analytics to give you the mental edge in trading. 
            Track performance, identify patterns, and make data-driven decisions with cutting-edge insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth">
              <Button size="lg" className="btn-gradient shadow-strong px-8 py-4 text-lg">
                Start Your Journey
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="interactive-scale px-8 py-4 text-lg">
              Watch Demo
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            ✨ Free to start • No credit card required • Join 10,000+ traders
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-gradient">Everything You Need to Succeed</h3>
            <p className="text-xl text-muted-foreground">
              Powerful features designed for serious traders who want consistent profits
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-enhanced glow-effect">
              <CardHeader className="text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <BarChart3 className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Detailed Analytics</CardTitle>
                <CardDescription className="leading-relaxed">
                  Track win rates, risk-reward ratios, and P&L with comprehensive statistics that reveal your trading edge
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-enhanced glow-effect">
              <CardHeader className="text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Brain className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">AI Insights</CardTitle>
                <CardDescription className="leading-relaxed">
                  Get personalized analysis of your trading patterns and actionable improvement suggestions powered by AI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-enhanced glow-effect">
              <CardHeader className="text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Secure & Private</CardTitle>
                <CardDescription className="leading-relaxed">
                  Your trading data is encrypted and secure. We never share your information with anyone, ever
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-enhanced glow-effect">
              <CardHeader className="text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Lightning Fast</CardTitle>
                <CardDescription className="leading-relaxed">
                  Quick trade entry with smart calculations for P&L, risk-reward, and automatic performance tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-enhanced glow-effect">
              <CardHeader className="text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Trade Validation</CardTitle>
                <CardDescription className="leading-relaxed">
                  Validate your setups and maintain discipline with detailed trade logs and strategy analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-enhanced glow-effect">
              <CardHeader className="text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                  <TrendingUp className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Performance Tracking</CardTitle>
                <CardDescription className="leading-relaxed">
                  Monitor your progress over time and identify areas for improvement with advanced metrics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 gradient-card">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-gradient">Simple, Transparent Pricing</h3>
            <p className="text-xl text-muted-foreground">
              Start for free, upgrade when you're ready to unlock your full potential
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-enhanced">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-muted-foreground">Free</CardTitle>
                <CardDescription className="text-lg">Perfect for getting started</CardDescription>
                <div className="text-5xl font-bold text-foreground mt-4">$0</div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">Up to 20 trades</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">Basic analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">AI analysis (weekly)</span>
                  </li>
                </ul>
                <Link to="/auth" className="block mt-8">
                  <Button className="w-full interactive-scale" variant="outline" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative card-enhanced shadow-powerful">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-soft">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl text-primary">Pro</CardTitle>
                <CardDescription className="text-lg">For serious traders</CardDescription>
                <div className="text-5xl font-bold text-foreground mt-4">
                  $9<span className="text-xl font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">Unlimited trades</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">Advanced analytics & insights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">Unlimited AI analysis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">CSV export & reporting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-profit mr-3" />
                    <span className="text-base">Priority support</span>
                  </li>
                </ul>
                <Link to="/auth" className="block mt-8">
                  <Button className="w-full btn-gradient shadow-strong" size="lg">
                    Upgrade to Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Options Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-gradient">Payment Options</h3>
            <p className="text-lg text-muted-foreground">
              We accept local and international payments for fast and secure checkout.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="card-enhanced text-center">
              <CardHeader>
                <CardTitle className="text-xl mb-3">Local Payments</CardTitle>
                <CardDescription className="mb-6">
                  Pay with your local bank account, card, or mobile money
                </CardDescription>
                <Link to="/auth">
                  <Button className="btn-gradient shadow-soft w-full" size="lg">
                    Pay with Paystack
                  </Button>
                </Link>
              </CardHeader>
            </Card>

            <Card className="card-enhanced text-center">
              <CardHeader>
                <CardTitle className="text-xl mb-3">International Payments</CardTitle>
                <CardDescription className="mb-6">
                  Pay with cryptocurrency for fast and secure checkout
                </CardDescription>
                <div className="flex justify-center">
                  <a 
                    href="https://nowpayments.io/payment/?iid=5934808029&source=button" 
                    target="_blank" 
                    rel="noreferrer noopener"
                  >
                    <img 
                      src="https://nowpayments.io/images/embeds/payment-button-white.svg" 
                      alt="Cryptocurrency & Bitcoin payment button by NOWPayments"
                      className="h-12"
                    />
                  </a>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold mb-6 text-primary-foreground">Ready to Improve Your Trading?</h3>
          <p className="text-xl mb-8 text-primary-foreground/90 leading-relaxed">
            Join thousands of traders who are already improving their performance with data-driven insights
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="interactive-scale shadow-strong px-8 py-4 text-lg">
              Start Your Free Trial
            </Button>
          </Link>
          <div className="text-primary-foreground/80 text-sm mt-4">
            🚀 Get started in under 2 minutes
          </div>
        </div>
      </section>

      {/* Footer */}
      <FullFooter />
    </div>
  );
}