'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Loader2, Wallet, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
  scanId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ scanId, onClose, onSuccess }: PaymentModalProps) {
  const [intent, setIntent] = useState<any>(null);
  const [txHash, setTxHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (scanId) {
      fetchPaymentIntent();
    }
  }, [scanId]);

  const fetchPaymentIntent = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/pay/intent/${scanId}`);
      setIntent(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load payment details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash) return;

    setIsSubmitting(true);
    try {
      await api.post('/pay', {
        scanId,
        transactionHash: txHash,
        amount: Number(intent.amount),
      });
      toast.success('Payment submitted! Verification in progress.');
      onSuccess();
      router.push(`/results/${scanId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!scanId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Send ₹5.00 via Stellar (XLM) to start your scan.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : intent ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4 rounded-xl bg-primary/5 p-4 border border-primary/10">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Destination Wallet</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-hidden break-all rounded bg-muted px-2 py-1 text-xs leading-relaxed">
                    {intent.destination}
                  </code>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(intent.destination)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Memo (Required)</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-hidden break-all rounded bg-muted px-2 py-1 text-xs font-bold leading-relaxed">
                    {intent.memo}
                  </code>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyToClipboard(intent.memo)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-primary/10 mt-2">
                <span className="text-sm font-medium">Amount:</span>
                <span className="font-bold text-primary">₹5.00 (~0.15 XLM)</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="txHash">Transaction Hash</Label>
                <Input
                  id="txHash"
                  placeholder="Paste your XLM transaction hash here"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !txHash}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </form>

            <div className="text-[10px] text-center text-muted-foreground">
              <p>Your scan will start automatically once the transaction is confirmed on-chain.</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
