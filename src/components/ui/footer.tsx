import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

export function FullFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-card border-t border-border rounded-none">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">About Us</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Master Trader AI empowers traders with cutting-edge AI insights and comprehensive analytics.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Resources</h3>
            <div className="space-y-2">
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              <Link to="/affiliate" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Affiliate Program</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Legal</h3>
            <div className="space-y-2">
              <Link to="/privacy-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/disclaimer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Newsletter</h3>
            <div className="flex gap-2">
              <Input type="email" placeholder="Enter email" className="flex-1" />
              <Button size="sm"><Mail className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© {currentYear} Master Trader AI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function MiniFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {currentYear} Master Trader AI</p>
          <div className="flex gap-4 text-sm">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
