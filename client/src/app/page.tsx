import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Shield, Zap, CircleDollarSign, BarChart3, Lock, Code2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-24 md:py-32">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
          </div>

          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
                Smarter security with AI
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
                Scan your app for <span className="text-primary">₹5</span>
              </h1>
              
              <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl text-balance animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-both delay-200">
                The world's first pay-per-use AI security auditor. Find vulnerabilities in seconds using state-of-the-art LLMs and verify payments via Stellar blockchain.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both delay-300">
                <Link href="/scan">
                  <Button size="lg" className="h-12 px-8 text-base font-semibold transition-all hover:scale-105 active:scale-95">
                    Start Scan Now
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold transition-all hover:bg-muted/50">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CircleDollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pay-as-you-go</h3>
                <p className="text-muted-foreground">
                  No monthly subscriptions. Pay only when you scan. Each scan costs just ₹5 (standard) or ₹20 (deep scan).
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Powered by OpenAI's latest models. Our AI understands your code context and finds logic flaws scanners miss.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-2xl border bg-background p-8 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Blockchain Secure</h3>
                <p className="text-muted-foreground">
                  Payments are processed on the Stellar network using x402 protocol, ensuring transparency and lightning speed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 border-y">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">500+</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Apps Scanned</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">1200+</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Bugs Found</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">₹0</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Subscription Fee</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-bold">99%</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Accuracy Rate</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">AI Hacker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AI Hacker. Built for the Stellar Hackathon.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">GitHub</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Discord</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
