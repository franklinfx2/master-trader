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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Filter Trades</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Trading Session</Label>
              <Select value={filters.session} onValueChange={(value) => handleFilterChange('session', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                  <SelectItem value="newyork">New York</SelectItem>
                  <SelectItem value="sydney">Sydney</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currency Pair</Label>
              <Select value={filters.pair} onValueChange={(value) => handleFilterChange('pair', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All pairs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pairs</SelectItem>
                  {uniquePairs.map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={filters.direction} onValueChange={(value) => handleFilterChange('direction', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Result</Label>
              <Select value={filters.result} onValueChange={(value) => handleFilterChange('result', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="be">Break Even</SelectItem>
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
