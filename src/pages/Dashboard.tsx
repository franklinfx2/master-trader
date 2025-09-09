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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back! Here's your trading overview.
            </p>
          </div>
          <Link to="/trades">
            <Button className="btn-gradient shadow-soft">
              <Plus className="w-4 h-4 mr-2" />
              Add Trade
            </Button>
          </Link>
        </div>

        {/* Plan Notice */}
        {profile?.plan === 'free' && trades.length >= 20 && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      You've reached the 20 trade limit on the free plan.
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 text-sm">
                      Upgrade to Pro for unlimited trades and advanced features.
                    </p>
                  </div>
                </div>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="interactive-scale">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-enhanced glow-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.trade_count || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {profile?.plan === 'free' ? `${20 - (stats?.trade_count || 0)} remaining` : 'Unlimited'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced glow-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-profit" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-profit">
                {stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.win_rate && stats.win_rate > 50 ? 'Above average' : 'Keep improving'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced glow-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Risk:Reward</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats?.avg_rr ? `1:${stats.avg_rr.toFixed(2)}` : '1:0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.avg_rr && stats.avg_rr > 2 ? 'Excellent ratio' : 'Aim for 1:2+'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced glow-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
              <DollarSign className={`h-5 w-5 ${(stats?.total_pnl || 0) >= 0 ? 'text-profit' : 'text-loss'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                (stats?.total_pnl || 0) >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {stats?.total_pnl ? formatCurrency(stats.total_pnl) : '$0.00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(stats?.total_pnl || 0) >= 0 ? 'Profitable' : 'Work on strategy'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Trades</CardTitle>
                <CardDescription>Your last 5 trades performance</CardDescription>
              </div>
              <Link to="/trades">
                <Button variant="outline" size="sm" className="interactive-scale">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-muted-foreground mb-6 text-lg">No trades yet</p>
                <Link to="/trades">
                  <Button className="btn-gradient shadow-soft">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Trade
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg transition-smooth hover:shadow-soft interactive-scale">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        trade.direction === 'long' 
                          ? 'status-profit' 
                          : 'status-loss'
                      }`}>
                        {trade.direction.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{trade.pair}</p>
                        <p className="text-sm text-muted-foreground">
                          Entry: ${trade.entry}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${
                        trade.result === 'win' ? 'text-profit' :
                        trade.result === 'loss' ? 'text-loss' :
                        'text-neutral'
                      }`}>
                        {trade.result === 'open' ? 'OPEN' : 
                         trade.pnl ? formatCurrency(trade.pnl) : '-'}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {trade.result === 'open' ? 'Active Position' : trade.result}
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