'use client';

import * as React from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchDialog } from '@/components/search-dialog';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="h-16 border-b border-border/60 bg-background/95 backdrop-blur-xs sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Sidebar Toggle & Search Input */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border/50">
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 border-r">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar onNavClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Global Search Bar */}
        <SearchDialog />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Simple 1-Click Light & Dark Mode Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <div className="pl-1">
          <Avatar className="h-9 w-9 border-2 border-primary/30 ring-2 ring-background cursor-pointer hover:scale-105 transition-transform">
            <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">NO</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
