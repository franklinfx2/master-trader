import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Target, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DailyRisk {
  id?: string;
  date: string;
  risk_limit: number;
  used_risk: number;
  trades_count: number;
}

const RiskCalculator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dailyRiskLimit, setDailyRiskLimit] = useState<number>(100);
  const [currentRiskUsed, setCurrentRiskUsed] = useState<number>(0);
  const [todaysTrades, setTodaysTrades] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const riskPercentage = dailyRiskLimit > 0 ? (currentRiskUsed / dailyRiskLimit) * 100 : 0;
  const remainingRisk = dailyRiskLimit - currentRiskUsed;

  useEffect(() => {
    if (user) {
      fetchTodaysRiskData();
    }
  }, [user]);

  const fetchTodaysRiskData = async () => {
    if (!user) return;

    try {
      // Get today's trades to calculate used risk
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('executed_at', `${today}T00:00:00.000Z`)
        .lt('executed_at', `${today}T23:59:59.999Z`);

      if (tradesError) throw tradesError;

      const tradesCount = trades?.length || 0;
      const usedRisk = trades?.reduce((total, trade) => {
        return total + Math.abs(trade.pnl || 0);
      }, 0) || 0;

      setTodaysTrades(tradesCount);
      setCurrentRiskUsed(usedRisk);

      // Get or create daily risk tracker
      const { data: riskData, error: riskError } = await supabase
        .from('daily_risk_tracker')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (riskError && riskError.code !== 'PGRST116') {
        throw riskError;
      }

      if (riskData) {
        setDailyRiskLimit(riskData.risk_limit);
      }
    } catch (error) {
      console.error('Error fetching risk data:', error);
    }
  };

  const updateDailyRiskLimit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('daily_risk_tracker')
        .upsert({
          user_id: user.id,
          date: today,
          risk_limit: dailyRiskLimit,
          used_risk: currentRiskUsed,
          trades_count: todaysTrades
        });

      if (error) throw error;

      toast({
        title: "Risk Limit Updated",
        description: `Daily risk limit set to $${dailyRiskLimit}`,
      });
    } catch (error) {
      console.error('Error updating risk limit:', error);
      toast({
        title: "Error",
        description: "Failed to update risk limit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskStatus = () => {
    if (riskPercentage >= 100) return { color: 'destructive', text: 'RISK EXCEEDED' };
    if (riskPercentage >= 80) return { color: 'warning', text: 'HIGH RISK' };
    if (riskPercentage >= 60) return { color: 'default', text: 'MODERATE RISK' };
    return { color: 'success', text: 'SAFE' };
  };

  const riskStatus = getRiskStatus();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Risk Calculator & Daily Tracker</h1>
          <p className="text-muted-foreground">
            Manage your daily risk exposure and track your risk-to-reward ratios
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Daily Risk Limit Card */}
          <Card className="glass-effect border-violet/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-violet" />
                Daily Risk Limit
              </CardTitle>
              <CardDescription>Set your maximum daily risk exposure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="riskLimit">Risk Limit ($)</Label>
                <Input
                  id="riskLimit"
                  type="number"
                  value={dailyRiskLimit}
                  onChange={(e) => setDailyRiskLimit(Number(e.target.value))}
                  placeholder="Enter daily risk limit"
                />
              </div>
              <Button 
                onClick={updateDailyRiskLimit} 
                disabled={loading}
                className="w-full"
                variant="premium"
              >
                {loading ? 'Updating...' : 'Update Limit'}
              </Button>
            </CardContent>
          </Card>

          {/* Risk Status Card */}
          <Card className="glass-effect border-violet/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-violet" />
                Risk Status
              </CardTitle>
              <CardDescription>Today's risk exposure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Used: ${currentRiskUsed.toFixed(2)}</span>
                  <Badge variant={riskStatus.color}>{riskStatus.text}</Badge>
                </div>
                <Progress value={Math.min(riskPercentage, 100)} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>{riskPercentage.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span className="font-medium">${remainingRisk.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Activity Card */}
          <Card className="glass-effect border-violet/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet" />
                Today's Activity
              </CardTitle>
              <CardDescription>Trading activity summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trades Today</span>
                  <span className="text-lg font-bold">{todaysTrades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk Used</span>
                  <span className="text-lg font-bold">${currentRiskUsed.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk Remaining</span>
                  <span className="text-lg font-bold text-green-600">${remainingRisk.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Management Tips */}
        <Card className="glass-effect border-violet/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-violet" />
              Risk Management Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-violet">Daily Risk Rules</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Never risk more than 1-2% of your account per trade</li>
                  <li>• Set a maximum daily loss limit and stick to it</li>
                  <li>• Stop trading when you hit your daily risk limit</li>
                  <li>• Review and adjust your limits weekly</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-violet">Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use stop losses on every trade</li>
                  <li>• Maintain a 1:2 risk-to-reward ratio minimum</li>
                  <li>• Track your risk-adjusted returns</li>
                  <li>• Never revenge trade after losses</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RiskCalculator;