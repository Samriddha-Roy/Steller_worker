'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Code2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ScanPage() {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('url');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setIsLoading(true);
    try {
      const response = await api.post('/scan', { 
        target,
        type: scanType,      });
      
      const { scanId } = response.data.data;
      toast.success('Scan initiated! Please complete payment.');
      router.push(`/dashboard?paymentScanId=${scanId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start scan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">New Security Scan</h1>
            <p className="text-muted-foreground">
              Enter a website URL or GitHub repository to start the AI analysis.
            </p>
          </div>

          <Card className="border-primary/10 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle>Scan Configuration</CardTitle>
              <CardDescription>
                Choose your target and scan intensity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScan} className="space-y-6">
                <Tabs defaultValue="url" onValueChange={setScanType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="url" className="gap-2">
                      <Globe className="h-4 w-4" />
                      Website URL
                    </TabsTrigger>
                    <TabsTrigger value="github" className="gap-2">
                      <Code2 className="h-4 w-4" />
                      GitHub Repo
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="target">
                        {scanType === 'URL' ? 'Website Address' : 'Repository URL'}
                      </Label>
                      <Input
                        id="target"
                        placeholder={scanType === 'URL' ? 'https://example.com' : 'https://github.com/user/repo'}
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm text-primary">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p>
                        Scanning this target will cost <strong>₹5.00</strong>. You will be redirected to the payment flow after submission.
                      </p>
                    </div>
                  </div>
                </Tabs>

                <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading || !target}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-card text-card-foreground">
              <h4 className="font-semibold mb-1">Standard Scan</h4>
              <p className="text-sm text-muted-foreground">Basic vulnerability assessment and logic checks.</p>
              <div className="mt-2 font-bold text-primary">₹5.00</div>
            </div>
            <div className="p-4 rounded-xl border bg-card text-card-foreground opacity-50">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold mb-1">Deep Analysis</h4>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold">Coming Soon</span>
              </div>
              <p className="text-sm text-muted-foreground">Comprehensive code review with multi-model verification.</p>
              <div className="mt-2 font-bold text-primary">₹20.00</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
