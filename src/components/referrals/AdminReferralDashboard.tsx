import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useAdminReferrals } from '@/hooks/useAdminReferrals';
import { useToast } from '@/hooks/use-toast';
import { formatPesewasToGHS } from '@/lib/paystack';

export const AdminReferralDashboard = () => {
  const { 
    affiliates, 
    payoutRequests, 
    loading, 
    isAdmin, 
    updatePayoutRequest, 
    exportData 
  } = useAdminReferrals();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionStatus, setActionStatus] = useState<'approved' | 'rejected' | 'paid'>('approved');
  const [processing, setProcessing] = useState(false);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await exportData(format);
      if (!data) return;

      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affiliate-data.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exported",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handlePayoutAction = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    const result = await updatePayoutRequest(
      selectedRequest.id, 
      actionStatus, 
      adminNotes
    );

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Payout request ${actionStatus}`,
      });
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
    }
    setProcessing(false);
  };

  const openActionDialog = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const totalEarnings = affiliates.reduce((sum, a) => sum + a.total_earnings, 0);
  const totalPending = affiliates.reduce((sum, a) => sum + a.pending_balance, 0);
  const pendingPayouts = payoutRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliates.length}</div>
            <p className="text-xs text-muted-foreground">Active affiliate users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPesewasToGHS(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">All affiliate earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPesewasToGHS(totalPending)}</div>
            <p className="text-xs text-muted-foreground">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayouts}</div>
            <p className="text-xs text-muted-foreground">Requests awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download affiliate and payout data for analysis</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Tabs defaultValue="affiliates" className="w-full">
        <TabsList>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Management</CardTitle>
              <CardDescription>Overview of all affiliate users and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Paid Subs</TableHead>
                    <TableHead>Commissions</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {affiliate.referral_code}
                        </code>
                      </TableCell>
                      <TableCell>{affiliate.referral_count}</TableCell>
                      <TableCell>{affiliate.paid_subscribers}</TableCell>
                      <TableCell>{affiliate.commissions_count}</TableCell>
                      <TableCell>{formatPesewasToGHS(affiliate.total_earnings)}</TableCell>
                      <TableCell>{formatPesewasToGHS(affiliate.pending_balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>Manage affiliate payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.affiliate.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.affiliate.referral_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPesewasToGHS(request.amount)}</TableCell>
                      <TableCell className="capitalize">
                        {request.payment_method?.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {new Date(request.requested_at).toLocaleDateString()}
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
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => openActionDialog(request)}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Payout Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Review payout request for {formatPesewasToGHS(selectedRequest.amount)} 
                  from {selectedRequest.affiliate.email}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select value={actionStatus} onValueChange={(value: any) => setActionStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                  <SelectItem value="paid">Mark as Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            {selectedRequest?.payment_details && (
              <div>
                <Label>Payment Details</Label>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {JSON.stringify(selectedRequest.payment_details, null, 2)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayoutAction} disabled={processing}>
              {processing ? 'Processing...' : `${actionStatus.charAt(0).toUpperCase() + actionStatus.slice(1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};