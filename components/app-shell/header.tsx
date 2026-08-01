'use client';

import * as React from 'react';
import { Menu, Bell, Search, ShoppingCart, Mail, Moon, Sun, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchDialog } from '@/components/search-dialog';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

      {/* Right: Actions matching shadcnspace header */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Indicator */}
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-base hidden sm:flex">
          🇬🇧
        </Button>

        {/* Shopping Cart Badge */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hidden sm:flex">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-extrabold flex items-center justify-center font-mono">
            11
          </span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
            <DropdownMenuLabel className="flex items-center justify-between text-xs font-bold">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-[10px] font-mono">3 New</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-2.5 rounded-xl cursor-pointer text-xs space-y-1">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">Platelet Count Normalized</div>
              <div className="text-muted-foreground text-[11px]">70,000 → 220,000 /Cmm over 3 visits.</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mail Icon */}
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hidden sm:flex">
          <Mail className="h-4 w-4 text-muted-foreground" />
        </Button>

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
