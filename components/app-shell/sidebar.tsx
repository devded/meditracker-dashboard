'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  HeartPulse,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadDialog } from '@/components/upload-dialog';

interface SidebarProps {
  onNavClick?: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const mainNav = [
    {
      name: 'Analytics',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: 'All Reports',
      href: '/reports',
      icon: FileText,
      active: pathname.startsWith('/reports'),
    },
    {
      name: 'Biomarker History',
      href: '/history',
      icon: TrendingUp,
      active: pathname === '/history',
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-background border-r border-border/70 text-foreground w-64 shrink-0 transition-all p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
        <div className="size-8 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
          <HeartPulse className="size-4" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-foreground font-sans">
          medtracker<span className="text-primary">.</span>
        </span>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* DASHBOARD Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            DASHBOARD
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                    item.active
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Upload Action */}
      <div className="mt-auto pt-4">
        <Button
          onClick={() => setUploadOpen(true)}
          className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-bold shadow-xs flex items-center gap-2"
        >
          <PlusCircle className="size-4" />
          <span>Upload Lab Report</span>
        </Button>
      </div>
    </aside>
  );
}
