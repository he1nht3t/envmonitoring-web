'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/devices', label: 'Devices' },
    { href: '/analytics', label: 'Analytics' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
                <path d="M13 11h2v6" />
                <path d="M13 17h6" />
                <path d="M9 12v5" />
                <path d="M6 9v8" />
                <path d="M3 13v4" />
              </svg>
              <span className="font-bold">Environmental Monitoring</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = 
                link.href === '/' 
                  ? pathname === '/' 
                  : pathname.startsWith(link.href);
              
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={cn(
                    "text-sm font-medium transition-colors relative",
                    isActive 
                      ? "text-primary font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Environmental Monitoring Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 