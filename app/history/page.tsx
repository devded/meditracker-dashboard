'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { getReports } from '@/services/report-service';
import { Report, Test } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Download, Info, Calendar, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { toast } from 'sonner';

const PANELS = [
  {
    id: 'blood-work',
    label: 'Blood Work',
    title: 'Blood Work Trends',
    historyTitle: 'Complete Blood Count History',
    parameters: [
      { key: 'Total WBC', label: 'WBC (10³/µL)', color: 'hsl(350 89% 60%)' },
      { key: 'Total RBC', label: 'RBC (10⁶/µL)', color: 'hsl(217 91% 60%)' },
      { key: 'Haemoglobin', label: 'Hemoglobin (g/dL)', color: 'hsl(160 60% 45%)' },
      { key: 'Total Platelet Count', label: 'Platelets (10³/µL)', color: 'hsl(270 75% 65%)' },
    ],
  },
  {
    id: 'electrolytes',
    label: 'Electrolytes',
    title: 'Electrolytes Trends',
    historyTitle: 'Electrolytes History',
    parameters: [
      { key: 'Sodium', label: 'Sodium (mmol/L)', color: 'hsl(217 91% 60%)' },
      { key: 'Potassium', label: 'Potassium (mmol/L)', color: 'hsl(160 60% 45%)' },
      { key: 'Chloride', label: 'Chloride (mmol/L)', color: 'hsl(38 92% 50%)' },
      { key: 'Calcium', label: 'Calcium (mg/dL)', color: 'hsl(25 95% 53%)' },
      { key: 'Magnesium', label: 'Magnesium (mg/dL)', color: 'hsl(270 75% 65%)' },
    ],
  },
  {
    id: 'renal-hepatic',
    label: 'Kidney & Liver',
    title: 'Kidney & Liver Function Trends',
    historyTitle: 'Renal & Hepatic History',
    parameters: [
      { key: 'Creatinine', label: 'S. Creatinine (mg/dL)', color: 'hsl(350 89% 60%)' },
      { key: 'Urea', label: 'Urea (mg/dL)', color: 'hsl(38 92% 50%)' },
      { key: 'Uric Acid', label: 'Uric Acid (mg/dL)', color: 'hsl(217 91% 60%)' },
      { key: 'ALT/SGPT', label: 'ALT/SGPT (U/L)', color: 'hsl(160 60% 45%)' },
      { key: 'AST/SGOT', label: 'AST/SGOT (U/L)', color: 'hsl(270 75% 65%)' },
    ],
  },
  {
    id: 'lipid-panel',
    label: 'Lipid Panel',
    title: 'Lipid Profile Trends',
    historyTitle: 'Lipid Panel History',
    parameters: [
      { key: 'Cholesterol', label: 'Total Cholesterol (mg/dL)', color: 'hsl(350 89% 60%)' },
      { key: 'Triglycerides', label: 'Triglycerides (mg/dL)', color: 'hsl(38 92% 50%)' },
      { key: 'HDL Cholesterol', label: 'HDL (mg/dL)', color: 'hsl(160 60% 45%)' },
    ],
  },
  {
    id: 'other-tests',
    label: 'Other Tests',
    title: 'Metabolic & Endocrine Trends',
    historyTitle: 'Other Test Results',
    parameters: [
      { key: 'Glucose', label: 'Glucose (mg/dL)', color: 'hsl(217 91% 60%)' },
      { key: 'HbA1c', label: 'HbA1c (%)', color: 'hsl(350 89% 60%)' },
      { key: 'TSH', label: 'TSH (uIU/mL)', color: 'hsl(38 92% 50%)' },
      { key: 'Vitamin D', label: 'Vitamin D (ng/mL)', color: 'hsl(160 60% 45%)' },
      { key: 'Vitamin B12', label: 'Vitamin B12 (pg/mL)', color: 'hsl(270 75% 65%)' },
    ],
  },
];

