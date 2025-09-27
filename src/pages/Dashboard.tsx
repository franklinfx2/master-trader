import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { StreakIndicator } from '@/components/streak/StreakIndicator';

export default function Dashboard() {
  const { trades, stats, loading } = useTrades();
  const { profile } = useProfile();
  const isMobile = useIsMobileOrTablet();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const recentTrades = trades.slice(0, 5);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive section-responsive animate-fade-in">
        {/* Premium Hero Section - Fully Responsive */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl animate-scale-in p-4 sm:p-6 lg:p-8 xl:p-12">
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="relative z-10 flex flex-col items-start justify-between space-y-4 sm:space-y-6">
            <div className="flex items-start justify-between w-full">
              <div className="space-y-2 sm:space-y-3 text-white">
                <h1 className="font-bold leading-tight text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                  Welcome back, Trader! 
                  <span className="block text-lg sm:text-xl lg:text-2xl text-blue-100 font-medium mt-2">
                    Your trading insights await
                  </span>
                </h1>
              </div>
              <div className="hidden sm:block">
                <StreakIndicator />
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 text-white">
              <p className={cn(
                "text-white/90 leading-relaxed",
                isMobile ? "text-base" : "text-lg md:text-xl max-w-2xl"
              )}>
                Track your performance, analyze your trades, and maximize your trading potential.
              </p>
            </div>
            <div className={cn(
              "flex gap-3 w-full",
              isMobile ? "flex-col" : "flex-col sm:flex-row"
            )}>
              <Link to="/trades" className={isMobile ? "w-full" : ""}>
                <Button 
                  variant="premium" 
                  size={isMobile ? "default" : "lg"} 
                  className="w-full shadow-powerful transition-transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Trade
                </Button>
              </Link>
              <Link to="/analyze" className={isMobile ? "w-full" : ""}>
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"} 
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-transform hover:scale-105"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Streak Indicator */}
        <div className="sm:hidden mb-4 flex justify-center">
          <StreakIndicator />
        </div>

        {/* Premium Plan Notice - Mobile Optimized */}
        {profile?.plan === 'free' && trades.length >= 20 && (
          <Card className="card-premium border-violet/20 bg-violet/5 animate-slide-up">
            <CardContent className={cn("pt-6", isMobile && "p-4")}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "rounded-xl bg-violet/10 text-violet transition-transform hover:scale-105",
                    isMobile ? "p-2" : "p-3"
                  )}>
                    <TrendingUp className={cn(isMobile ? "w-5 h-5" : "w-6 h-6")} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className={cn(
                      "text-violet font-semibold",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      You've reached the 20 trade limit
                    </p>
                    <p className={cn(
                      "text-muted-foreground",
                      isMobile ? "text-sm" : ""
                    )}>
                      Unlock unlimited trades, advanced analytics, and premium features with Pro.
                    </p>
                  </div>
                </div>
                <Link to="/settings" className="w-full">
                  <Button 
                    variant="premium" 
                    size={isMobile ? "default" : "lg"} 
                    className="w-full shadow-premium transition-transform hover:scale-105"
                  >
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Stats Grid - Mobile Optimized */}
        <div className={cn(
          "grid gap-4 animate-fade-in",
          isMobile ? "grid-cols-1 space-y-2" : "gap-6 sm:grid-cols-2 lg:grid-cols-4"
        )}>
          {/* Mobile: Stack all stats vertically for better readability */}
          <Card className={cn(
            "card-premium transition-all duration-300",
            isMobile ? "hover:shadow-lg" : "group hover:scale-105"
          )}>
            <CardHeader className={cn(
              "flex flex-row items-center justify-between space-y-0",
              isMobile ? "pb-3 p-4" : "pb-3"
            )}>
              <CardTitle className={cn(
                "font-medium text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Total Trades
              </CardTitle>
              <div className={cn(
                "rounded-lg bg-violet/10 group-hover:bg-violet/20 transition-colors",
                isMobile ? "p-1.5" : "p-2"
              )}>
                <BarChart3 className={cn(
                  "text-violet",
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )} />
              </div>
            </CardHeader>
            <CardContent className={cn(isMobile && "px-4 pb-4")}>
              <div className={cn(
                "font-bold text-violet mb-1",
                isMobile ? "text-xl" : "text-3xl"
              )}>
                {stats?.trade_count || 0}
              </div>
              <p className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {profile?.plan === 'free' ? `${20 - (stats?.trade_count || 0)} remaining` : 'Unlimited'}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "card-premium transition-all duration-300",
            isMobile ? "hover:shadow-lg" : "group hover:scale-105"
          )}>
            <CardHeader className={cn(
              "flex flex-row items-center justify-between space-y-0",
              isMobile ? "pb-3 p-4" : "pb-3"
            )}>
              <CardTitle className={cn(
                "font-medium text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Win Rate
              </CardTitle>
              <div className={cn(
                "rounded-lg bg-profit/10 group-hover:bg-profit/20 transition-colors",
                isMobile ? "p-1.5" : "p-2"
              )}>
                <TrendingUp className={cn(
                  "text-profit",
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )} />
              </div>
            </CardHeader>
            <CardContent className={cn(isMobile && "px-4 pb-4")}>
              <div className={cn(
                "font-bold text-profit mb-1",
                isMobile ? "text-xl" : "text-3xl"
              )}>
                {stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : '0%'}
              </div>
              <p className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {stats?.win_rate && stats.win_rate > 50 ? 'Above average 🎯' : 'Keep improving 📈'}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "card-premium transition-all duration-300",
            isMobile ? "hover:shadow-lg" : "group hover:scale-105"
          )}>
            <CardHeader className={cn(
              "flex flex-row items-center justify-between space-y-0",
              isMobile ? "pb-3 p-4" : "pb-3"
            )}>
              <CardTitle className={cn(
                "font-medium text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Risk:Reward
              </CardTitle>
              <div className={cn(
                "rounded-lg bg-violet/10 group-hover:bg-violet/20 transition-colors",
                isMobile ? "p-1.5" : "p-2"
              )}>
                <TrendingUp className={cn(
                  "text-violet",
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )} />
              </div>
            </CardHeader>
            <CardContent className={cn(isMobile && "px-4 pb-4")}>
              <div className={cn(
                "font-bold text-violet mb-1",
                isMobile ? "text-xl" : "text-3xl"
              )}>
                {stats?.avg_rr ? `1:${stats.avg_rr.toFixed(2)}` : '1:0'}
              </div>
              <p className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {stats?.avg_rr && stats.avg_rr > 2 ? 'Excellent ratio ⭐' : 'Aim for 1:2+ 🎯'}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            "card-premium transition-all duration-300",
            isMobile ? "hover:shadow-lg" : "group hover:scale-105"
          )}>
            <CardHeader className={cn(
              "flex flex-row items-center justify-between space-y-0",
              isMobile ? "pb-3 p-4" : "pb-3"
            )}>
              <CardTitle className={cn(
                "font-medium text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Total P&L
              </CardTitle>
              <div className={cn(
                `rounded-lg transition-colors ${
                  (stats?.total_pnl || 0) >= 0 
                    ? 'bg-profit/10 group-hover:bg-profit/20' 
                    : 'bg-loss/10 group-hover:bg-loss/20'
                }`,
                isMobile ? "p-1.5" : "p-2"
              )}>
                <DollarSign className={cn(
                  `${(stats?.total_pnl || 0) >= 0 ? 'text-profit' : 'text-loss'}`,
                  isMobile ? "h-4 w-4" : "h-5 w-5"
                )} />
              </div>
            </CardHeader>
            <CardContent className={cn(isMobile && "px-4 pb-4")}>
              <div className={cn(
                `font-bold mb-1 ${(stats?.total_pnl || 0) >= 0 ? 'text-profit' : 'text-loss'}`,
                isMobile ? "text-xl" : "text-3xl"
              )}>
                {stats?.total_pnl ? formatCurrency(stats.total_pnl) : '$0.00'}
              </div>
              <p className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {(stats?.total_pnl || 0) >= 0 ? 'Profitable 💰' : 'Work on strategy 📚'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pro Plan Highlight Card */}
        <Card className="card-premium border-violet/30 bg-gradient-to-r from-violet/10 via-violet/5 to-violet/10">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className="p-4 rounded-2xl bg-violet text-white shadow-premium">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-violet">Upgrade to Pro - $9/month</h3>
                  <p className="text-muted-foreground text-lg mb-4">
                    Unlock the full power of Master Trader AI with premium features
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full"></div>
                      <span>Advanced analytics & insights</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full"></div>
                      <span>Unlimited trade history</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full"></div>
                      <span>Screenshot uploads</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-violet rounded-full"></div>
                      <span>Premium AI insights</span>
                    </div>
                  </div>
                </div>
              </div>
              <Link to="/settings">
                <Button variant="premium" size="lg" className="w-full lg:w-auto shadow-powerful text-lg px-8 py-4">
                  Start Pro Trial
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Section */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-violet text-center">
              Trusted by Traders Worldwide
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Join thousands of successful traders using Master Trader AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-effect p-6 rounded-xl border border-violet/20">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 text-yellow-400">⭐</div>
                  ))}
                </div>
                <p className="text-sm mb-4 italic">
                  "Master Trader AI completely changed how I track my trades! The insights are incredible."
                </p>
                <p className="text-xs text-muted-foreground font-medium">- Sarah M., Day Trader</p>
              </div>
              <div className="glass-effect p-6 rounded-xl border border-violet/20">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 text-yellow-400">⭐</div>
                  ))}
                </div>
                <p className="text-sm mb-4 italic">
                  "Worth every cent — professional, easy to use, and powerful. Best trading journal I've used."
                </p>
                <p className="text-xs text-muted-foreground font-medium">- Mike R., Forex Trader</p>
              </div>
              <div className="glass-effect p-6 rounded-xl border border-violet/20">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 text-yellow-400">⭐</div>
                  ))}
                </div>
                <p className="text-sm mb-4 italic">
                  "The Pro plan at $9/month feels like a steal for what it offers. Amazing analytics!"
                </p>
                <p className="text-xs text-muted-foreground font-medium">- Alex T., Swing Trader</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Recent Trades */}
        <Card className="card-premium">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-violet">Recent Trades</CardTitle>
                <CardDescription className="text-base">Your latest trading performance at a glance</CardDescription>
              </div>
              <Link to="/trades">
                <Button variant="violet" size="lg" className="w-full sm:w-auto shadow-strong">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View All Trades
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-20 h-20 rounded-full bg-violet/10 flex items-center justify-center mb-6">
                  <BarChart3 className="w-10 h-10 text-violet" />
                </div>
                <h3 className="text-xl font-semibold text-violet mb-2">Start Your Trading Journey</h3>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                  Record your first trade to unlock powerful analytics and performance insights.
                </p>
                <Link to="/trades">
                  <Button variant="premium" size="lg" className="shadow-powerful">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Trade
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="group p-5 border border-border/50 rounded-xl hover:shadow-premium transition-all duration-300 hover:scale-[1.02] glass-effect">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                          trade.direction === 'long' 
                            ? 'bg-profit/10 text-profit border-profit/30 group-hover:bg-profit/20' 
                            : 'bg-loss/10 text-loss border-loss/30 group-hover:bg-loss/20'
                        }`}>
                          {trade.direction.toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-foreground">{trade.pair}</p>
                          <p className="text-sm text-muted-foreground">
                            Entry: <span className="font-medium">${trade.entry}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`font-bold text-xl ${
                          trade.result === 'win' ? 'text-profit' :
                          trade.result === 'loss' ? 'text-loss' :
                          'text-violet'
                        }`}>
                          {trade.result === 'open' ? 'ACTIVE' : 
                           trade.pnl ? formatCurrency(trade.pnl) : '-'}
                        </div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-lg ${
                          trade.result === 'win' ? 'bg-profit/10 text-profit' :
                          trade.result === 'loss' ? 'bg-loss/10 text-loss' :
                          trade.result === 'open' ? 'bg-violet/10 text-violet' :
                          'bg-neutral/10 text-neutral'
                        }`}>
                          {trade.result === 'open' ? 'Active Position' : trade.result.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}