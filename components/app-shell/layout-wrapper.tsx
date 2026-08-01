'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row antialiased selection:bg-primary/20 selection:text-primary">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Application Container */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" richColors />
      </div>
    </TooltipProvider>
  );
}
