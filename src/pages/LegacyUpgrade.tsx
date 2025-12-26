// XAUUSD ELITE TRADING JOURNAL — Legacy Trade Upgrade Page
// One legacy trade at a time, excludes legacy trades from analytics until fully_classified
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Inbox } from 'lucide-react';

import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

import { LegacyTradeUpgradeForm } from '@/components/elite-journal/LegacyTradeUpgradeForm';
import { useEliteTrades } from '@/hooks/useEliteTrades';
import { EliteTrade } from '@/types/eliteTrade';

const LegacyUpgrade = () => {
  const { getLegacyTrades, fetchTrades } = useEliteTrades();
  const [legacyTrades, setLegacyTrades] = useState<EliteTrade[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgradedCount, setUpgradedCount] = useState(0);

  const fetchLegacy = async () => {
    setLoading(true);
    const trades = await getLegacyTrades();
    setLegacyTrades(trades);
    setCurrentIndex(0);
    setLoading(false);
  };

  useEffect(() => {
    fetchLegacy();
  }, []);

  const handleSuccess = () => {
    setUpgradedCount(prev => prev + 1);
    
    // Move to next trade or refresh list
    if (currentIndex < legacyTrades.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Last trade upgraded, refresh list
      fetchLegacy();
    }
    
    // Refresh main trades list
    fetchTrades();
  };

  const handleSkip = () => {
    if (currentIndex < legacyTrades.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // No more trades to skip to
      fetchLegacy();
    }
  };

  const currentTrade = legacyTrades[currentIndex];
  const progressPercentage = legacyTrades.length > 0 
    ? Math.round((upgradedCount / (upgradedCount + legacyTrades.length)) * 100)
    : 100;

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/elite-trades">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Legacy Trade Upgrade</h1>
              <p className="text-muted-foreground text-sm">
                Upgrade unclassified trades to full Elite Journal format
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLegacy} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Session Progress</Badge>
                <span className="text-sm text-muted-foreground">
                  {upgradedCount} upgraded this session
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Remaining:</span>
                <Badge variant="secondary">{legacyTrades.length}</Badge>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Legacy Trades Are Excluded from Analytics</AlertTitle>
          <AlertDescription>
            Until a trade is fully classified with all required fields and screenshots, 
            it will not be included in your Elite Journal analytics. This ensures data integrity.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : legacyTrades.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-profit mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground mb-6">
                No legacy trades requiring upgrade. All your trades are fully classified.
              </p>
              {upgradedCount > 0 && (
                <p className="text-sm text-profit mb-4">
                  You upgraded {upgradedCount} trade{upgradedCount !== 1 ? 's' : ''} this session!
                </p>
              )}
              <div className="flex items-center justify-center gap-3">
                <Link to="/elite-trades">
                  <Button>View Elite Trades</Button>
                </Link>
                <Link to="/elite-trade-entry">
                  <Button variant="outline">Log New Trade</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : currentTrade ? (
          <LegacyTradeUpgradeForm
            trade={currentTrade}
            onSuccess={handleSuccess}
            onSkip={handleSkip}
            currentIndex={currentIndex}
            totalCount={legacyTrades.length}
          />
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <Inbox className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No trade selected</h3>
              <Button onClick={fetchLegacy}>Refresh List</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default LegacyUpgrade;
