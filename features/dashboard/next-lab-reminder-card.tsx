'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Plus, ShieldAlert } from 'lucide-react';
import { Report } from '@/types';

interface NextLabReminderCardProps {
  reports: Report[];
  onUploadClick: () => void;
}

export function NextLabReminderCard({ reports, onUploadClick }: NextLabReminderCardProps) {
  const latestReport = reports[0];

  const reminderInfo = React.useMemo(() => {
    if (!latestReport) return { lastDate: 'N/A', nextDate: 'Recommended Soon', elapsedDays: 180, pct: 100 };

    const lastDate = new Date(latestReport.reportDate);
    const today = new Date();

    // 6-month recommended interval (180 days)
    const recommendedNext = new Date(lastDate);
    recommendedNext.setMonth(recommendedNext.getMonth() + 6);

    const elapsedDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const pct = Math.min(100, Math.max(0, Math.round((elapsedDays / 180) * 100)));

    return {
      lastDate: latestReport.formattedDate,
      nextDate: recommendedNext.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      elapsedDays,
      pct,
    };
  }, [latestReport]);

  return (
    <Card className="shadow-xs border-border/80 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            Next Recommended Lab Checkup <Calendar className="h-4 w-4 text-primary" />
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
            Routine 6-Mo Interval
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Last Lab Visit: </span>
            <span className="font-mono font-bold text-foreground">{reminderInfo.lastDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Next Target Visit: </span>
            <span className="font-mono font-bold text-primary">{reminderInfo.nextDate}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Interval Progress</span>
            <span>{reminderInfo.elapsedDays} Days Elapsed ({reminderInfo.pct}%)</span>
          </div>
          <Progress value={reminderInfo.pct} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" /> Keep your longitudinal record up to date.
          </p>
          <Button size="sm" onClick={onUploadClick} className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" /> Add Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
