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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed?: boolean;
  onNavClick?: () => void;
}

export function Sidebar({ collapsed = false, onNavClick }: SidebarProps) {
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
    <aside
      className={cn(
        'flex flex-col h-full bg-background border-r border-border/70 text-foreground transition-all duration-300 p-4 shrink-0',
        collapsed ? 'w-16 items-center px-2' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className={cn('flex items-center gap-2.5 py-3 mb-4', collapsed ? 'justify-center px-0' : 'px-2')}>
        <div className="size-8 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
          <HeartPulse className="size-4" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-xl tracking-tight text-foreground font-sans truncate">
            medtracker<span className="text-primary">.</span>
          </span>
        )}
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto space-y-6 w-full">
        {/* DASHBOARD Section */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              DASHBOARD
            </div>
          )}
          <nav className="space-y-1.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-xl text-xs font-semibold transition-all',
                    collapsed
                      ? 'justify-center size-10 mx-auto p-0'
                      : 'px-3.5 py-2.5 w-full',
                    item.active
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger render={linkContent} />
                    <TooltipContent side="right" className="font-semibold text-xs">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Upload Action */}
      <div className="mt-auto pt-4 w-full">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => setUploadOpen(true)}
                  size="icon"
                  className="size-10 rounded-xl mx-auto bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 shadow-xs flex items-center justify-center"
                >
                  <PlusCircle className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="right" className="font-semibold text-xs">
              Upload Lab Report
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            onClick={() => setUploadOpen(true)}
            className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-bold shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="size-4" />
            <span>Upload Lab Report</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
