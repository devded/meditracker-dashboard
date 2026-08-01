'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Sparkles,
  Activity,
  Calendar,
  MessageSquare,
  Mail,
  FileCode,
  Bot,
  Crown,
  HeartPulse,
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
    {
      name: 'Health Insights',
      href: '/insights',
      icon: Sparkles,
      active: pathname === '/insights',
    },
  ];

  const appsNav = [
    { name: 'AI Assistant', href: '/insights', icon: Bot },
    { name: 'Calendar', href: '/history', icon: Calendar },
    { name: 'Chats', href: '/', icon: MessageSquare },
    { name: 'Email', href: '/', icon: Mail },
    { name: 'Notes', href: '/', icon: FileCode },
  ];

  return (
    <aside className="flex flex-col h-full bg-background border-r border-border/70 text-foreground w-64 shrink-0 transition-all p-4">
      {/* Brand Header: shadcnspace style */}
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

        {/* APPS Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            APPS
          </div>
          <nav className="space-y-1">
            {appsNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavClick}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-muted hover:text-foreground transition-all"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Promo Card matching shadcnspace "Grab Pro Now" */}
      <div className="mt-auto pt-4">
        <div className="rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 text-center space-y-3">
          {/* Friendly Cat in Box / Doctor Box Illustration */}
          <div className="size-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Crown className="size-7 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Grab Pro Now</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Customize your admin</p>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            className="w-full h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-bold shadow-xs"
          >
            Get Premium
          </Button>
        </div>
      </div>
    </aside>
  );
}