function HistoryContent() {
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
    getReports().then((res) => {
      setReports(res);
      setLoading(false);
    });
  }, []);

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
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-[340px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lab Results History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Longitudinal trend tracking & historical reference charts for vital clinical parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(val) => setTimeRange(val || 'all')}>
            <SelectTrigger className="w-[150px] h-9 text-xs font-medium">
              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Time History</SelectItem>
              <SelectItem value="1y" className="text-xs">Last 1 Year</SelectItem>
              <SelectItem value="6m" className="text-xs">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={handleExport} className="h-9 text-xs gap-1.5 shadow-xs">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
        <TabsList className="w-full justify-start bg-muted/60 p-1 h-auto flex-wrap gap-1 rounded-xl">
          {PANELS.map((panel) => (
            <TabsTrigger
              key={panel.id}
              value={panel.id}
              className="text-xs px-4 py-2 rounded-lg font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              {panel.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PANELS.map((panel) => (
          <TabsContent key={panel.id} value={panel.id} className="space-y-6 mt-6">
            {/* Section 1: Multi-Line Comparative Trend Chart */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      {panel.title} <Activity className="h-4 w-4 text-primary" />
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Track your {panel.label.toLowerCase()} parameters across historical lab visits.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    {panel.parameters.map((p) => (
                      <div key={p.key} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-muted-foreground text-[11px] font-medium">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-2">
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <LineChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-[11px] text-muted-foreground font-mono"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-[11px] text-muted-foreground font-mono"
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(val, name, item) => {
                            const raw = item.payload[`${name}_raw`];
                            const unit = item.payload[`${name}_unit`];
                            return (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground font-medium">{name}:</span>
                                <span className="font-mono font-bold text-foreground">
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
                        dot={{ r: 4, fill: p.color, stroke: 'var(--background)', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Section 2: Historical Accordion Table */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-base font-bold">{panel.historyTitle}</CardTitle>
                <CardDescription className="text-xs">
                  Historical values and reference ranges for {panel.label.toLowerCase()} parameters.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <Accordion defaultValue={[filteredReports[filteredReports.length - 1]?.id]} className="w-full">
                  {[...filteredReports].reverse().map((report) => {
                    const panelTests = panel.parameters
                      .map((p) => report.tests.find((t) => t.name.toLowerCase().trim() === p.key.toLowerCase().trim()))
                      .filter(Boolean) as Test[];

                    if (panelTests.length === 0) return null;

                    return (
                      <AccordionItem key={report.id} value={report.id} className="border-b border-border/60">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
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
                                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                                    t.isAbnormal
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  }`}
                                >
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 pb-4 pt-1 bg-muted/10">
                          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
                            <Table>
                              <TableHeader className="bg-muted/40">
                                <TableRow>
                                  <TableHead className="text-xs font-semibold">Parameter</TableHead>
                                  <TableHead className="text-xs font-semibold">Observed Value</TableHead>
                                  <TableHead className="text-xs font-semibold">Reference Range</TableHead>
                                  <TableHead className="text-right text-xs font-semibold pr-6">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {panelTests.map((test) => (
                                  <TableRow key={test.id} className="hover:bg-muted/20">
                                    <TableCell className="font-medium text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <span>{test.name}</span>
                                        <Tooltip>
                                          <TooltipTrigger
                                            render={
                                              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
                                            }
                                          />
                                          <TooltipContent className="text-xs max-w-[220px]">
                                            Standard clinical test for {test.category}. Unit: {test.unit || 'N/A'}.
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-xs">
                                      {test.rawValue} {test.unit}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                      {test.referenceRange || '—'}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                      {test.isAbnormal ? (
                                        <Badge variant="destructive" className="font-mono text-[10px] gap-1">
                                          <AlertTriangle className="h-3 w-3" /> Flagged
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="secondary"
                                          className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 gap-1"
                                        >
                                          <CheckCircle2 className="h-3 w-3" /> Normal
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
              </CardContent>
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
