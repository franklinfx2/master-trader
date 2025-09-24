import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Journal', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trades', href: '/trades', icon: TrendingUp },
  { name: 'AI', href: '/analyze', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="glass-effect border-t border-violet/20 backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-violet/20 text-violet"
                    : "text-muted-foreground hover:text-violet hover:bg-violet/10"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-violet rounded-full animate-scale-in" />
                )}
                
                {/* Icon with smooth scaling */}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-violet/20 transform scale-110" 
                    : "group-hover:bg-violet/10 group-hover:scale-105"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium mt-1 transition-all duration-200",
                  isActive ? "text-violet font-semibold" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};