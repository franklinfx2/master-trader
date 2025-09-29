import { useState } from 'react';
import { useTrades, Trade } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Filter, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScreenshotUpload } from '@/components/trading/ScreenshotUpload';
import { MobileTradeCard } from '@/components/trading/MobileTradeCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Trades() {
  const { trades, loading, addTrade, updateTrade, deleteTrade } = useTrades();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobileOrTablet();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    pair: '',
    direction: 'long' as 'long' | 'short',
    entry: '',
    exit: '',
    sl: '',
    tp: '',
    risk_pct: '',
    result: 'open' as 'win' | 'loss' | 'be' | 'open',
    notes: '',
    time: '',
    tradingSession: '' as string,
  });

  // Function to detect trading session based on time (GMT)
  const detectTradingSession = (timeString: string): string => {
    if (!timeString) return '';
    
    const [hours] = timeString.split(':').map(Number);
    
    // Convert local time to GMT (approximate - users can adjust manually if needed)
    const now = new Date();
    const localHour = hours;
    const gmtOffset = now.getTimezoneOffset() / 60;
    const gmtHour = (localHour + gmtOffset) % 24;
    
    // Trading sessions in GMT
    if ((gmtHour >= 23) || (gmtHour < 8)) {
      return 'Asian';
    } else if (gmtHour >= 8 && gmtHour < 17) {
      return 'London';
    } else if (gmtHour >= 13 && gmtHour < 22) {
      return gmtHour >= 17 ? 'New York' : 'London/New York Overlap';
    }
    
    return 'New York';
  };
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({
      pair: '',
      direction: 'long',
      entry: '',
      exit: '',
      sl: '',
      tp: '',
      risk_pct: '',
      result: 'open',
      notes: '',
      time: '',
      tradingSession: '',
    });
    setScreenshots([]);
    setEditingTrade(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check trade limit for free users
    if (profile?.plan === 'free' && trades.length >= 20 && !editingTrade) {
      toast({
        title: "Trade Limit Reached",
        description: "Free users can only create 20 trades. Upgrade to Pro for unlimited trades.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine date and time for executed_at
      let executedAt = new Date().toISOString();
      if (formData.time) {
        const today = new Date();
        const [hours, minutes] = formData.time.split(':');
        today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        executedAt = today.toISOString();
      }

      const tradeData: any = {
        pair: formData.pair,
        direction: formData.direction,
        entry: parseFloat(formData.entry),
        exit: formData.exit ? parseFloat(formData.exit) : undefined,
        sl: formData.sl ? parseFloat(formData.sl) : undefined,
        tp: formData.tp ? parseFloat(formData.tp) : undefined,
        risk_pct: formData.risk_pct ? parseFloat(formData.risk_pct) : undefined,
        result: formData.result,
        notes: `${formData.notes || ''}${formData.tradingSession ? ` [${formData.tradingSession.toUpperCase()} SESSION]` : ''}`.trim(),
        screenshot_url: screenshots.length > 0 ? screenshots[0] : undefined,
        executed_at: executedAt,
      };

      // Calculate P&L and RR if exit is provided
      if (tradeData.exit) {
        const entryPrice = tradeData.entry;
        const exitPrice = tradeData.exit;
        
        if (formData.direction === 'long') {
          tradeData.pnl = exitPrice - entryPrice;
        } else {
          tradeData.pnl = entryPrice - exitPrice;
        }

        // Calculate RR if stop loss is provided
        if (tradeData.sl) {
          const risk = Math.abs(entryPrice - tradeData.sl);
          const reward = Math.abs(tradeData.pnl);
          tradeData.rr = risk > 0 ? reward / risk : 0;
        }
      }

      const { error } = editingTrade 
        ? await updateTrade(editingTrade.id, tradeData)
        : await addTrade(tradeData);

      if (!error) {
        setIsDialogOpen(false);
        resetForm();
        toast({
          title: editingTrade ? "Trade Updated" : "Trade Added",
          description: editingTrade ? "Trade has been updated successfully." : "New trade has been added successfully.",
        });
      }
    } catch (err) {
      console.error('Error submitting trade:', err);
      toast({
        title: "Error",
        description: "Failed to save trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    
    // Extract time from executed_at
    const tradeTime = trade.executed_at ? new Date(trade.executed_at) : new Date();
    const timeString = `${tradeTime.getHours().toString().padStart(2, '0')}:${tradeTime.getMinutes().toString().padStart(2, '0')}`;
    
    // Extract trading session from notes
    let detectedSession = '';
    let cleanNotes = trade.notes || '';
    
    const sessionMatches = cleanNotes.match(/\[(ASIAN|LONDON|NEW YORK|LONDON\/NEW YORK OVERLAP) SESSION\]/i);
    if (sessionMatches) {
      detectedSession = sessionMatches[1];
      cleanNotes = cleanNotes.replace(sessionMatches[0], '').trim();
    }
    
    setFormData({
      pair: trade.pair,
      direction: trade.direction,
      entry: trade.entry.toString(),
      exit: trade.exit?.toString() || '',
      sl: trade.sl?.toString() || '',
      tp: trade.tp?.toString() || '',
      risk_pct: trade.risk_pct?.toString() || '',
      result: trade.result,
      notes: cleanNotes,
      time: timeString,
      tradingSession: detectedSession,
    });
    // Load existing screenshot if available
    setScreenshots(trade.screenshot_url ? [trade.screenshot_url] : []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      const { error } = await deleteTrade(id);
      if (!error) {
        toast({
          title: "Trade Deleted",
          description: "Trade has been deleted successfully.",
        });
      }
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    return trade.result === filter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={cn(
        "animate-fade-in",
        isMobile ? "space-y-4" : "space-y-6"
      )}>
        <div className={cn(
          "flex justify-between gap-4",
          isMobile ? "flex-col" : "items-center"
        )}>
          <div className="space-y-1">
            <h1 className={cn(
              "font-bold text-violet",
              isMobile ? "text-2xl" : "text-3xl"
            )}>
              Trades
            </h1>
            <p className={cn(
              "text-muted-foreground",
              isMobile ? "text-sm" : ""
            )}>
              Manage your trading history and performance
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                size={isMobile ? "default" : "default"}
                className={cn(
                  "shadow-strong transition-transform hover:scale-105",
                  isMobile ? "w-full" : ""
                )}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTrade ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
                <DialogDescription>
                  {editingTrade ? 'Update trade details' : 'Enter your trade information'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pair">Currency Pair *</Label>
                    <Input
                      id="pair"
                      placeholder="e.g. EURUSD"
                      value={formData.pair}
                      onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction *</Label>
                    <Select value={formData.direction} onValueChange={(value: 'long' | 'short') => setFormData({ ...formData, direction: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">Long (Buy)</SelectItem>
                        <SelectItem value="short">Short (Sell)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry">Entry Price *</Label>
                    <Input
                      id="entry"
                      type="number"
                      step="0.00001"
                      placeholder="1.0850"
                      value={formData.entry}
                      onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exit">Exit Price</Label>
                    <Input
                      id="exit"
                      type="number"
                      step="0.00001"
                      placeholder="1.0900"
                      value={formData.exit}
                      onChange={(e) => setFormData({ ...formData, exit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sl">Stop Loss</Label>
                    <Input
                      id="sl"
                      type="number"
                      step="0.00001"
                      placeholder="1.0800"
                      value={formData.sl}
                      onChange={(e) => setFormData({ ...formData, sl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tp">Take Profit</Label>
                    <Input
                      id="tp"
                      type="number"
                      step="0.00001"
                      placeholder="1.0950"
                      value={formData.tp}
                      onChange={(e) => setFormData({ ...formData, tp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="risk_pct">Risk %</Label>
                    <Input
                      id="risk_pct"
                      type="number"
                      step="0.1"
                      placeholder="2.0"
                      value={formData.risk_pct}
                      onChange={(e) => setFormData({ ...formData, risk_pct: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="result">Result</Label>
                    <Select value={formData.result} onValueChange={(value: any) => setFormData({ ...formData, result: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="win">Win</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                        <SelectItem value="be">Break Even</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        const detectedSession = detectTradingSession(newTime);
                        setFormData({ 
                          ...formData, 
                          time: newTime,
                          tradingSession: detectedSession
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tradingSession">Trading Session (Auto-detected)</Label>
                    <Select value={formData.tradingSession} onValueChange={(value: string) => setFormData({ ...formData, tradingSession: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time first" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asian">Asian Session</SelectItem>
                        <SelectItem value="London">London Session</SelectItem>
                        <SelectItem value="New York">New York Session</SelectItem>
                        <SelectItem value="London/New York Overlap">London/NY Overlap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Trade analysis, setup, emotions, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <ScreenshotUpload
                  screenshots={screenshots}
                  onScreenshotsChange={setScreenshots}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTrade ? 'Update Trade' : 'Add Trade'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter - Mobile Optimized */}
        <Card className="card-premium animate-scale-in">
          <CardContent className={cn("pt-6", isMobile && "p-4")}>
            <div className="flex items-center space-x-3">
              <Filter className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className={cn(
                  "transition-colors",
                  isMobile ? "flex-1" : "w-40"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                  <SelectItem value="be">Break Even</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Trades List - Mobile Optimized */}
        {filteredTrades.length === 0 ? (
          <Card className="card-premium">
            <CardContent className={cn("pt-6", isMobile && "p-6")}>
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-violet/10 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-violet" />
                </div>
                <h3 className={cn(
                  "font-semibold text-violet mb-2",
                  isMobile ? "text-lg" : "text-xl"
                )}>
                  No trades found
                </h3>
                <p className={cn(
                  "text-muted-foreground mb-6",
                  isMobile ? "text-sm" : ""
                )}>
                  Start tracking your trading performance
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  size={isMobile ? "default" : "lg"}
                  className="shadow-premium transition-transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(isMobile ? "space-y-3" : "space-y-4")}>
            {filteredTrades.map((trade) => 
              isMobile ? (
                <MobileTradeCard
                  key={trade.id}
                  trade={trade}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={(trade) => {}}
                />
              ) : (
                <Card key={trade.id} className="card-premium group hover:scale-[1.02] transition-all duration-300">
                  <CardContent className="pt-6">
                    {/* Desktop layout - horizontal */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trade.direction === 'long' 
                            ? 'bg-profit/20 text-profit' 
                            : 'bg-loss/20 text-loss'
                        }`}>
                          {trade.direction.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{trade.pair}</h3>
                          <p className="text-sm text-muted-foreground">
                            Entry: ${trade.entry} {trade.exit && `→ Exit: $${trade.exit}`}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trade.executed_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`font-semibold ${
                            trade.result === 'win' ? 'text-profit' :
                            trade.result === 'loss' ? 'text-loss' :
                            'text-neutral'
                          }`}>
                            {trade.result === 'open' ? 'Open' : 
                             trade.pnl ? `${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '-'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {trade.rr && `R:R 1:${trade.rr.toFixed(2)}`}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(trade)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(trade.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {trade.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm">{trade.notes}</p>
                      </div>
                    )}
                    {trade.screenshot_url && (
                      <div className="mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Screenshot
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Trade Screenshot - {trade.pair}</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-auto">
                              <img
                                src={trade.screenshot_url}
                                alt={`Screenshot for ${trade.pair} trade`}
                                className="w-full h-auto rounded-md"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}