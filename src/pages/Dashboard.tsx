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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your trading overview.
            </p>
          </div>
          <Link to="/trades">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Trade
            </Button>
          </Link>
        </div>

        {/* Plan Notice */}
        {profile?.plan === 'free' && trades.length >= 20 && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="text-amber-600 dark:text-amber-400">
                  ⚠️ You've reached the 20 trade limit on the free plan.
                </div>
                <Link to="/settings">
                  <Button variant="outline" size="sm">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.trade_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : '0%'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk:Reward</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.avg_rr ? `1:${stats.avg_rr.toFixed(2)}` : '1:0'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (stats?.total_pnl || 0) >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {stats?.total_pnl ? formatCurrency(stats.total_pnl) : '$0.00'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Your last 5 trades</CardDescription>
              </div>
              <Link to="/trades">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No trades yet</p>
                <Link to="/trades">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Trade
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.direction === 'long' 
                          ? 'bg-profit/20 text-profit' 
                          : 'bg-loss/20 text-loss'
                      }`}>
                        {trade.direction.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{trade.pair}</p>
                        <p className="text-sm text-muted-foreground">
                          Entry: ${trade.entry}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        trade.result === 'win' ? 'text-profit' :
                        trade.result === 'loss' ? 'text-loss' :
                        'text-neutral'
                      }`}>
                        {trade.result === 'open' ? 'Open' : 
                         trade.pnl ? formatCurrency(trade.pnl) : '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trade.result === 'open' ? 'Active' : trade.result}
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