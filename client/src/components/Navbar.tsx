'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Shield, Zap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">AI Hacker</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="hidden md:block">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/scan">
                  <Button variant="default" className="gap-2 px-3 md:px-4">
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">New Scan</span>
                  </Button>
                </Link>
                
                <div className="ml-2 flex items-center gap-2">
                  <span className="hidden text-sm font-medium md:inline-block">
                    ₹{user.balance?.toFixed(2) || '0.00'}
                  </span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <User className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="font-medium px-2 py-1.5 text-sm">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="md:hidden px-0 py-0">
                      <Link href="/dashboard" className="block w-full px-2 py-1.5 text-sm">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer px-2 py-1.5 text-sm">
                      <LogOut className="mr-2 h-4 w-4 inline-block" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
