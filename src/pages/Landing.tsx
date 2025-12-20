import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Brain, Shield, Zap, CheckCircle, TrendingUp, 
  Target, ArrowRight, Star, Users, Award, Clock,
  ChevronDown, Sparkles, LineChart
} from 'lucide-react';
import { FullFooter } from '@/components/ui/footer';
import { FloatingIceShapes } from '@/components/ui/floating-ice-shapes';
import { useState, useEffect } from 'react';

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// FAQ Accordion Item
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-primary transition-colors"
      >
        <span className="font-medium text-base sm:text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default function Landing() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background w-full overflow-x-hidden">
      <FloatingIceShapes />
      
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LineChart className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gradient">Master Trader AI</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="btn-gradient shadow-soft">
                <span className="hidden sm:inline">Get Started Free</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Problem-focused */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Trading Intelligence
            </Badge>
            
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Stop Losing Money to{' '}
              <span className="text-gradient">Emotional Trading</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Most traders lose because they repeat the same mistakes. Master Trader AI uses artificial intelligence 
              to analyze your trades, identify hidden patterns, and give you the{' '}
              <span className="text-foreground font-medium">data-driven edge</span> you need to win consistently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/auth">
                <Button size="lg" className="btn-gradient shadow-strong w-full sm:w-auto px-8 py-6 text-lg group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-8 py-6 text-lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-profit" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-profit" />
                <span>Set up in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-profit" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16">
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-primary mb-1">
                <AnimatedCounter end={2847} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Active Traders</p>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-profit mb-1">
                <AnimatedCounter end={89} suffix="%" />
              </div>
              <p className="text-sm text-muted-foreground">Report Better Results</p>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-primary mb-1">
                <AnimatedCounter end={156} suffix="K" />
              </div>
              <p className="text-sm text-muted-foreground">Trades Analyzed</p>
            </div>
            <div className="glass-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-bold text-foreground mb-1">
                4.9<span className="text-lg">/5</span>
              </div>
              <div className="flex justify-center gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6">
            Are You Making These Costly Mistakes?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Trading without tracking your performance",
              "Repeating the same losing patterns",
              "No clear data on what actually works for you",
              "Making emotional decisions instead of data-driven ones",
            ].map((mistake, i) => (
              <div key={i} className="flex items-start gap-3 glass-card p-4">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-destructive text-sm font-bold">✕</span>
                </div>
                <p className="text-muted-foreground">{mistake}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-lg text-muted-foreground">
            <span className="text-foreground font-semibold">The solution?</span> A trading journal that actually thinks for you.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">
              Your Unfair Advantage in Trading
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed to transform your trading from guesswork to precision
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Trade Analysis",
                description: "Upload screenshots and get instant AI feedback on your entries, exits, and risk management"
              },
              {
                icon: BarChart3,
                title: "Performance Analytics",
                description: "Track win rates, R:R ratios, P&L curves, and identify your most profitable setups"
              },
              {
                icon: Target,
                title: "Pattern Recognition",
                description: "AI identifies your winning and losing patterns so you can trade smarter"
              },
              {
                icon: Zap,
                title: "Quick Trade Logging",
                description: "Log trades in seconds with smart auto-calculations for P&L and risk metrics"
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Your data is encrypted and never shared. Your strategies stay your secret"
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Daily streaks, monthly goals, and milestone achievements to keep you consistent"
              },
            ].map((feature, i) => (
              <Card key={i} className="glass-card border-0 hover:shadow-hover transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Traders Love Master Trader AI
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Finally found a journal that actually helps me improve. The AI insights showed me I was overtrading on Mondays - something I never noticed.",
                name: "Kwame A.",
                role: "Forex Trader",
                rating: 5
              },
              {
                quote: "The pattern recognition is incredible. It identified that my best setups are during London session, and my win rate improved by 23%.",
                name: "Ama K.",
                role: "Gold Trader",
                rating: 5
              },
              {
                quote: "I was skeptical about AI analysis, but the insights are actually useful. It is like having a trading mentor who reviews every trade.",
                name: "Kofi M.",
                role: "Crypto Trader",
                rating: 5
              },
            ].map((testimonial, i) => (
              <Card key={i} className="glass-card border-0">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient">
              Simple, Transparent Pricing
            </h3>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you are ready
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="glass-card border-0 relative">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-muted-foreground">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-4xl font-bold text-foreground mt-4">
                  $0<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {[
                    "Up to 20 trades",
                    "Basic analytics",
                    "5 AI analyses/month",
                    "Community support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-profit flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Go Plan */}
            <Card className="glass-card border-0 relative">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-primary">Go</CardTitle>
                <CardDescription>For active traders</CardDescription>
                <div className="text-4xl font-bold text-foreground mt-4">
                  ₵75<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {[
                    "Unlimited trades",
                    "Full analytics dashboard",
                    "50 AI analyses/month",
                    "CSV export",
                    "Email support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-profit flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button className="w-full bg-primary/90 hover:bg-primary">Upgrade to Go</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="glass-card border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-primary">Pro</CardTitle>
                <CardDescription>Maximum trading edge</CardDescription>
                <div className="text-4xl font-bold text-foreground mt-4">
                  ₵120<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {[
                    "Everything in Go",
                    "Unlimited AI analyses",
                    "Priority AI responses",
                    "Advanced pattern recognition",
                    "Priority support",
                    "API access"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-profit flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button className="w-full btn-gradient shadow-soft">Upgrade to Pro</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Secure payments via</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">Paystack (GH)</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">Crypto (Global)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h3>
          </div>
          
          <div className="glass-card p-6 sm:p-8">
            <FAQItem 
              question="How does the AI analysis work?"
              answer="Simply upload a screenshot of your trade or enter your trade details. Our AI analyzes your entry, exit, risk management, and compares it against proven trading patterns. You'll get specific feedback on what you did well and what could be improved."
            />
            <FAQItem 
              question="Is my trading data secure?"
              answer="Absolutely. We use bank-level encryption to protect your data. Your trading strategies and performance data are never shared with anyone. You own your data completely."
            />
            <FAQItem 
              question="Can I cancel my subscription anytime?"
              answer="Yes! There are no long-term contracts. You can upgrade, downgrade, or cancel your subscription at any time. If you cancel, you'll still have access until the end of your billing period."
            />
            <FAQItem 
              question="What markets does this work for?"
              answer="Master Trader AI works for any tradeable market - Forex, stocks, crypto, commodities, indices, and more. The AI analysis is designed to help with any type of chart-based trading."
            />
            <FAQItem 
              question="How is this different from other trading journals?"
              answer="Unlike basic spreadsheets or simple journals, Master Trader AI uses artificial intelligence to actively analyze your trades and identify patterns you might miss. It's like having a trading coach who reviews every single trade."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="hero-neural text-center relative z-10">
            <Award className="w-12 h-12 mx-auto mb-6 opacity-90" />
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Trade Smarter?
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of traders who have transformed their trading with data-driven insights. 
              Start your free trial today.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg shadow-strong group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="mt-4 text-sm opacity-80">
              No credit card required • Set up in 2 minutes
            </p>
          </div>
        </div>
      </section>

      <FullFooter />
    </div>
  );
}
