'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MoreVertical, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function TopCampaignsTable() {
  const biomarkers = [
    {
      id: 1,
      name: 'Total Platelet Count',
      category: 'Hematology',
      date: '21 Jan 2024',
      value: '220,000 /Cmm',
      refRange: '150,000 - 450,000',
      pct: 72,
      isAbnormal: false,
    },
    {
      id: 2,
      name: 'Serum Potassium (K+)',
      category: 'Electrolytes',
      date: '18 Jul 2024',
      value: '5.4 mmol/L',
      refRange: '3.5 - 5.1',
      pct: 95,
      isAbnormal: true,
    },
    {
      id: 3,
      name: 'Serum Creatinine',
      category: 'Kidney (Renal)',
      date: '10 Oct 2024',
      value: '1.4 mg/dL',
      refRange: '0.7 - 1.2',
      pct: 88,
      isAbnormal: true,
    },
    {
      id: 4,
      name: 'Fasting Blood Glucose',
      category: 'Metabolic',
      date: '05 Dec 2024',
      value: '118 mg/dL',
      refRange: '70 - 99',
      pct: 82,
      isAbnormal: true,
    },
    {
      id: 5,
      name: 'Glycated Hemoglobin (HbA1c)',
      category: 'Endocrine',
      date: '15 Mar 2025',
      value: '6.4 %',
      refRange: '4.0 - 5.6',
      pct: 78,
      isAbnormal: true,
    },
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Biomarker Telemetry & Proximity</h3>
          <p className="text-xs text-muted-foreground">Observed values vs standard physiological limits</p>
        </div>
        <div className="relative w-full sm:w-[220px]">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search biomarker..."
            className="pl-8 h-8 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-slate-800 text-muted-foreground font-semibold">
              <th className="py-2.5 px-2">#</th>
              <th className="py-2.5 px-2">Biomarker Name</th>
              <th className="py-2.5 px-2">Category</th>
              <th className="py-2.5 px-2">Observed Value</th>
              <th className="py-2.5 px-2">Reference Range</th>
              <th className="py-2.5 px-2">Target Proximity</th>
              <th className="py-2.5 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {biomarkers.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-2 text-muted-foreground font-mono">{b.id}</td>
                <td className="py-3 px-2">
                  <div className="font-bold text-foreground">{b.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{b.date}</div>
                </td>
                <td className="py-3 px-2 text-muted-foreground">{b.category}</td>
                <td className="py-3 px-2 font-mono font-bold">
                  <span className={b.isAbnormal ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {b.value}
                  </span>
                </td>
                <td className="py-3 px-2 font-mono text-muted-foreground">{b.refRange}</td>
                <td className="py-3 px-2 w-[160px]">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.isAbnormal ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{b.pct}%</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <Link href="/history">
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Eye className="size-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
