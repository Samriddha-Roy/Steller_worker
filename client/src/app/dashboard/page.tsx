'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  History, 
  Search, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import Link from 'next/link';

import { Suspense } from 'react';

function DashboardContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentScanId, setPaymentScanId] = useState<string | null>(searchParams.get('paymentScanId'));

  const { data: scans, isLoading: isScansLoading, refetch: refetchScans } = useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const response = await api.get('/scan');
      return response.data.data;
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
      case 'RUNNING':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 animate-pulse">Scanning</Badge>;
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return <Badge variant="outline" className="text-amber-500 border-amber-500/20">Awaiting Payment</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 overflow-x-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user.name || user.email.split('@')[0]}</p>
          </div>
          <Link href="/scan">
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{user.balance?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1">Stellar-linked wallet</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scans?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all targets</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Good</div>
              <p className="text-xs text-muted-foreground mt-1">Based on recent results</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Scans</CardTitle>
                <CardDescription>Your latest security analyses and their current status</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => refetchScans()}>
                <History className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isScansLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : scans?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No scans found</h3>
                <p className="text-sm text-muted-foreground mb-6">Start your first scan to secure your application.</p>
                <Link href="/scan">
                  <Button variant="outline">Start First Scan</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y border-t">
                {scans.map((scan: any) => (
                  <div key={scan.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center ${scan.type === 'URL' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                        {scan.type === 'URL' ? <div className="text-[10px] font-bold">URL</div> : <div className="text-[10px] font-bold">GIT</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium flex flex-wrap items-center gap-2 mb-1">
                          <span className="truncate max-w-[150px] sm:max-w-xs md:max-w-md break-all">{scan.target}</span>
                          {getStatusBadge(scan.status)}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(scan.createdAt).toLocaleDateString()}</span>
                          {scan.status === 'COMPLETED' && (
                            <span className="flex items-center gap-1 text-green-500 font-medium">
                              <ShieldCheck className="h-3 w-3" /> {scan.result?.summary?.vulnerabilitiesFound || 0} issues found
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {scan.status.toUpperCase() === 'PENDING_PAYMENT' || scan.status.toUpperCase() === 'PENDING' ? (
                        <Button size="sm" onClick={() => setPaymentScanId(scan.id)}>Pay Now</Button>
                      ) : scan.status.toUpperCase() === 'COMPLETED' ? (
                        <Link href={`/results/${scan.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            View Report
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/results/${scan.id}`}>
                          <Button size="sm" variant="ghost" className="gap-2">
                            Check Status
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Payment Modal */}
      <PaymentModal 
        scanId={paymentScanId} 
        onClose={() => {
          setPaymentScanId(null);
          router.replace('/dashboard', { scroll: false });
        }}
        onSuccess={() => {
          setPaymentScanId(null);
          refetchScans();
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-5xl overflow-x-hidden">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </main>
    </div>
  );
}
