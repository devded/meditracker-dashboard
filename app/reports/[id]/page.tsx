'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getReportById } from '@/services/report-service';
import { Report, Test } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ArrowLeft,
  FileText,
  Search,
  Download,
  Stethoscope,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [filterAbnormal, setFilterAbnormal] = React.useState<boolean>(false);
  const [sortField, setSortField] = React.useState<'name' | 'category' | 'status'>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  React.useEffect(() => {
    if (id) {
      getReportById(id).then((data) => {
        setReport(data);
        setLoading(false);
      });
    }
  }, [id]);

  const categories = React.useMemo(() => {
    if (!report) return [];
    return Array.from(new Set(report.tests.map((t) => t.category)));
  }, [report]);

  const filteredTests = React.useMemo(() => {
    if (!report) return [];
    return report.tests
      .filter((test) => {
        const matchesQuery =
          test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
        const matchesAbnormal = !filterAbnormal || test.isAbnormal;
        return matchesQuery && matchesCategory && matchesAbnormal;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortField === 'category') {
          comp = a.category.localeCompare(b.category);
        } else if (sortField === 'status') {
          comp = (a.isAbnormal ? 1 : 0) - (b.isAbnormal ? 1 : 0);
        }
        return sortDirection === 'desc' ? -comp : comp;
      });
  }, [report, searchQuery, selectedCategory, filterAbnormal, sortField, sortDirection]);

  const toggleSort = (field: 'name' | 'category' | 'status') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    const headers = ['Test Name', 'Value', 'Unit', 'Reference Range', 'Category', 'Status'];
    const rows = report.tests.map((t) => [
      `"${t.name}"`,
      `"${t.rawValue}"`,
      `"${t.unit}"`,
      `"${t.referenceRange || '—'}"`,
      `"${t.category}"`,
      t.isAbnormal ? 'Abnormal' : 'Normal',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.patientName}_${report.formattedDate}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV Report Exported', {
      description: `Saved ${report.tests.length} tests to CSV.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[280px] rounded-3xl" />
          <Skeleton className="h-[280px] rounded-3xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center p-12 space-y-4">
        <h2 className="text-xl font-bold">Report Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested diagnostic report ID does not exist.</p>
        <Button onClick={() => router.push('/reports')} className="rounded-xl">Back to Reports</Button>
      </div>
    );
  }

  const abnormalCount = report.tests.filter((t) => t.isAbnormal).length;
  const normalCount = report.tests.length - abnormalCount;

  const statusData = [
    { name: 'Normal', count: normalCount, fill: '#10b981' },
    { name: 'Abnormal', count: abnormalCount, fill: '#f43f5e' },
  ];

  const categoryBreakdown = categories.map((cat) => ({
    category: cat,
    count: report.tests.filter((t) => t.category === cat).length,
  }));

  const chartConfig = {
    count: { label: 'Biomarkers', color: '#0d9488' },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/reports')} className="gap-1.5 text-xs rounded-xl font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Reports List
        </Button>
        <Button size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs shadow-xs rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold px-3.5 h-9">
          <Download className="h-3.5 w-3.5" /> Export CSV Data
        </Button>
      </div>

      {/* Patient & Report Banner Card */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h1 className="text-xl font-extrabold text-foreground font-sans">{report.labName}</h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Attending Physician: <span className="font-semibold text-foreground">{report.doctorName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs rounded-full border-slate-200 dark:border-slate-800 text-foreground px-3 py-1">
                <Calendar className="h-3 w-3 mr-1.5 text-emerald-600 dark:text-emerald-400" /> {report.formattedDate}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs rounded-full px-3 py-1">
                ID: {report.patientId}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-muted-foreground uppercase font-mono font-semibold">Patient Name</p>
              <p className="text-base font-extrabold font-mono text-foreground mt-0.5">{report.patientName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-mono font-semibold">Normal Tests</p>
              <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{normalCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
              <p className="text-[11px] text-rose-600 dark:text-rose-400 uppercase font-mono font-semibold">Abnormal Flags</p>
              <p className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-0.5">{abnormalCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-muted-foreground uppercase font-mono font-semibold">Total Panel Tests</p>
              <p className="text-xl font-extrabold font-mono text-foreground mt-0.5">{report.tests.length}</p>
            </div>
          </div>

          {/* Clinical Summary */}
          {report.clinicalSummary && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Clinical Summary & Observations</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {report.clinicalSummary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Report Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Normal vs Abnormal Chart */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-2 shadow-xs rounded-3xl">
          <div>
            <h3 className="text-sm font-bold text-foreground">Test Status Distribution</h3>
            <p className="text-xs text-muted-foreground">Normal range vs abnormal flag ratio</p>
          </div>
          <div className="h-[200px] w-full pt-2">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={statusData} dataKey="count" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={4}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        </Card>

        {/* Category Breakdown Chart */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-2 shadow-xs rounded-3xl">
          <div>
            <h3 className="text-sm font-bold text-foreground">Category Breakdown</h3>
            <p className="text-xs text-muted-foreground">Biomarkers grouped by medical specialty</p>
          </div>
          <div className="h-[200px] w-full pt-2">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200/60 dark:stroke-slate-800" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground font-mono" />
                <YAxis tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground font-mono" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>
      </div>

      {/* Tests Data Table */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Individual Test Results</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Detailed quantitative breakdown parsed from lab report payload
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter test name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 w-[180px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
              />
            </div>

            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || 'all')}>
              <SelectTrigger className="h-9 w-[140px] text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={filterAbnormal ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterAbnormal((prev) => !prev)}
              className="h-9 text-xs gap-1 rounded-xl font-semibold"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {filterAbnormal ? 'Abnormal' : 'All Flags'}
            </Button>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('name')} className="text-xs font-semibold p-0 h-auto gap-1">
                      Biomarker Name <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">Observed Value</TableHead>
                  <TableHead className="text-xs font-semibold">Unit</TableHead>
                  <TableHead className="text-xs font-semibold">Standard Reference Range</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('category')} className="text-xs font-semibold p-0 h-auto gap-1">
                      Category <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right pr-6">
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('status')} className="text-xs font-semibold p-0 h-auto gap-1">
                      Status <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                      No biomarker tests match your current filter settings.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map((test) => (
                    <TableRow key={test.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <TableCell className="font-bold text-xs text-foreground">
                        {test.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-extrabold text-foreground">
                        {test.rawValue}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {test.unit || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {test.referenceRange ? test.referenceRange : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono rounded-full">
                          {test.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {test.isAbnormal ? (
                          <Badge variant="destructive" className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-none">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Abnormal
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-none">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Normal
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
