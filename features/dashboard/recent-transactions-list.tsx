'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ShieldCheck, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Report } from '@/types';

interface RecentTransactionsListProps {
  reports?: Report[];
}

export function RecentTransactionsList({ reports = [] }: RecentTransactionsListProps) {
  const defaultItems = [
    {
      id: '1',
      title: 'Complete Blood Count (CBC)',
      subtitle: 'IBN SINA Diagnostic • 21 Jan 2024',
      value: '3 Flagged',
      isAbnormal: true,
      icon: Activity,
      bgColor: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
    {
      id: '2',
      title: 'Serum Electrolytes Panel',
      subtitle: 'POPULAR Diagnostic • 18 Jul 2024',
      value: 'All Normal',
      isAbnormal: false,
      icon: ShieldCheck,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: '3',
      title: 'Renal & Hepatic Audit',
      subtitle: 'Labaid Specialized • 10 Oct 2024',
      value: '1 Flagged',
      isAbnormal: true,
      icon: AlertTriangle,
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      id: '4',
      title: 'Lipid Profile Review',
      subtitle: 'Square Hospital Labs • 05 Dec 2024',
      value: 'All Normal',
      isAbnormal: false,
      icon: FileText,
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      id: '5',
      title: 'Endocrine & Vitamin D',
      subtitle: 'Evercare Hospital • 15 Mar 2025',
      value: '1 Flagged',
      isAbnormal: true,
      icon: Sparkles,
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
      <div>
        <h3 className="text-base font-bold text-foreground mb-4">Recent Diagnostic Reports</h3>

        <div className="space-y-4">
          {defaultItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${item.bgColor}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                </div>

                <div
                  className={`font-extrabold font-mono text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                    item.isAbnormal
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-6">
        <Link href="/reports">
          <Button className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-bold shadow-xs">
            Inspect All Reports
          </Button>
        </Link>
      </div>
    </Card>
  );
}
