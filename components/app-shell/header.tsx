'use client';

import * as React from 'react';
import { PanelLeft, User, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from './sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePatientUuid } from '@/lib/patient-uuid';
import { toast } from 'sonner';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [uuidModalOpen, setUuidModalOpen] = React.useState(false);
  const [patientUuid, setPatientUuid] = usePatientUuid();
  const [inputUuid, setInputUuid] = React.useState(patientUuid);

  React.useEffect(() => {
    setInputUuid(patientUuid);
  }, [patientUuid]);

  const handleToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleSaveUuid = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUuid.trim().toUpperCase();
    if (!clean) return;

    setPatientUuid(clean);
    setUuidModalOpen(false);
    toast.success('Patient UUID Updated', {
      description: `Active database session mapped to Patient UUID: ${clean}`,
    });
  };

  const quickPicks = ['D198349', 'D198350', 'PATIENT-8829'];

  return (
    <header className="h-16 border-b border-border/60 bg-background/95 backdrop-blur-xs sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Sidebar Expand/Collapse Toggle Button */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className="hidden md:flex h-9 w-9 rounded-xl border border-border/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Expand / Collapse Sidebar"
        >
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Mobile Drawer Trigger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-border/50">
                  <PanelLeft className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Toggle mobile sidebar</span>
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-64 border-r">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar onNavClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Right: Actions & Patient UUID Selector */}
      <div className="flex items-center gap-3">
        {/* Patient UUID Badge / Switcher Button */}
        <button
          onClick={() => setUuidModalOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs shadow-2xs font-mono"
          title="Click to switch Patient UUID profile"
        >
          <User className="size-3.5 text-emerald-500" />
          <span className="text-muted-foreground">Patient:</span>
          <strong className="text-foreground font-extrabold">{patientUuid}</strong>
          <RefreshCw className="size-3 text-muted-foreground opacity-60 ml-0.5" />
        </button>

        {/* Patient UUID Switcher Modal */}
        <Dialog open={uuidModalOpen} onOpenChange={setUuidModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground font-sans">
                <User className="size-5 text-emerald-500" /> Switch Patient UUID
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                All Cloud Firestore reports, biomarker charts, and test histories will map directly to this Patient ID.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveUuid} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground font-mono">Patient UUID / ID:</label>
                <Input
                  value={inputUuid}
                  onChange={(e) => setInputUuid(e.target.value)}
                  placeholder="Enter Patient UUID (e.g. D198349)..."
                  className="font-mono text-xs h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>

              {/* Quick Pick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-muted-foreground font-mono">Quick Pick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {quickPicks.map((preset) => (
                    <Badge
                      key={preset}
                      variant="outline"
                      onClick={() => setInputUuid(preset)}
                      className={`cursor-pointer font-mono text-xs px-3 py-1 rounded-xl transition-all ${
                        inputUuid === preset
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold border-none'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {preset}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUuidModalOpen(false)}
                  className="rounded-xl text-xs h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl text-xs h-9 px-4 font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 gap-1.5 shadow-xs"
                >
                  <Check className="size-3.5" /> Save & Load Profile
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 1-Click Light & Dark Mode Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <div className="pl-1">
          <Avatar className="h-9 w-9 border-2 border-emerald-500/30 ring-2 ring-background cursor-pointer hover:scale-105 transition-transform" onClick={() => setUuidModalOpen(true)}>
            <AvatarFallback className="bg-zinc-900 text-white font-bold text-xs font-mono">NO</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
