// XAUUSD ELITE TRADING JOURNAL — Elite Trades Page
// Displays ONLY fully_classified trades by default
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, RefreshCw, BarChart2 } from 'lucide-react';

import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { EliteTradeCard } from '@/components/elite-journal/EliteTradeCard';
import { useEliteTrades, EliteTradeFilters } from '@/hooks/useEliteTrades';
import {
  SESSIONS,
  SETUP_TYPES,
  SETUP_GRADES,
  YES_NO,
} from '@/types/eliteTrade';

const EliteTrades = () => {
  const { trades, stats, loading, filters, setFilters, fetchTrades } = useEliteTrades();

  // Default to fully_classified only
  useEffect(() => {
    if (!filters.classification_status) {
      setFilters({ ...filters, classification_status: 'fully_classified' });
    }
  }, []);

  const handleFilterChange = (key: keyof EliteTradeFilters, value: string | undefined) => {
    setFilters({ ...filters, [key]: value === 'all' ? undefined : value });
  };

  const clearFilters = () => {
    setFilters({ classification_status: 'fully_classified' });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'classification_status'
  ).length;

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Elite Trades</h1>
            <p className="text-muted-foreground">
              Fully classified XAUUSD trades — your edge refinement database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchTrades()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Link to="/elite-trade-entry">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" /> New Trade
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              label="Total Trades" 
              value={stats.trade_count || 0} 
            />
            <StatCard 
              label="Win Rate" 
              value={`${(stats.win_rate || 0).toFixed(1)}%`}
              subtext={`${stats.wins || 0}W / ${stats.losses || 0}L`}
            />
            <StatCard 
              label="Average R" 
              value={`${(stats.avg_r_multiple || 0).toFixed(2)}R`}
            />
            <StatCard 
              label="Total R" 
              value={`${(stats.total_r || 0).toFixed(2)}R`}
              highlight={Number(stats.total_r) > 0}
            />
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Filters</CardTitle>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount} active</Badge>
                )}
              </div>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <FilterSelect
                label="Session"
                value={filters.session || 'all'}
                options={['all', ...SESSIONS]}
                onChange={(v) => handleFilterChange('session', v)}
              />
              <FilterSelect
                label="Setup Type"
                value={filters.setup_type || 'all'}
                options={['all', ...SETUP_TYPES]}
                onChange={(v) => handleFilterChange('setup_type', v)}
              />
              <FilterSelect
                label="Setup Grade"
                value={filters.setup_grade || 'all'}
                options={['all', ...SETUP_GRADES]}
                onChange={(v) => handleFilterChange('setup_grade', v)}
              />
              <FilterSelect
                label="News Day"
                value={filters.news_day || 'all'}
                options={['all', ...YES_NO]}
                onChange={(v) => handleFilterChange('news_day', v)}
              />
              <FilterSelect
                label="Rules Followed"
                value={filters.rules_followed || 'all'}
                options={['all', ...YES_NO]}
                onChange={(v) => handleFilterChange('rules_followed', v)}
              />
              <FilterSelect
                label="Result"
                value={filters.result || 'all'}
                options={['all', 'Win', 'Loss', 'BE']}
                onChange={(v) => handleFilterChange('result', v)}
              />
              <FilterSelect
                label="Would Take Again"
                value={filters.would_take_again || 'all'}
                options={['all', ...YES_NO]}
                onChange={(v) => handleFilterChange('would_take_again', v)}
              />
              <FilterSelect
                label="Liquidity Taken"
                value={filters.liquidity_taken || 'all'}
                options={['all', ...YES_NO]}
                onChange={(v) => handleFilterChange('liquidity_taken', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trade List */}
        <div className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </>
          ) : trades.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <BarChart2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No trades found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeFilterCount > 0 
                    ? "Try adjusting your filters to see more trades." 
                    : "Start logging your elite trades to build your edge database."}
                </p>
                <Link to="/elite-trade-entry">
                  <Button>
                    <Plus className="w-4 h-4 mr-1" /> Log Your First Trade
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                Showing {trades.length} trade{trades.length !== 1 ? 's' : ''}
              </div>
              {trades.map((trade) => (
                <EliteTradeCard key={trade.id} trade={trade} onUpdate={fetchTrades} />
              ))}
            </>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

// Helper Components
const StatCard = ({ 
  label, 
  value, 
  subtext,
  highlight = false 
}: { 
  label: string; 
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}) => (
  <Card className="glass-card">
    <CardContent className="p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${highlight ? 'text-profit' : ''}`}>
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>
      )}
    </CardContent>
  </Card>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <div>
    <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt === 'all' ? `All ${label}s` : opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default EliteTrades;
