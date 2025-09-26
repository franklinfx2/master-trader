import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  onNavigate?: () => void;
}

export const DesktopSidebar = ({ onNavigate }: DesktopSidebarProps) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', href: '/trades', icon: TrendingUp },
    { name: 'Analyze', href: '/analyze', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-72 glass-effect border-r border-violet/20 flex flex-col h-full">
      {/* Logo Header */}
      <div className="relative">
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
      
      {/* Navigation */}
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
              onClick={onNavigate}
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

      {/* Sign Out */}
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
  );
};