'use client';

import { ReactNode } from 'react';
import NavBar from './NavBar';
import Link from 'next/link';

interface BaseLayoutProps {
  children: ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-center">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Environmental Monitoring Dashboard. Developed by <Link href="https://heinhtetaung.me" target="_blank" rel="noopener noreferrer" className="hover:underline">Hein Htet Aung</Link> - <Link href="https://auston.edu.mm" target="_blank" rel="noopener noreferrer" className="hover:underline">Auston College</Link>.
          </p>
        </div>
      </footer>
    </div>
  );
} 