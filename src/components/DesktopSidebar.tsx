import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  LogOut,
  Crown,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  onNavigate?: () => void;
}

export const DesktopSidebar = ({ onNavigate }: DesktopSidebarProps) => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const isOwner = profile?.role === 'owner';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', href: '/trades', icon: TrendingUp },
    { name: 'Analyze', href: '/analyze', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const eliteNavigation = isOwner ? [
    { name: 'Elite Journal', href: '/elite-trades', icon: Crown },
    { name: 'Elite Analytics', href: '/elite-analytics', icon: LineChart },
  ] : [];

  return (
    <div className="w-72 glass-card border-r border-border flex flex-col h-screen sticky top-0 rounded-none overflow-hidden">
      {/* Logo Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-[hsl(262,83%,58%)]" />
        <div className="relative z-10 flex items-center px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Master Trader
              <span className="text-white/90 font-light"> AI</span>
            </h1>
            <p className="text-sm text-white/80 font-medium">Advanced Trading Journal</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-[16px] transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(77,139,255,0.25)]"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/8"
              )}
              onClick={onNavigate}
            >
              <div className={cn(
                "p-2 rounded-[12px] mr-3 transition-colors",
                isActive 
                  ? "bg-white/20" 
                  : "bg-transparent group-hover:bg-primary/10"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* Elite Navigation - Owner Only */}
        {eliteNavigation.length > 0 && (
          <>
            <div className="my-4 border-t border-border/50" />
            {eliteNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-[16px] transition-all duration-200",
                    isActive
                      ? "bg-amber-500 text-white shadow-[0_4px_15px_rgba(245,158,11,0.3)]"
                      : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                  )}
                  onClick={onNavigate}
                >
                  <div className={cn(
                    "p-2 rounded-[12px] mr-3 transition-colors",
                    isActive 
                      ? "bg-white/20" 
                      : "bg-transparent group-hover:bg-amber-500/10"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
