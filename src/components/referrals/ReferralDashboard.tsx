import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, DollarSign, Users, UserCheck, Wallet, ExternalLink } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import { formatPesewasToGHS } from '@/lib/paystack';

export const ReferralDashboard = () => {
  const { stats, commissions, payoutRequests, loading, getReferralLink, requestPayout, canRequestPayout, minimumPayout } = useReferrals();
  const { toast } = useToast();
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  const copyReferralLink = async () => {
    const link = getReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = () => {
    const link = getReferralLink();
    const text = `Join me on Edge Mind - AI-Powered Trading Intelligence! Use my referral link: ${link}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Edge Mind Referral',
        text,
        url: link,
      });
    } else {
      // Fallback to copying
      copyReferralLink();
    }
  };

  const handlePayoutRequest = async () => {
    if (!paymentMethod || !paymentDetails) {
      toast({
        title: "Error",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return;
    }

    setIsRequestingPayout(true);
    const result = await requestPayout(paymentMethod, { details: paymentDetails });

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Payout request submitted successfully",
      });
      setPayoutDialogOpen(false);
      setPaymentMethod('');
      setPaymentDetails('');
    }
    setIsRequestingPayout(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Unable to load referral data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Users who signed up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscribers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidSubscribers}</div>
            <p className="text-xs text-muted-foreground">Converted to Pro plan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPesewasToGHS(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPesewasToGHS(stats.pendingBalance)}</div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to earn 20% commission on every paid subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={getReferralLink()} 
              readOnly 
              className="flex-1"
            />
            <Button onClick={copyReferralLink} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={shareReferralLink} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your referral code: <strong>{stats.referralCode}</strong>
          </p>
        </CardContent>
      </Card>

      {/* Payout Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Minimum payout amount: {formatPesewasToGHS(minimumPayout)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canRequestPayout()}>
                Request Payout ({formatPesewasToGHS(stats.pendingBalance)})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Payout</DialogTitle>
                <DialogDescription>
                  Request payout of {formatPesewasToGHS(stats.pendingBalance)} to your preferred payment method.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paystack">Paystack Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-details">Payment Details</Label>
                  <Textarea 
                    id="payment-details"
                    placeholder="Enter your payment details (account number, mobile money number, etc.)"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePayoutRequest} disabled={isRequestingPayout}>
                  {isRequestingPayout ? 'Requesting...' : 'Request Payout'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Details Tabs */}
      <Tabs defaultValue="commissions" className="w-full">
        <TabsList>
          <TabsTrigger value="commissions">Commission History</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>Your earnings from referral commissions</CardDescription>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-muted-foreground">No commissions yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Referred User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          {new Date(commission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{commission.referred_user_email}</TableCell>
                        <TableCell>{formatPesewasToGHS(commission.amount)}</TableCell>
                        <TableCell>{(commission.commission_rate * 100).toFixed(0)}%</TableCell>
                        <TableCell>
                          <Badge variant={commission.status === 'paid' ? 'secondary' : 'default'}>
                            {commission.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your payout requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {payoutRequests.length === 0 ? (
                <p className="text-muted-foreground">No payout requests yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Requested</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {new Date(request.requested_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatPesewasToGHS(request.amount)}</TableCell>
                        <TableCell className="capitalize">
                          {request.payment_method?.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.status === 'paid' ? 'secondary' :
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' : 'outline'
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.processed_at ? 
                            new Date(request.processed_at).toLocaleDateString() : 
                            '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};