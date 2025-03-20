'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';

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
              <Image
                src="/env-monitor.svg"
                alt="Environmental Monitoring Logo"
                width={36}
                height={36}
                className="h-12 w-12"
              />
              <span className="font-bold md:inline hidden">Environmental Monitoring</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
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
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger className="md:hidden">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/env-monitor.svg"
                    alt="Environmental Monitoring Logo"
                    width={36}
                    height={36}
                    className="h-12 w-12"
                  />
                  <span className="font-bold">Environmental Monitoring</span>
                </Link>
                <nav className="flex flex-col gap-4">
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
                          "text-sm font-medium transition-colors py-2 px-1 border-l-2",
                          isActive 
                            ? "text-primary font-semibold border-primary" 
                            : "text-muted-foreground hover:text-foreground border-transparent"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Environmental Monitoring Dashboard. Developed by Hein Htet Aung - Auston College.
          </p>
        </div>
      </footer>
    </div>
  );
}