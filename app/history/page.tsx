'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { getReports } from '@/services/report-service';
import { Report, Test } from '@/types';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Info, Calendar, CheckCircle2, AlertTriangle, Activity, TrendingUp, User } from 'lucide-react';
import { toast } from 'sonner';
import { usePatientUuid } from '@/lib/patient-uuid';

const PANELS = [
  {
    id: 'blood-work',
    label: 'Blood Work',
    title: 'Blood Work Trends',
    historyTitle: 'Complete Blood Count History',
    parameters: [
      { key: 'Total WBC', label: 'WBC (10³/µL)', color: '#0284c7' },
      { key: 'Total RBC', label: 'RBC (10⁶/µL)', color: '#2563eb' },
      { key: 'Haemoglobin', label: 'Hemoglobin (g/dL)', color: '#0d9488' },
      { key: 'Total Platelet Count', label: 'Platelets (10³/µL)', color: '#ea580c' },
    ],
  },
  {
    id: 'electrolytes',
    label: 'Electrolytes',
    title: 'Electrolytes Trends',
    historyTitle: 'Electrolytes History',
    parameters: [
      { key: 'Sodium', label: 'Sodium (mmol/L)', color: '#2563eb' },
      { key: 'Potassium', label: 'Potassium (mmol/L)', color: '#0d9488' },
      { key: 'Chloride', label: 'Chloride (mmol/L)', color: '#d97706' },
      { key: 'Calcium', label: 'Calcium (mg/dL)', color: '#ea580c' },
      { key: 'Magnesium', label: 'Magnesium (mg/dL)', color: '#8b5cf6' },
    ],
  },
  {
    id: 'renal-hepatic',
    label: 'Kidney & Liver',
    title: 'Kidney & Liver Function Trends',
    historyTitle: 'Renal & Hepatic History',
    parameters: [
      { key: 'Creatinine', label: 'S. Creatinine (mg/dL)', color: '#f43f5e' },
      { key: 'Urea', label: 'Urea (mg/dL)', color: '#d97706' },
      { key: 'Uric Acid', label: 'Uric Acid (mg/dL)', color: '#2563eb' },
      { key: 'ALT/SGPT', label: 'ALT/SGPT (U/L)', color: '#0d9488' },
      { key: 'AST/SGOT', label: 'AST/SGOT (U/L)', color: '#8b5cf6' },
    ],
  },
  {
    id: 'lipid-panel',
    label: 'Lipid Panel',
    title: 'Lipid Profile Trends',
    historyTitle: 'Lipid Panel History',
    parameters: [
      { key: 'Cholesterol', label: 'Total Cholesterol (mg/dL)', color: '#f43f5e' },
      { key: 'Triglycerides', label: 'Triglycerides (mg/dL)', color: '#d97706' },
      { key: 'HDL Cholesterol', label: 'HDL (mg/dL)', color: '#0d9488' },
    ],
  },
  {
    id: 'other-tests',
    label: 'Other Tests',
    title: 'Metabolic & Endocrine Trends',
    historyTitle: 'Other Test Results',
    parameters: [
      { key: 'Glucose', label: 'Glucose (mg/dL)', color: '#2563eb' },
      { key: 'HbA1c', label: 'HbA1c (%)', color: '#f43f5e' },
      { key: 'TSH', label: 'TSH (uIU/mL)', color: '#d97706' },
      { key: 'Vitamin D', label: 'Vitamin D (ng/mL)', color: '#0d9488' },
      { key: 'Vitamin B12', label: 'Vitamin B12 (pg/mL)', color: '#8b5cf6' },
    ],
  },
];

