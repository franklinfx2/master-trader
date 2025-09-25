import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AIStatusIndicator } from '@/components/ai/AIStatusIndicator';

import { useIsMobile } from '@/hooks/use-mobile';
// import edgeMindLogo from '@/assets/edge-mind-logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', href: '/trades', icon: TrendingUp },
    { name: 'Analyze', href: '/analyze', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 glass-effect border-r border-violet/20 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 keep-transition",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Premium Logo Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-violet opacity-90" />
            <div className="relative z-10 flex items-center px-6 py-6">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Master Trader
                  <span className="text-white/90 font-light"> AI</span>
                </h1>
                <p className="text-sm text-white/80 font-medium">Advanced Trading Journal</p>
              </div>
            </div>
          </div>
          
          {/* Premium Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-violet text-white shadow-premium scale-105"
                      : "text-muted-foreground hover:text-violet hover:bg-violet/10 hover:scale-105"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={cn(
                    "p-2 rounded-lg mr-3 transition-colors",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-transparent group-hover:bg-violet/20"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Premium Sign Out */}
          <div className="p-4 border-t border-violet/20">
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full justify-start border-violet/30 text-violet hover:bg-violet/10 hover:border-violet/50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Desktop Header */}
        <div className="hidden lg:block glass-effect border-b border-violet/20 backdrop-blur-md">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-violet tracking-tight">
                Master Trader <span className="text-violet/80 font-light">AI</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <AIStatusIndicator />
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="border-violet/30 text-violet hover:bg-violet/10"
              >
                <Link to="/settings">Settings</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Mobile header */}
        <div className="lg:hidden glass-effect border-b border-violet/20 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center justify-between p-4 min-h-[64px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-violet hover:bg-violet/10 z-50 relative touch-manipulation touch-target mobile-stable"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-lg font-bold text-violet tracking-tight whitespace-nowrap">
                Master Trader <span className="text-violet/80 font-light">AI</span>
              </h1>
            </div>
            <AIStatusIndicator />
          </div>
        </div>

        {/* Premium Page content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-violet/5 relative">
          <div className={cn(
            "w-full min-h-full",
            isMobile ? "p-4 space-y-4" : "p-6 lg:p-8"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};