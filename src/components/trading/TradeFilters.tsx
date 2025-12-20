import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter, X } from 'lucide-react';
import { Trade } from '@/hooks/useTrades';

interface TradeFiltersProps {
  trades: Trade[];
  onFilterChange: (filteredTrades: Trade[]) => void;
}

export function TradeFilters({ trades, onFilterChange }: TradeFiltersProps) {
  const [filters, setFilters] = useState({
    session: 'all',
    pair: 'all',
    direction: 'all',
    result: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = (newFilters = filters) => {
    let filtered = [...trades];

    // Date range filter
    if (newFilters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.executed_at) >= new Date(newFilters.dateFrom));
    }
    if (newFilters.dateTo) {
      filtered = filtered.filter(t => new Date(t.executed_at) <= new Date(newFilters.dateTo));
    }

    // Session filter
    if (newFilters.session !== 'all') {
      filtered = filtered.filter(t => {
        const hour = new Date(t.executed_at).getHours();
        let session = 'other';
        
        if (hour >= 0 && hour < 8) session = 'asian';
        else if (hour >= 8 && hour < 12) session = 'london';
        else if (hour >= 12 && hour < 20) session = 'newyork';
        else if (hour >= 20 && hour < 24) session = 'sydney';
        
        return session === newFilters.session;
      });
    }

    // Other filters
    if (newFilters.pair !== 'all') {
      filtered = filtered.filter(t => t.pair === newFilters.pair);
    }
    if (newFilters.direction !== 'all') {
      filtered = filtered.filter(t => t.direction === newFilters.direction);
    }
    if (newFilters.result !== 'all') {
      filtered = filtered.filter(t => t.result === newFilters.result);
    }

    onFilterChange(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      session: 'all',
      pair: 'all',
      direction: 'all',
      result: 'all',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
  };

  const uniquePairs = [...new Set(trades.map(t => t.pair))];
  const hasActiveFilters = Object.values(filters).some(v => v !== 'all' && v !== '');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <CardTitle className="text-sm sm:text-base truncate">Filter Trades</CardTitle>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm">
                <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="h-8 text-xs sm:h-9 sm:text-sm"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="h-8 text-xs sm:h-9 sm:text-sm"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Session</Label>
              <Select value={filters.session} onValueChange={(value) => handleFilterChange('session', value)}>
                <SelectTrigger className="h-8 text-xs sm:h-9 sm:text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                  <SelectItem value="newyork">NY</SelectItem>
                  <SelectItem value="sydney">Sydney</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Pair</Label>
              <Select value={filters.pair} onValueChange={(value) => handleFilterChange('pair', value)}>
                <SelectTrigger className="h-8 text-xs sm:h-9 sm:text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {uniquePairs.map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Direction</Label>
              <Select value={filters.direction} onValueChange={(value) => handleFilterChange('direction', value)}>
                <SelectTrigger className="h-8 text-xs sm:h-9 sm:text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Result</Label>
              <Select value={filters.result} onValueChange={(value) => handleFilterChange('result', value)}>
                <SelectTrigger className="h-8 text-xs sm:h-9 sm:text-sm">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="be">BE</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
