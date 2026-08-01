'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { FileText, Activity, TrendingUp, Sparkles, Building2, User, Search } from 'lucide-react';
import { getReports } from '@/services/report-service';
import { Report } from '@/types';

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [reports, setReports] = React.useState<Report[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    getReports().then(setReports);

    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-between w-full max-w-[280px] h-9 px-3 text-xs text-muted-foreground bg-background/80 border border-border/80 rounded-lg hover:border-primary/50 transition-colors shadow-xs"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Search reports, tests...</span>
        </span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a biomarker, doctor, lab, or report..." />
        <CommandList className="max-h-[380px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
              <Activity className="mr-2 h-4 w-4 text-primary" />
              <span>Dashboard Home</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/reports'))}>
              <FileText className="mr-2 h-4 w-4 text-primary" />
              <span>All Medical Reports</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/history'))}>
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              <span>Medical History & Biomarker Timelines</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/insights'))}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span>Smart Health Insights</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Sample Reports">
            {reports.map((report) => (
              <CommandItem
                key={report.id}
                onSelect={() => runCommand(() => router.push(`/reports/${report.id}`))}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{report.labName}</p>
                    <p className="text-xs text-muted-foreground">{report.formattedDate} · Dr. {report.doctorName}</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {report.tests.filter((t) => t.isAbnormal).length} Abnormal
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Key Shared Biomarkers">
            {['Haemoglobin', 'Total Platelet Count', 'ESR', 'Glucose', 'Cholesterol', 'Vitamin D', 'Creatinine'].map((bio) => (
              <CommandItem
                key={bio}
                onSelect={() => runCommand(() => router.push(`/history?biomarker=${encodeURIComponent(bio)}`))}
              >
                <Activity className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Track {bio} Timeline</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