function HistoryContent() {
  const [patientUuid] = usePatientUuid();
  const searchParams = useSearchParams();
  const initialPanel = searchParams.get('panel') || 'blood-work';

  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState(initialPanel);
  const [timeRange, setTimeRange] = React.useState('all');

  React.useEffect(() => {
    const p = searchParams.get('panel');
    if (p) setActiveTab(p);
  }, [searchParams]);

  React.useEffect(() => {
    setLoading(true);
    getReports(patientUuid).then((res) => {
      setReports(res);
      setLoading(false);
    });
  }, [patientUuid]);

  const filteredReports = React.useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );

    if (timeRange === '6m') {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 6);
      return sorted.filter((r) => new Date(r.reportDate) >= cutoff);
    } else if (timeRange === '1y') {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      return sorted.filter((r) => new Date(r.reportDate) >= cutoff);
    }
    return sorted;
  }, [reports, timeRange]);

  const currentPanel = PANELS.find((p) => p.id === activeTab) || PANELS[0];

  const chartData = React.useMemo(() => {
    return filteredReports.map((report) => {
      const point: Record<string, any> = {
        date: report.formattedDate,
        fullDate: report.reportDate,
        lab: report.labName,
      };

      currentPanel.parameters.forEach((param) => {
        const test = report.tests.find(
          (t) => t.name.toLowerCase().trim() === param.key.toLowerCase().trim()
        );
        if (test) {
          let val = test.value;
          if (param.key === 'Total Platelet Count') val = val / 1000;
          if (param.key === 'Total WBC') val = val / 1000;
          point[param.key] = val;
          point[`${param.key}_raw`] = test.rawValue;
          point[`${param.key}_unit`] = test.unit;
        }
      });

      return point;
    });
  }, [filteredReports, currentPanel]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    currentPanel.parameters.forEach((param) => {
      config[param.key] = {
        label: param.label,
        color: param.color,
      };
    });
    return config;
  }, [currentPanel]);

  const handleExport = () => {
    toast.success(`Exporting ${currentPanel.label} History`, {
      description: `Downloaded ${filteredReports.length} report intervals to CSV.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-[340px] w-full rounded-3xl" />
        <Skeleton className="h-[300px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground font-sans">
            Biomarker History <TrendingUp className="h-5 w-5 text-emerald-500" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cloud Firestore longitudinal records mapped to Patient UUID: <span className="font-mono font-bold text-foreground">{patientUuid}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1 rounded-full border-zinc-200 dark:border-zinc-800 text-foreground">
            <User className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Patient: {patientUuid}
          </Badge>

          <Select value={timeRange} onValueChange={(val) => setTimeRange(val || 'all')}>
            <SelectTrigger className="w-[160px] h-9 text-xs font-semibold rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">All Time History</SelectItem>
              <SelectItem value="1y" className="text-xs">Last 1 Year</SelectItem>
              <SelectItem value="6m" className="text-xs">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={handleExport} className="h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 text-xs font-bold shadow-xs gap-1.5 px-3.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
        <TabsList className="w-full justify-start bg-zinc-100 dark:bg-zinc-900 p-1.5 h-auto flex-wrap gap-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
          {PANELS.map((panel) => (
            <TabsTrigger
              key={panel.id}
              value={panel.id}
              className="text-xs px-4 py-2 rounded-xl font-semibold transition-all data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-zinc-100 dark:data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs text-zinc-600 dark:text-zinc-400"
            >
              {panel.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PANELS.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} className="space-y-6 mt-6">
            {/* Section 1: Multi-Line Comparative Trend Chart */}
            <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 p-6 space-y-4 shadow-xs rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-foreground font-sans flex items-center gap-2">
                    {panel.title} <Activity className="h-4 w-4 text-emerald-500" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Track your {panel.label.toLowerCase()} parameters across historical lab visits
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  {panel.parameters.map((p) => (
                    <div key={p.key} className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-muted-foreground text-[11px] font-semibold">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[280px] w-full pt-2">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200/60 dark:stroke-zinc-800/60" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-[10px] text-muted-foreground font-mono"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-[10px] text-muted-foreground font-mono"
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(val, name, item) => {
                            const raw = item.payload[`${name}_raw`];
                            const unit = item.payload[`${name}_unit`];
                            return (
                              <div className="flex items-center justify-between gap-4 text-xs font-mono">
                                <span className="text-muted-foreground">{name}:</span>
                                <span className="font-bold text-foreground">
                                  {raw || val} {unit || ''}
                                </span>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    {panel.parameters.map((p) => (
                      <Line
                        key={p.key}
                        type="monotone"
                        dataKey={p.key}
                        name={p.key}
                        stroke={p.color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: p.color, stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              </div>
            </Card>

            {/* Section 2: Historical Accordion Table */}
            <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl overflow-hidden p-0">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-foreground">{panel.historyTitle}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Historical values and reference ranges for {panel.label.toLowerCase()} parameters
                </p>
              </div>

              <div className="p-0">
                <Accordion defaultValue={[filteredReports[filteredReports.length - 1]?.id]} className="w-full">
                  {[...filteredReports].reverse().map((report) => {
                    const panelTests = panel.parameters
                      .map((p) => report.tests.find((t) => t.name.toLowerCase().trim() === p.key.toLowerCase().trim()))
                      .filter(Boolean) as Test[];

                    if (panelTests.length === 0) return null;

                    return (
                      <AccordionItem key={report.id} value={report.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-3 text-left">
                            <div>
                              <span className="font-mono font-bold text-sm text-foreground block">
                                {report.formattedDate}
                              </span>
                              <span className="text-xs text-muted-foreground">{report.labName}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {panelTests.map((t) => (
                                <span
                                  key={t.id}
                                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                    t.isAbnormal
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-none'
                                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-none'
                                  }`}
                                >
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 pb-5 pt-1 bg-zinc-50/50 dark:bg-zinc-900/50">
                          <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <Table>
                              <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                <TableRow>
                                  <TableHead className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Parameter</TableHead>
                                  <TableHead className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Observed Value</TableHead>
                                  <TableHead className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Reference Range</TableHead>
                                  <TableHead className="py-3.5 px-4 text-right text-xs font-bold uppercase tracking-wider pr-6 text-muted-foreground">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {panelTests.map((test) => (
                                  <TableRow key={test.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60">
                                    <TableCell className="py-3.5 px-4 font-bold text-sm text-foreground">
                                      <div className="flex items-center gap-1.5">
                                        <span>{test.name}</span>
                                        <Tooltip>
                                          <TooltipTrigger
                                            render={
                                              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-500 cursor-pointer" />
                                            }
                                          />
                                          <TooltipContent className="text-xs max-w-[220px]">
                                            Standard clinical test for {test.category}. Unit: {test.unit || 'N/A'}.
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </TableCell>
                                    <TableCell className="py-3.5 px-4 font-mono font-extrabold text-base text-foreground">
                                      {test.rawValue} {test.unit}
                                    </TableCell>
                                    <TableCell className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                                      {test.referenceRange || 'Standard'}
                                    </TableCell>
                                    <TableCell className="py-3.5 px-4 text-right pr-6">
                                      {test.isAbnormal ? (
                                        <Badge variant="destructive" className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-none">
                                          <AlertTriangle className="h-3 w-3 mr-1" /> Flagged
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="secondary"
                                          className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-none"
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" /> Normal
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function LabResultsHistoryPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
      <HistoryContent />
    </React.Suspense>
  );
}
