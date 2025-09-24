import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, AlertCircle, DollarSign, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

const PositionCalculator = () => {
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [instrument, setInstrument] = useState<string>('forex');
  const [pipValue, setPipValue] = useState<number>(10);

  const calculatePosition = () => {
    if (!accountBalance || !riskPerTrade || !entryPrice || !stopLoss) {
      return null;
    }

    const riskAmount = accountBalance * (riskPerTrade / 100);
    const stopLossDistance = Math.abs(entryPrice - stopLoss);
    
    let positionSize = 0;
    let positionValue = 0;

    if (instrument === 'forex') {
      // For forex, position size is in lots
      const pips = stopLossDistance * (instrument === 'jpy' ? 100 : 10000);
      positionSize = riskAmount / (pips * pipValue);
      positionValue = positionSize * 100000 * entryPrice; // Standard lot = 100,000 units
    } else if (instrument === 'crypto') {
      // For crypto, position size is in units of the base currency
      positionSize = riskAmount / stopLossDistance;
      positionValue = positionSize * entryPrice;
    } else {
      // For stocks and other instruments
      positionSize = riskAmount / stopLossDistance;
      positionValue = positionSize * entryPrice;
    }

    return {
      positionSize,
      positionValue,
      riskAmount,
      stopLossDistance,
      riskRewardRatio: calculateRR()
    };
  };

  const calculateRR = () => {
    if (!entryPrice || !stopLoss) return 0;
    
    // Assuming a 1:2 RR for example (can be made configurable)
    const stopLossDistance = Math.abs(entryPrice - stopLoss);
    return stopLossDistance * 2;
  };

  const results = calculatePosition();

  const getInstrumentLabel = (value: string) => {
    const labels = {
      forex: 'Forex Pairs',
      crypto: 'Cryptocurrency',
      stocks: 'Stocks',
      commodities: 'Commodities',
      indices: 'Indices'
    };
    return labels[value as keyof typeof labels] || value;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Position Size Calculator</h1>
          <p className="text-muted-foreground">
            Calculate optimal position sizes based on your risk management rules
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Card */}
          <Card className="glass-effect border-violet/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-violet" />
                Position Calculator
              </CardTitle>
              <CardDescription>Enter your trade parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-violet">Account Settings</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="balance">Account Balance ($)</Label>
                    <Input
                      id="balance"
                      type="number"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(Number(e.target.value))}
                      placeholder="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk">Risk Per Trade (%)</Label>
                    <Input
                      id="risk"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={riskPerTrade}
                      onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>

              {/* Trade Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-violet">Trade Settings</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instrument">Instrument Type</Label>
                    <Select value={instrument} onValueChange={setInstrument}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instrument type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forex">Forex Pairs</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="stocks">Stocks</SelectItem>
                        <SelectItem value="commodities">Commodities</SelectItem>
                        <SelectItem value="indices">Indices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="entry">Entry Price</Label>
                      <Input
                        id="entry"
                        type="number"
                        step="0.0001"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(Number(e.target.value))}
                        placeholder="1.2500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stopLoss">Stop Loss</Label>
                      <Input
                        id="stopLoss"
                        type="number"
                        step="0.0001"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value))}
                        placeholder="1.2400"
                      />
                    </div>
                  </div>

                  {instrument === 'forex' && (
                    <div className="space-y-2">
                      <Label htmlFor="pipValue">Pip Value ($)</Label>
                      <Input
                        id="pipValue"
                        type="number"
                        value={pipValue}
                        onChange={(e) => setPipValue(Number(e.target.value))}
                        placeholder="10"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button 
                variant="premium" 
                className="w-full"
                disabled={!results}
              >
                Calculate Position Size
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="glass-effect border-violet/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet" />
                Calculation Results
              </CardTitle>
              <CardDescription>Your optimal position size and risk metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* Main Results */}
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-violet/10 rounded-lg border border-violet/20">
                      <div className="text-sm text-muted-foreground mb-1">Recommended Position Size</div>
                      <div className="text-2xl font-bold text-violet">
                        {instrument === 'forex' 
                          ? `${results.positionSize.toFixed(2)} lots`
                          : `${results.positionSize.toFixed(0)} units`
                        }
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Position Value</div>
                        <div className="text-lg font-semibold">${results.positionValue.toFixed(2)}</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Risk Amount</div>
                        <div className="text-lg font-semibold text-red-500">${results.riskAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Metrics */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-violet mb-3">Risk Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stop Loss Distance:</span>
                        <span className="font-medium">{results.stopLossDistance.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Risk % of Account:</span>
                        <Badge variant="outline">{riskPerTrade}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Instrument Type:</span>
                        <Badge variant="secondary">{getInstrumentLabel(instrument)}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Risk Warning */}
                  {riskPerTrade > 2 && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>High Risk Warning:</strong> Risking more than 2% per trade can be dangerous for your account.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your trade parameters to calculate position size</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card className="glass-effect border-violet/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-violet" />
              Position Sizing Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-violet flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Risk Management
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Risk only 1-2% per trade</li>
                  <li>• Never risk more than you can afford to lose</li>
                  <li>• Use stop losses on every trade</li>
                  <li>• Adjust position size based on volatility</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-violet flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Position Sizing
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Larger account = larger position sizes</li>
                  <li>• Tighter stops = larger positions allowed</li>
                  <li>• Consider correlation between trades</li>
                  <li>• Account for slippage and spreads</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-violet flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Best Practices
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Plan your trade before entering</li>
                  <li>• Use consistent risk per trade</li>
                  <li>• Review and adjust regularly</li>
                  <li>• Keep detailed trading records</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PositionCalculator;