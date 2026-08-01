'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getReports } from '@/services/report-service';
import { Report } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Search,
  Eye,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  Layers,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadDialog } from '@/components/upload-dialog';

function getCategoryTitle(report: Report) {
  const categories = Array.from(new Set(report.tests.map((t) => t.category).filter(Boolean)));
  if (categories.length === 0) return 'Diagnostic Test Panel';
  if (categories.length === 1) return `${categories[0]} Panel`;
  if (categories.length === 2) return `${categories[0]} & ${categories[1]} Panel`;
  return `${categories.slice(0, 2).join(' & ')} (+${categories.length - 2} Panel)`;
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialAbnormal = searchParams.get('filter') === 'abnormal';

  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLab, setSelectedLab] = React.useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>('all');
  const [filterAbnormalOnly, setFilterAbnormalOnly] = React.useState<boolean>(initialAbnormal);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  // Track expanded state of individual report detail panels (default ALL COLLAPSED/HIDDEN)
  const [expandedReports, setExpandedReports] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (searchParams.get('filter') === 'abnormal') {
      setFilterAbnormalOnly(true);
    }
  }, [searchParams]);

  React.useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      const initialExpanded: Record<string, boolean> = {};
      data.forEach((r) => {
        initialExpanded[r.id] = false;
      });
      setExpandedReports(initialExpanded);
      setLoading(false);
    });
  }, []);

  const toggleReportExpand = (id: string) => {
    setExpandedReports((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const labs = React.useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.labName)));
  }, [reports]);

  const doctors = React.useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.doctorName)));
  }, [reports]);

  const filteredReports = React.useMemo(() => {
    return reports
      .filter((report) => {
        const matchesQuery =
          report.labName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.clinicalSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.tests.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesLab = selectedLab === 'all' || report.labName === selectedLab;
        const matchesDoctor = selectedDoctor === 'all' || report.doctorName === selectedDoctor;
        
        const hasAbnormal = report.tests.some((t) => t.isAbnormal);
        const matchesAbnormal = !filterAbnormalOnly || hasAbnormal;

        return matchesQuery && matchesLab && matchesDoctor && matchesAbnormal;
      })
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }, [reports, searchQuery, selectedLab, selectedDoctor, filterAbnormalOnly]);

  // Group filtered reports by Date
  const groupedReports = React.useMemo(() => {
    const groups: { dateKey: string; formattedDate: string; items: Report[] }[] = [];
    
    filteredReports.forEach((report) => {
      const dateKey = report.formattedDate;
      let existingGroup = groups.find((g) => g.dateKey === dateKey);
      if (!existingGroup) {
        existingGroup = { dateKey, formattedDate: report.formattedDate, items: [] };
        groups.push(existingGroup);
      }
      existingGroup.items.push(report);
    });
    
    return groups;
  }, [filteredReports]);

  const handleNoOpAction = (actionName: string, reportId: string) => {
    toast.info(`${actionName} action triggered`, {
      description: `Report ${reportId} - UI mock shell handler executed cleanly.`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground font-sans">
            Diagnostic Lab Reports <FileText className="h-5 w-5 text-emerald-500" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lab reports grouped by date and categorized by test panel. Click any report to expand full test parameters and values.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2 shadow-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 text-xs font-bold rounded-xl h-10 px-4">
          <Plus className="h-4 w-4" /> Upload New Report
        </Button>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Filter Controls Card */}
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search test panel category (e.g. Hematology, Hormone), physician, lab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
              />
            </div>

            {/* Lab Filter */}
            <Select value={selectedLab} onValueChange={(val) => setSelectedLab(val || 'all')}>
              <SelectTrigger className="w-full md:w-[200px] h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <SelectValue placeholder="All Diagnostic Labs" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Diagnostic Labs</SelectItem>
                {labs.map((lab) => (
                  <SelectItem key={lab} value={lab} className="text-xs truncate">
                    {lab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Doctor Filter */}
            <Select value={selectedDoctor} onValueChange={(val) => setSelectedDoctor(val || 'all')}>
              <SelectTrigger className="w-full md:w-[200px] h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <SelectValue placeholder="All Physicians" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Physicians</SelectItem>
                {doctors.map((doc) => (
                  <SelectItem key={doc} value={doc} className="text-xs truncate">
                    {doc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Abnormal Only Toggle Button */}
            <Button
              variant={filterAbnormalOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterAbnormalOnly((prev) => !prev)}
              className="h-9 text-xs gap-1.5 shrink-0 rounded-xl font-semibold"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {filterAbnormalOnly ? 'Abnormal Only' : 'Filter Abnormal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date-Grouped Reports List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 p-12 text-center space-y-3 rounded-3xl">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-bold text-sm text-foreground">No lab reports match your search query.</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
            onClick={() => {
              setSearchQuery('');
              setSelectedLab('all');
              setSelectedDoctor('all');
              setFilterAbnormalOnly(false);
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedReports.map((group) => (
            <div key={group.dateKey} className="space-y-4">
              {/* Date Group Section Banner */}
              <div className="flex items-center gap-3 px-2 pt-2">
                <div className="size-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-2xs">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground font-mono">
                    {group.formattedDate}
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {group.items.length} {group.items.length === 1 ? 'Diagnostic Test Panel' : 'Separate Test Panels on this date'}
                  </p>
                </div>
              </div>

              {/* Individual Test Panel Cards for this Date */}
              <div className="space-y-4 pl-2 sm:pl-4">
                {group.items.map((report) => {
                  const abnormalTests = report.tests.filter((t) => t.isAbnormal);
                  const isExpanded = expandedReports[report.id] ?? false;
                  const categoryTitle = getCategoryTitle(report);

                  return (
                    <Card
                      key={report.id}
                      className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden rounded-3xl transition-all"
                    >
                      {/* Sleek Minimal Collapsed Header Row Focused on Category Title & Status */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-extrabold text-base text-foreground flex items-center gap-2">
                              <Layers className="size-4 text-emerald-500" />
                              {categoryTitle}
                            </span>
                            {abnormalTests.length > 0 ? (
                              <Badge variant="destructive" className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-none">
                                <AlertTriangle className="size-3 mr-1" /> {abnormalTests.length} Flagged
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-none">
                                <CheckCircle2 className="size-3 mr-1" /> All Normal
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground font-mono font-medium pt-0.5">
                            <span className="text-foreground font-bold">{report.tests.length} Biomarkers Monitored</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleReportExpand(report.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                          >
                            {isExpanded ? (
                              <>
                                <span>Hide Test Values</span>
                                <ChevronUp className="size-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Show Test Values ({report.tests.length})</span>
                                <ChevronDown className="size-3.5" />
                              </>
                            )}
                          </button>

                          <Link href={`/reports/${report.id}`}>
                            <button
                              className="size-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors"
                              title="Full Page Inspection"
                            >
                              <Eye className="size-4 text-emerald-500" />
                            </button>
                          </Link>

                          <button
                            onClick={() => handleNoOpAction('Download PDF', report.id)}
                            className="size-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors"
                            title="Download PDF"
                          >
                            <Download className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section: Contains Lab Center, Physician, Patient ID, Clinical Summary, and Biomarker Table */}
                      {isExpanded && (
                        <div className="p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                          {/* Extra Report Metadata Card */}
                          <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                              <Building2 className="size-4 text-emerald-500 shrink-0" />
                              <span>{report.labName}</span>
                            </div>

                            <div className="flex items-center gap-4 text-muted-foreground font-medium flex-wrap">
                              <span className="flex items-center gap-1.5 text-foreground">
                                <User className="size-3.5 text-muted-foreground" /> {report.doctorName}
                              </span>
                              <span>•</span>
                              <span className="font-mono">Patient: <strong className="text-foreground">{report.patientName}</strong> ({report.patientId})</span>
                            </div>
                          </div>

                          {/* Clinical Observation Note */}
                          {report.clinicalSummary && (
                            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs leading-relaxed space-y-1">
                              <span className="font-bold text-foreground font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                <Stethoscope className="size-3.5 text-emerald-500" /> Clinical Observation Summary:
                              </span>
                              <p className="text-muted-foreground pl-5">{report.clinicalSummary}</p>
                            </div>
                          )}

                          {/* Extracted Test Values Grid Table */}
                          <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-zinc-200/60 dark:border-zinc-800 text-muted-foreground font-semibold bg-zinc-50/80 dark:bg-zinc-900">
                                  <th className="py-2.5 px-3">Test Parameter</th>
                                  <th className="py-2.5 px-3">Category</th>
                                  <th className="py-2.5 px-3">Observed Value</th>
                                  <th className="py-2.5 px-3">Reference Range</th>
                                  <th className="py-2.5 px-3 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                                {report.tests.map((t, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60 transition-colors">
                                    <td className="py-2.5 px-3 font-bold text-foreground">
                                      {t.name}
                                    </td>
                                    <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                                      {t.category}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-extrabold text-sm">
                                      <span className={t.isAbnormal ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                        {t.rawValue} <span className="text-xs font-normal text-muted-foreground">{t.unit}</span>
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-muted-foreground text-[11px]">
                                      {t.referenceRange || 'Standard'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {t.isAbnormal ? (
                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                                          <AlertTriangle className="size-3" /> Flagged
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                          <CheckCircle2 className="size-3" /> Optimal
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
      <ReportsContent />
    </React.Suspense>
  );
}
