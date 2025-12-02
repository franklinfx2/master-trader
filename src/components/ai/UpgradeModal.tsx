import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Rocket, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason?: 'credits' | 'speed' | 'features';
}

export const UpgradeModal = ({ open, onClose, reason = 'credits' }: UpgradeModalProps) => {
  const getMessage = () => {
    switch (reason) {
      case 'credits':
        return "You've run out of AI credits! Upgrade to get more credits and continue using AI features.";
      case 'speed':
        return "Upgrade for faster AI responses and priority processing!";
      case 'features':
        return "Unlock advanced features and unlimited AI access!";
      default:
        return "Upgrade to unlock more features!";
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: Sparkles,
      features: [
        '20 AI credits/month',
        'Slow AI responses',
        'Basic analytics',
        'Branding included',
        'Usage cooldown',
      ],
      limitations: [
        'Limited AI access',
        'No exports',
        'No advanced features',
      ],
      cta: 'Current Plan',
      variant: 'outline' as const,
      disabled: true,
    },
    {
      name: 'Go',
      price: '$5.99',
      period: 'per month',
      icon: Zap,
      badge: 'Recommended',
      features: [
        '200 AI credits/month',
        'Fast AI responses',
        'No branding',
        'Advanced analytics',
        'Strategy tagging',
        'CSV/PDF export',
        'No cooldown',
        'Multi-device sync',
      ],
      cta: 'Upgrade to Go',
      variant: 'default' as const,
      highlight: true,
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      icon: Rocket,
      features: [
        '∞ Unlimited AI credits',
        'Fastest priority AI',
        'Everything in Go',
        'Deep analytics',
        'Weekly AI reports',
        'Full export options',
        'Priority support',
        'Future AI tools',
      ],
      cta: 'Upgrade to Pro',
      variant: 'premium' as const,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {reason === 'credits' ? '🚀 Upgrade to Continue' : '⚡ Unlock Premium Features'}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.highlight
                    ? 'border-2 border-primary shadow-lg scale-105'
                    : 'border'
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/settings?tab=billing" className="block" onClick={onClose}>
                    <Button
                      className="w-full"
                      variant={plan.variant}
                      disabled={plan.disabled}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            All plans include secure payments, instant activation, and cancel anytime. Need help?{' '}
            <Link to="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
