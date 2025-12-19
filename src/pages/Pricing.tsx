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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6 sm:py-8 lg:py-12 animate-fade-in space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-violet">
            Choose Your Perfect Plan
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Unlock the full power of AI-driven trading insights. Start free, upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative isolate ${
                  plan.highlight
                    ? 'border-2 border-primary shadow-2xl z-10'
                    : 'border z-0'
                } ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs">
                    {plan.badge}
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-3 right-4 bg-green-500 text-xs">
                    Active
                  </Badge>
                )}
                <CardHeader className="text-center pb-4 sm:pb-8 p-4 sm:p-6">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl mb-1 sm:mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
                  <div className="mt-4 sm:mt-6">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                        {feature.included ? (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs sm:text-sm ${
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
                      className="w-full text-sm sm:text-base"
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
        <Card className="mt-6 sm:mt-12">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-2xl text-center">Detailed Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium">Feature</th>
                    <th className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium">Free</th>
                    <th className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5 text-xs sm:text-sm font-medium">Go</th>
                    <th className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">AI Credits/Month</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">20</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5 text-xs sm:text-sm">200</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">AI Response Speed</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Slow</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5 text-xs sm:text-sm">Fast</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Fastest</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Branding</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Included</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5 text-xs sm:text-sm">Removed</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Removed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Export Options</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4"><X className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5 text-xs sm:text-sm">CSV/PDF</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">All formats</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Advanced Analytics</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4"><X className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5"><Check className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-green-500" /></td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4"><Check className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-green-500" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Weekly AI Reports</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4"><X className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5"><X className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4"><Check className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-green-500" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Multi-Device Sync</td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4"><X className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-muted-foreground" /></td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 bg-primary/5"><Check className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-green-500" /></td>
                    <td className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm">Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-2xl text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            <div>
              <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">What are AI credits?</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                AI credits are used each time you use an AI feature like the AI Mentor or AI Co-Pro
                Analyzer. Each request typically uses 1-3 credits depending on complexity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">Can I upgrade or downgrade anytime?</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Yes! You can upgrade or downgrade your plan at any time from your settings. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">What happens when I run out of credits?</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                You'll need to wait until your credits reset next month, or upgrade to a plan with
                more credits. Pro users get unlimited credits.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">Do unused credits roll over?</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
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
