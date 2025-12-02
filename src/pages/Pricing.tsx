import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Zap, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

export default function Pricing() {
  const { profile } = useProfile();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out Master Trader',
      icon: Sparkles,
      features: [
        { text: '20 AI credits per month', included: true },
        { text: 'Slow AI response speed', included: true },
        { text: 'Basic trade tracking', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Usage cooldown between requests', included: true },
        { text: 'Branding included', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Export options', included: false },
        { text: 'Multi-device sync', included: false },
      ],
      cta: profile?.plan === 'free' ? 'Current Plan' : 'Downgrade',
      ctaLink: '/settings?tab=billing',
      current: profile?.plan === 'free',
    },
    {
      name: 'Go',
      price: '$5.99',
      period: 'per month',
      description: 'Best value for active traders',
      icon: Zap,
      badge: 'Recommended',
      highlight: true,
      features: [
        { text: '200 AI credits per month', included: true },
        { text: 'Fast AI responses', included: true },
        { text: 'No branding', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Strategy tagging', included: true },
        { text: 'CSV/PDF export', included: true },
        { text: 'No cooldown', included: true },
        { text: 'Multi-device sync', included: true },
        { text: 'Weekly AI reports', included: false },
      ],
      cta: profile?.plan === 'go' ? 'Current Plan' : 'Upgrade to Go',
      ctaLink: '/settings?tab=billing',
      current: profile?.plan === 'go',
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For serious traders who want it all',
      icon: Rocket,
      features: [
        { text: 'Unlimited AI credits', included: true },
        { text: 'Fastest priority AI responses', included: true },
        { text: 'Everything in Go', included: true },
        { text: 'Deep analytics (expectancy, R-multiple)', included: true },
        { text: 'Weekly AI performance reports', included: true },
        { text: 'Full export options (Excel, PDF, CSV)', included: true },
        { text: 'Backup + priority sync', included: true },
        { text: 'Access to future premium AI tools', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: profile?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaLink: '/settings?tab=billing',
      current: profile?.plan === 'pro',
    },
  ];

  return (
    <Layout>
      <div className="container-responsive section-responsive animate-fade-in space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-violet">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-driven trading insights. Start free, upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlight
                    ? 'border-2 border-primary shadow-2xl md:scale-105'
                    : 'border'
                } ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
                    {plan.badge}
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    Active
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? '' : 'text-muted-foreground line-through'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link to={plan.ctaLink} className="block">
                    <Button
                      className="w-full"
                      variant={plan.highlight ? 'default' : plan.current ? 'outline' : 'outline'}
                      disabled={plan.current}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Detailed Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">Free</th>
                    <th className="text-center py-4 px-4 bg-primary/5">Go</th>
                    <th className="text-center py-4 px-4">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-4">AI Credits per Month</td>
                    <td className="text-center py-4 px-4">20</td>
                    <td className="text-center py-4 px-4 bg-primary/5">200</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">AI Response Speed</td>
                    <td className="text-center py-4 px-4">Slow</td>
                    <td className="text-center py-4 px-4 bg-primary/5">Fast</td>
                    <td className="text-center py-4 px-4">Fastest</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Branding</td>
                    <td className="text-center py-4 px-4">Included</td>
                    <td className="text-center py-4 px-4 bg-primary/5">Removed</td>
                    <td className="text-center py-4 px-4">Removed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Export Options</td>
                    <td className="text-center py-4 px-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-4 px-4 bg-primary/5">CSV/PDF</td>
                    <td className="text-center py-4 px-4">All formats</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Advanced Analytics</td>
                    <td className="text-center py-4 px-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
                    <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Weekly AI Reports</td>
                    <td className="text-center py-4 px-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-4 px-4 bg-primary/5"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-4 px-4"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-4">Multi-Device Sync</td>
                    <td className="text-center py-4 px-4"><X className="w-5 h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-4 px-4 bg-primary/5"><Check className="w-5 h-5 mx-auto text-green-500" /></td>
                    <td className="text-center py-4 px-4">Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">What are AI credits?</h3>
              <p className="text-muted-foreground">
                AI credits are used each time you use an AI feature like the AI Mentor or AI Co-Pro
                Analyzer. Each request typically uses 1-3 credits depending on complexity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time from your settings. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What happens when I run out of credits?</h3>
              <p className="text-muted-foreground">
                You'll need to wait until your credits reset next month, or upgrade to a plan with
                more credits. Pro users get unlimited credits.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do unused credits roll over?</h3>
              <p className="text-muted-foreground">
                No, credits reset at the beginning of each billing cycle and don't carry over to the
                next month.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
