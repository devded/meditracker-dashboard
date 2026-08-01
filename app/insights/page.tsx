'use client';

import * as React from 'react';
import { getInsights } from '@/services/report-service';
import { InsightCardData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, ShieldAlert, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InsightsPage() {
  const [insights, setInsights] = React.useState<InsightCardData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getInsights().then((data) => {
      setInsights(data);
      setLoading(false);
    });
  }, []);

  const getStatusBadge = (status: InsightCardData['status']) => {
    switch (status) {
      case 'improving':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-[11px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Improving Trend
          </Badge>
        );
      case 'stable':
        return (
          <Badge variant="secondary" className="font-mono text-[11px] gap-1">
            <Minus className="h-3 w-3" /> Physiological Baseline
          </Badge>
        );
      case 'attention':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-mono text-[11px] gap-1">
            <AlertTriangle className="h-3 w-3" /> Monitor Trend
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-mono text-[11px]">Active</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          Clinical Health Insights <Sparkles className="h-5 w-5 text-primary" />
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Descriptive longitudinal pattern analysis extracted from your diagnostic lab reports.
        </p>
      </div>

      {/* Non-Diagnostic Clinical Disclaimer */}
      <Alert className="border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200">
        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-xs font-bold uppercase tracking-wider">
          Descriptive Tracking Disclaimer
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          These automated observations present statistical trend comparisons across past lab reports. They are strictly descriptive and do NOT constitute a clinical diagnosis or treatment prescription. Always review lab findings with a qualified physician.
        </AlertDescription>
      </Alert>

      {/* Insights List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {insights.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="shadow-xs border-border/80 hover:border-primary/50 transition-all">
                <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                    {getStatusBadge(item.status)}
                  </div>
                  <Badge variant="outline" className="font-mono text-xs w-fit">
                    Category: {item.category}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2">
                      {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                      {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-blue-500" />}
                      {item.trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-xs font-semibold font-mono">{item.changeText}</span>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Latest: <span className="font-bold text-foreground">{item.latestValue}</span> (Ref: {item.referenceRange})
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1 flex items-center justify-end">
                    <Link href={`/history`}>
                      <span className="text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer">
                        View {item.biomarker} Timeline <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
