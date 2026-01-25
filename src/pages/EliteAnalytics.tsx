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
import { useExecutedTrades } from '@/hooks/useExecutedTrades';

// Analytics Components
import { EliteCommandCenter } from '@/components/analytics/EliteCommandCenter';
import { EliteAITradingRules } from '@/components/analytics/EliteAITradingRules';
import { SetupQualityMatrix } from '@/components/analytics/SetupQualityMatrix';
import { ConditionImpactAnalysis } from '@/components/analytics/ConditionImpactAnalysis';
import { SetupEdgeScoreSection } from '@/components/analytics/SetupEdgeScoreSection';
import { SessionDominanceSection } from '@/components/analytics/SessionDominanceSection';
import { TimeDominanceSection } from '@/components/analytics/TimeDominanceSection';
import { DayOfWeekDominanceSection } from '@/components/analytics/DayOfWeekDominanceSection';
import { DisciplineAnalytics } from '@/components/analytics/DisciplineAnalytics';
import { MistakePatternSection } from '@/components/analytics/MistakePatternSection';
import { EntryPrecisionSection } from '@/components/analytics/EntryPrecisionSection';
import { EdgeDriftSection } from '@/components/analytics/EdgeDriftSection';
import { SampleSizeConfidenceSection } from '@/components/analytics/SampleSizeConfidenceSection';
import { EliteEdgeSummary } from '@/components/analytics/EliteEdgeSummary';

type DateRange = '30' | '90' | 'all';
type SessionFilter = 'LN' | 'NY' | 'all';

export default function EliteAnalytics() {
  const navigate = useNavigate();
  const { trades, loading } = useEliteTrades();
  const { activeSetupTypes } = useSetupTypes();
  // Filter out missed trades - they should NEVER affect performance analytics
  const { executedTrades, missedCount } = useExecutedTrades(trades);
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
                  Decision Intelligence Dashboard — Data from Elite Trades only
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
            {/* Data Health Indicator */}
            {missedCount > 0 && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <p className="text-sm text-amber-400">
                  {missedCount} missed trade{missedCount > 1 ? 's' : ''} excluded from performance analytics (included in frequency data).
                </p>
              </div>
            )}

            {/* 1. Elite Performance Command Center */}
            <EliteCommandCenter
              trades={executedTrades}
              dateRange={dateRange}
              selectedSetups={selectedSetups}
              sessionFilter={sessionFilter}
            />

            {/* 2. AI Rules Panel */}
            <div className="mt-8">
              <EliteAITradingRules trades={executedTrades} dateRange={dateRange} />
            </div>

            {/* 3. Setup Quality Matrix */}
            <SetupQualityMatrix
              trades={executedTrades}
              dateRange={dateRange}
              selectedSetups={selectedSetups}
              sessionFilter={sessionFilter}
            />

            {/* 4. Condition Impact Analysis */}
            <ConditionImpactAnalysis
              trades={executedTrades}
              dateRange={dateRange}
              selectedSetups={selectedSetups}
              sessionFilter={sessionFilter}
            />

            {/* 5. Setup Edge Score */}
            <div className="mt-8">
              <SetupEdgeScoreSection
                trades={executedTrades}
                dateRange={dateRange}
                selectedSetups={selectedSetups}
                sessionFilter={sessionFilter}
                activeSetup={activeSetup}
                onSetupClick={handleSetupClick}
              />
            </div>

            {/* 6. Session Dominance */}
            <SessionDominanceSection
              trades={trades}
              dateRange={dateRange}
              selectedSetups={selectedSetups}
              sessionFilter={sessionFilter}
              activeSetup={activeSetup}
            />

            {/* 7. Time Dominance */}
            <TimeDominanceSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />

            {/* 8. Day of Week Dominance */}
            <DayOfWeekDominanceSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />

            {/* 9. Discipline & Psychology Analytics */}
            <DisciplineAnalytics
              trades={executedTrades}
              dateRange={dateRange}
              selectedSetups={selectedSetups}
              sessionFilter={sessionFilter}
            />

            {/* 10. Mistake Pattern Section */}
            <MistakePatternSection
              trades={executedTrades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />

            {/* 11. Entry Precision */}
            <EntryPrecisionSection
              trades={executedTrades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />

            {/* 12. Edge Drift */}
            <EdgeDriftSection
              trades={executedTrades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />

            {/* 13. Sample Size Confidence */}
            <SampleSizeConfidenceSection
              trades={trades}
              dateRange={dateRange}
              activeSetup={activeSetup}
            />

            {/* 14. Elite Edge Summary (Trading Operating System) */}
            <EliteEdgeSummary
              trades={executedTrades}
              dateRange={dateRange}
            />
          </>
        )}
      </main>
    </div>
  );
}
