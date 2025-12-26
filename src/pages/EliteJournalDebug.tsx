// XAUUSD ELITE TRADING JOURNAL — DEBUG VERIFICATION PAGE
// Temporary page to verify database & hook implementation

import { useEliteTrades } from '@/hooks/useEliteTrades';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Database, Code, Layers } from 'lucide-react';

const EliteJournalDebug = () => {
  const { user } = useAuth();
  const { trades, stats, loading } = useEliteTrades();

  const verificationItems = [
    {
      name: 'trades_v2_elite table',
      status: 'implemented',
      location: 'Supabase Database',
      details: 'Created via migration with all ENUM types and RLS policies',
    },
    {
      name: 'trades_v2_elite_stats view',
      status: 'implemented',
      location: 'Supabase Database',
      details: 'Session/setup/news/rules-followed breakdowns, SECURITY INVOKER',
    },
    {
      name: 'EliteTrade TypeScript types',
      status: 'implemented',
      location: 'src/types/eliteTrade.ts',
      details: 'Full type definitions + dropdown option constants',
    },
    {
      name: 'useEliteTrades hook',
      status: 'implemented',
      location: 'src/hooks/useEliteTrades.ts',
      details: 'CRUD operations, filtering, stats fetching, legacy trade helpers',
    },
  ];

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Elite Journal — Foundation Verification
          </h1>
        </div>

        {/* Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Implementation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {verificationItems.map((item) => (
              <div
                key={item.name}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.location}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.details}
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Data Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Live Data from trades_v2_elite
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span>Not authenticated. Please log in to view trades.</span>
              </div>
            ) : loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No trades in trades_v2_elite table yet.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Database connection is working. Table is empty.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Session</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Setup</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Result</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Classification</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b border-border/50">
                        <td className="p-2 text-foreground">{trade.trade_date}</td>
                        <td className="p-2">
                          <Badge variant="secondary">{trade.session}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{trade.setup_type}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              trade.result === 'Win'
                                ? 'default'
                                : trade.result === 'Loss'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {trade.result || 'Open'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              trade.classification_status === 'fully_classified'
                                ? 'default'
                                : trade.classification_status === 'legacy_unclassified'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {trade.classification_status}
                          </Badge>
                        </td>
                        <td className="p-2 font-mono text-xs text-muted-foreground">
                          {trade.id.slice(0, 8)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Check */}
        <Card>
          <CardHeader>
            <CardTitle>Stats from trades_v2_elite_stats View</CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span>Not authenticated.</span>
              </div>
            ) : loading ? (
              <Skeleton className="h-24 w-full" />
            ) : !stats ? (
              <div className="text-muted-foreground">
                No stats available (no fully_classified trades yet).
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Trade Count</div>
                  <div className="text-xl font-bold text-foreground">{stats.trade_count}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                  <div className="text-xl font-bold text-foreground">
                    {stats.win_rate ? `${(stats.win_rate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Total R</div>
                  <div className="text-xl font-bold text-foreground">
                    {stats.total_r?.toFixed(2) || '0'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground">Avg R Multiple</div>
                  <div className="text-xl font-bold text-foreground">
                    {stats.avg_r_multiple?.toFixed(2) || 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Breakdown */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Session Win Rate Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xs text-muted-foreground">Asia</div>
                  <div className="text-lg font-bold text-foreground">
                    {stats.asia_win_rate ? `${(stats.asia_win_rate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xs text-muted-foreground">London</div>
                  <div className="text-lg font-bold text-foreground">
                    {stats.london_win_rate ? `${(stats.london_win_rate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-xs text-muted-foreground">NY</div>
                  <div className="text-lg font-bold text-foreground">
                    {stats.ny_win_rate ? `${(stats.ny_win_rate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground py-4">
          This is a temporary debug view. The Elite Journal UI will be built once foundation is verified.
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default EliteJournalDebug;
