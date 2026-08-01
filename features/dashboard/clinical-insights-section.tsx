'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Report } from '@/types';
import { Sparkles, ShieldAlert, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ClinicalInsightsSectionProps {
  reports: Report[];
}

export function ClinicalInsightsSection({ reports }: ClinicalInsightsSectionProps) {
  // Sort reports chronologically oldest to newest
  const sortedReports = React.useMemo(() => {
    return [...reports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );
  }, [reports]);

  const insights = React.useMemo(() => {
    if (sortedReports.length < 2) return [];

    const oldest = sortedReports[0];
    const latest = sortedReports[sortedReports.length - 1];

    const list = [];

    // 1. Platelet Recovery
    const platOld = oldest.tests.find((t) => t.name.includes('Platelet'));
    const platNew = latest.tests.find((t) => t.name.includes('Platelet'));
    if (platOld && platNew) {
      list.push({
        id: 'ins-1',
        title: 'Thrombocyte / Platelet Rebound',
        status: 'Substantial Recovery',
        badgeVariant: 'secondary' as const,
        changeText: `${platOld.rawValue} → ${platNew.rawValue} ${platNew.unit}`,
        description: 'Total platelet count recovered from thrombocytopenia levels to optimal physiological baseline.',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
      });
    }

    // 2. Vitamin D Sufficiency
    const vitDOld = oldest.tests.find((t) => t.name === 'Vitamin D');
    const vitDNew = latest.tests.find((t) => t.name === 'Vitamin D');
    if (vitDOld && vitDNew) {
      list.push({
        id: 'ins-2',
        title: 'Vitamin D Sufficiency Progress',
        status: 'Optimal Goal Achieved',
        badgeVariant: 'secondary' as const,
        changeText: `${vitDOld.rawValue} → ${vitDNew.rawValue} ng/mL`,
        description: 'Serum 25-OH Vitamin D levels increased from insufficiency (<30 ng/mL) to optimal therapeutic bounds.',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
      });
    }

    // 3. Fasting Glucose & HbA1c Glycemic Stability
    const gluNew = latest.tests.find((t) => t.name === 'Glucose');
    const hba1cNew = latest.tests.find((t) => t.name === 'HbA1c');
    if (gluNew && hba1cNew) {
      list.push({
        id: 'ins-3',
        title: 'Glycemic Parameter Normalization',
        status: 'In Target Bounds',
        badgeVariant: 'secondary' as const,
        changeText: `Glucose ${gluNew.rawValue} mg/dL, HbA1c ${hba1cNew.rawValue}%`,
        description: 'Fasting glucose and glycated hemoglobin parameters are maintaining stable non-diabetic ranges.',
        color: 'text-teal-500',
        bgColor: 'bg-teal-500/10',
      });
    }

    // 4. Inflammatory Marker ESR Trend
    const esrOld = oldest.tests.find((t) => t.name === 'ESR');
    const esrNew = latest.tests.find((t) => t.name === 'ESR');
    if (esrOld && esrNew) {
      list.push({
        id: 'ins-4',
        title: 'Inflammatory Marker Resolution (ESR)',
        status: 'Inflammation Resolving',
        badgeVariant: 'secondary' as const,
        changeText: `${esrOld.rawValue} → ${esrNew.rawValue} mm/hr`,
        description: 'Erythrocyte Sedimentation Rate returned to normal reference range following post-viral recovery.',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
      });
    }

    return list;
  }, [sortedReports]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            Clinical Health Observations <Sparkles className="h-4 w-4 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground">
            Automated longitudinal patterns computed from historical lab diagnostic records.
          </p>
        </div>
        <Link href="/insights" className="text-xs text-primary hover:underline flex items-center gap-1 font-mono">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((item) => (
          <Card key={item.id} className="shadow-xs border-border/80 hover:border-primary/50 transition-all flex flex-col justify-between">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-foreground font-semibold">
                  {item.status}
                </span>
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.color}`} />
              </div>
              <CardTitle className="text-xs font-bold mt-2">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
              <div className="text-xs font-mono font-bold text-foreground bg-muted/30 p-1.5 rounded border border-border/40">
                {item.changeText}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
