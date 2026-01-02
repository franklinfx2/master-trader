import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEliteTrades } from '@/hooks/useEliteTrades';
import { useSetupTypes } from '@/hooks/useSetupTypes';
import StrategyValidationSection from '@/components/analytics/StrategyValidationSection';
import { SetupEdgeScoreSection } from '@/components/analytics/SetupEdgeScoreSection';
import { SessionDominanceSection } from '@/components/analytics/SessionDominanceSection';
import { TimeDominanceSection } from '@/components/analytics/TimeDominanceSection';
import { DayOfWeekDominanceSection } from '@/components/analytics/DayOfWeekDominanceSection';
import { SampleSizeConfidenceSection } from '@/components/analytics/SampleSizeConfidenceSection';
import { MistakePatternSection } from '@/components/analytics/MistakePatternSection';
import { EntryPrecisionSection } from '@/components/analytics/EntryPrecisionSection';
import { EdgeDriftSection } from '@/components/analytics/EdgeDriftSection';

type DateRange = '30' | '90' | 'all';
type SessionFilter = 'LN' | 'NY' | 'all';

export default function EliteAnalytics() {
  const navigate = useNavigate();
  const { trades, loading } = useEliteTrades();
  const { activeSetupTypes } = useSetupTypes();
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [selectedSetups, setSelectedSetups] = useState<string[]>([]);
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');
  const [activeSetup, setActiveSetup] = useState<string | null>(null);

  const toggleSetup = (setup: string) => {
    setSelectedSetups(prev =>
      prev.includes(setup)
        ? prev.filter(s => s !== setup)
        : [...prev, setup]
    );
  };

  const handleSetupClick = (setup: string) => {
    setActiveSetup(prev => prev === setup ? null : setup);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            {/* Left: Title & Subtitle */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Elite Analytics
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Data-backed edge. No opinions.
                </p>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Date Range Selector */}
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-[100px] h-9 text-sm bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              {/* Setup Filter (Multi-select) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-sm bg-card border-border">
                    Setup {selectedSetups.length > 0 && `(${selectedSetups.length})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {activeSetupTypes.map((setup) => (
                    <DropdownMenuCheckboxItem
                      key={setup.id}
                      checked={selectedSetups.includes(setup.code)}
                      onCheckedChange={() => toggleSetup(setup.code)}
                    >
                      {setup.code}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Session Filter */}
              <Select value={sessionFilter} onValueChange={(v) => setSessionFilter(v as SessionFilter)}>
                <SelectTrigger className="w-[90px] h-9 text-sm bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="LN">London</SelectItem>
                  <SelectItem value="NY">NY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">Loading analytics...</p>
          </div>
        ) : (
          <>
            <StrategyValidationSection
              trades={trades}
              dateRange={{ from: new Date(Date.now() - (dateRange === '30' ? 30 : dateRange === '90' ? 90 : 3650) * 24 * 60 * 60 * 1000), to: new Date() }}
            />
            <div className="mt-6">
              <SetupEdgeScoreSection
                trades={trades}
                dateRange={dateRange}
                selectedSetups={selectedSetups}
                sessionFilter={sessionFilter}
                activeSetup={activeSetup}
                onSetupClick={handleSetupClick}
              />
            </div>
            <SessionDominanceSection
              trades={trades}
              dateRange={dateRange}
              selectedSetups={selectedSetups}
              sessionFilter={sessionFilter}
              activeSetup={activeSetup}
            />
            <TimeDominanceSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />
            <DayOfWeekDominanceSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />
            <SampleSizeConfidenceSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />
            <MistakePatternSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />
            <EntryPrecisionSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />
            <EdgeDriftSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />
          </>
        )}
      </main>
    </div>
  );
}
