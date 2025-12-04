import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileBottomNav = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Trades', href: '/trades', icon: TrendingUp },
    { name: 'Analyze', href: '/analyze', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="glass-card border-t border-border backdrop-blur-md rounded-none rounded-t-[24px]">
        <div className="grid grid-cols-4 gap-1 p-2 pb-safe">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center p-3 rounded-[16px] transition-all duration-200 text-xs font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(77,139,255,0.25)]"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/8"
                )}
              >
                <item.icon className={cn(
                  "mb-1 transition-transform",
                  isActive ? "w-6 h-6" : "w-5 h-5"
                )} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
