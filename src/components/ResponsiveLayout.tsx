import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AIStatusIndicator } from '@/components/ai/AIStatusIndicator';
import { MiniFooter } from '@/components/ui/footer';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
import { MobileBottomNav } from './MobileBottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { FeedbackButton } from './feedback/FeedbackButton';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobileOrTablet();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile/Tablet sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Mobile/Tablet Sidebar */}
      {isMobile && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 glass-effect border-r border-violet/20 transform transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <DesktopSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={cn(
          "glass-effect border-b border-violet/20 backdrop-blur-md",
          isMobile ? "sticky top-0 z-30" : ""
        )}>
          <div className="flex items-center justify-between p-4">
            {isMobile ? (
              // Mobile/Tablet header
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="text-violet hover:bg-violet/10"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <h1 className="text-lg font-bold text-violet tracking-tight whitespace-nowrap">
                    Master Trader <span className="text-violet/80 font-light">AI</span>
                  </h1>
                </div>
                <AIStatusIndicator />
              </>
            ) : (
              // Desktop header
              <>
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-bold text-violet tracking-tight">
                    Master Trader <span className="text-violet/80 font-light">AI</span>
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <AIStatusIndicator />
                  <Button
                    variant="outline"
                    onClick={signOut}
                    className="border-violet/30 text-violet hover:bg-violet/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-violet/5 relative">
            <div className={cn(
              "w-full min-h-full",
              isMobile ? "p-4 space-y-4 pb-20" : "p-6 lg:p-8"
            )}>
              {children}
            </div>
          </main>
          {!isMobile && <MiniFooter />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
      
      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  );
};