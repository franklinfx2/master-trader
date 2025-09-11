import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { trades, stats, loading } = useTrades();
  const { profile } = useProfile();

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 p-2">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="space-y-4 text-white">
              <h1 className="text-4xl md:text-5xl font-bold">
                Welcome back, Trader! 
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                Track your performance, analyze your trades, and maximize your trading potential with our premium analytics suite.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
              <Link to="/trades">
                <Button variant="premium" size="lg" className="w-full sm:w-auto shadow-powerful">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Trade
                </Button>
              </Link>
              <Link to="/analyze">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Premium Plan Notice */}
        {profile?.plan === 'free' && trades.length >= 20 && (
          <Card className="card-premium border-violet/20 bg-violet/5">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-violet/10 text-violet">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-violet font-semibold text-lg">
                      You've reached the 20 trade limit
                    </p>
                    <p className="text-muted-foreground">
                      Unlock unlimited trades, advanced analytics, and premium features with Pro.
                    </p>
                  </div>
                </div>
                <Link to="/settings">
                  <Button variant="premium" size="lg" className="w-full sm:w-auto shadow-premium">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="card-premium group hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
              <div className="p-2 rounded-lg bg-violet/10 group-hover:bg-violet/20 transition-colors">
                <BarChart3 className="h-5 w-5 text-violet" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet mb-1">{stats?.trade_count || 0}</div>
              <p className="text-sm text-muted-foreground">
                {profile?.plan === 'free' ? `${20 - (stats?.trade_count || 0)} remaining` : 'Unlimited'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium group hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <div className="p-2 rounded-lg bg-profit/10 group-hover:bg-profit/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-profit" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-profit mb-1">
                {stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : '0%'}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.win_rate && stats.win_rate > 50 ? 'Above average 🎯' : 'Keep improving 📈'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium group hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk:Reward</CardTitle>
              <div className="p-2 rounded-lg bg-violet/10 group-hover:bg-violet/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-violet" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet mb-1">
                {stats?.avg_rr ? `1:${stats.avg_rr.toFixed(2)}` : '1:0'}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.avg_rr && stats.avg_rr > 2 ? 'Excellent ratio ⭐' : 'Aim for 1:2+ 🎯'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium group hover:scale-105 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
              <div className={`p-2 rounded-lg transition-colors ${
                (stats?.total_pnl || 0) >= 0 
                  ? 'bg-profit/10 group-hover:bg-profit/20' 
                  : 'bg-loss/10 group-hover:bg-loss/20'
              }`}>
                <DollarSign className={`h-5 w-5 ${(stats?.total_pnl || 0) >= 0 ? 'text-profit' : 'text-loss'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 ${
                (stats?.total_pnl || 0) >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {stats?.total_pnl ? formatCurrency(stats.total_pnl) : '$0.00'}
              </div>
              <p className="text-sm text-muted-foreground">
                {(stats?.total_pnl || 0) >= 0 ? 'Profitable 💰' : 'Work on strategy 📚'}
              </p>
            </CardContent>
          </Card>
        </div>

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