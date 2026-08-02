'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getReports, removeReport } from '@/services/report-service';
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
  FileSearch,
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
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadDialog } from '@/components/upload-dialog';
import { usePatientUuid } from '@/lib/patient-uuid';

function getCategoryTitle(report: Report) {
  const categories = Array.from(new Set(report.tests.map((t) => t.category).filter(Boolean)));
  if (categories.length === 0) return 'Diagnostic Test Panel';
  if (categories.length === 1) return `${categories[0]} Panel`;
  if (categories.length === 2) return `${categories[0]} & ${categories[1]} Panel`;
  return `${categories.slice(0, 2).join(' & ')} (+${categories.length - 2} Panel)`;
}

function ReportsContent() {
  const [patientUuid] = usePatientUuid();
  const searchParams = useSearchParams();
  const initialAbnormal = searchParams.get('filter') === 'abnormal';

  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLab, setSelectedLab] = React.useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>('all');
  const [filterAbnormalOnly, setFilterAbnormalOnly] = React.useState<boolean>(initialAbnormal);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  // Track expanded state of individual report detail panels
  const [expandedReports, setExpandedReports] = React.useState<Record<string, boolean>>({});

  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    const data = await getReports(patientUuid);
    setReports(data);
    const initialExpanded: Record<string, boolean> = {};
    data.forEach((r) => {
      initialExpanded[r.id] = false;
    });
    setExpandedReports(initialExpanded);
    setLoading(false);
  }, [patientUuid]);

  React.useEffect(() => {
    if (searchParams.get('filter') === 'abnormal') {
      setFilterAbnormalOnly(true);
    }
  }, [searchParams]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const toggleReportExpand = (id: string) => {
    setExpandedReports((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteReport = async (reportId: string, labName: string) => {
    if (!window.confirm(`Are you sure you want to delete the report from ${labName}?`)) {
      return;
    }

    setDeletingId(reportId);
    try {
      const success = await removeReport(reportId, patientUuid);
      if (success) {
        toast.success('Report Deleted', {
          description: `Removed report from Cloud Firestore for Patient UUID: ${patientUuid}`,
        });
        await fetchReports();
      } else {
        toast.error('Failed to Delete Report');
      }
    } catch (err: any) {
      toast.error('Error deleting report', { description: err?.message });
    } finally {
      setDeletingId(null);
    }
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

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground font-sans">
            Diagnostic Lab Reports <FileText className="h-5 w-5 text-emerald-500" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Historical archive grouped chronologically by test date for Patient UUID: <strong className="text-foreground font-mono">{patientUuid}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <UploadDialog
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            trigger={
              <Button size="sm" className="gap-1.5 shadow-xs rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold px-3.5 h-9">
                <Plus className="h-4 w-4" /> Upload New Report
              </Button>
            }
          />
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by lab, doctor, biomarker name, or clinical summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedLab} onValueChange={(val) => setSelectedLab(val || 'all')}>
              <SelectTrigger className="h-9 w-[150px] text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <SelectValue placeholder="All Labs" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Labs</SelectItem>
                {labs.map((lab) => (
                  <SelectItem key={lab} value={lab} className="text-xs">
                    {lab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDoctor} onValueChange={(val) => setSelectedDoctor(val || 'all')}>
              <SelectTrigger className="h-9 w-[160px] text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="text-xs">All Doctors</SelectItem>
                {doctors.map((docName) => (
                  <SelectItem key={docName} value={docName} className="text-xs">
                    {docName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={filterAbnormalOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterAbnormalOnly((prev) => !prev)}
              className="h-9 text-xs gap-1.5 rounded-xl font-semibold"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {filterAbnormalOnly ? 'Abnormal Only' : 'All Reports'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Reports List grouped by Date */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : groupedReports.length === 0 ? (
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 mx-auto flex items-center justify-center text-muted-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Diagnostic Reports Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No medical reports exist for Patient UUID: <strong className="font-mono">{patientUuid}</strong>. Upload a report using MedParser to get started.
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)} className="rounded-xl text-xs font-bold gap-1.5">
            <Plus className="size-3.5" /> Upload First Report
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedReports.map((group) => (
            <div key={group.dateKey} className="space-y-3">
              {/* Chronological Date Marker Strip */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-foreground font-mono font-bold text-xs border border-zinc-200/60 dark:border-zinc-800 shadow-2xs">
                  <Calendar className="size-3.5 text-emerald-500" />
                  <span>{group.formattedDate}</span>
                </div>
                <div className="h-px flex-1 bg-zinc-200/60 dark:bg-zinc-800" />
                <span className="text-[11px] font-mono text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? 'Report' : 'Reports'}
                </span>
              </div>

              {/* Synchronized Card Rows */}
              <div className="space-y-2.5">
                {group.items.map((report) => {
                  const abnormalTests = report.tests.filter((t) => t.isAbnormal);
                  const isExpanded = expandedReports[report.id] ?? false;
                  const categoryTitle = getCategoryTitle(report);

                  return (
                    <Card
                      key={report.id}
                      className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden rounded-2xl p-0 transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                    >
                      {/* Synchronized Header Bar Row */}
                      <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950">
                        <div className="flex items-center gap-3 flex-wrap min-w-0">
                          <span className="font-bold text-sm text-foreground flex items-center gap-2 truncate">
                            <Layers className="size-4 text-emerald-500 shrink-0" />
                            {categoryTitle}
                          </span>

                          {abnormalTests.length > 0 ? (
                            <Badge variant="destructive" className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-none shrink-0">
                              <AlertTriangle className="size-3 mr-1 inline" /> {abnormalTests.length} Flagged
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-none shrink-0">
                              <CheckCircle2 className="size-3 mr-1 inline" /> Normal
                            </Badge>
                          )}

                          <span className="text-xs font-mono font-medium text-muted-foreground border-l border-zinc-200 dark:border-zinc-800 pl-3 shrink-0">
                            {report.tests.length} Biomarkers
                          </span>
                        </div>

                        {/* Synchronized Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleReportExpand(report.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
                          >
                            {isExpanded ? (
                              <>
                                <span>Hide Details</span>
                                <ChevronUp className="size-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Show Values ({report.tests.length})</span>
                                <ChevronDown className="size-3.5" />
                              </>
                            )}
                          </button>

                          <Link href={`/reports/${report.id}`}>
                            <button
                              className="size-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors"
                              title="Full Page Inspection"
                            >
                              <Eye className="size-3.5 text-emerald-500" />
                            </button>
                          </Link>

                          {report.originalFile ? (
                            <a
                              href={`/api/reports/${report.id}/original?uuid=${encodeURIComponent(patientUuid)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="size-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors"
                              title={`View source document (${report.originalFile.filename})`}
                            >
                              <FileSearch className="size-3.5 text-emerald-500" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="size-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-muted-foreground/40 flex items-center justify-center cursor-not-allowed"
                              title="No source document archived for this report"
                            >
                              <FileSearch className="size-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteReport(report.id, report.labName)}
                            disabled={deletingId === report.id}
                            className="size-8 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center justify-center transition-colors"
                            title="Delete Report"
                          >
                            {deletingId === report.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details Section */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                          {/* Extra Diagnostic Metadata Strip */}
                          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                              <Building2 className="size-4 text-emerald-500 shrink-0" />
                              <span>{report.labName}</span>
                            </div>

                            <div className="flex items-center gap-3 text-muted-foreground font-medium flex-wrap">
                              <span className="flex items-center gap-1.5 text-foreground">
                                <User className="size-3.5 text-muted-foreground" /> {report.doctorName}
                              </span>
                              <span>•</span>
                              <span className="font-mono">Patient: <strong className="text-foreground">{report.patientName}</strong> ({report.patientId})</span>
                            </div>
                          </div>

                          {/* Clinical Observation Note */}
                          {report.clinicalSummary && (
                            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs leading-relaxed space-y-1">
                              <span className="font-bold text-foreground font-mono text-[11px] uppercase tracking-wider flex items-center gap-2">
                                <Stethoscope className="size-4 text-emerald-500" /> Clinical Observation Summary:
                              </span>
                              <p className="text-muted-foreground pl-6">{report.clinicalSummary}</p>
                            </div>
                          )}

                          {/* Extracted Test Values Table */}
                          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-zinc-200/60 dark:border-zinc-800 text-muted-foreground font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900 text-[11px]">
                                  <th className="py-2.5 px-4">Test Parameter</th>
                                  <th className="py-2.5 px-4">Category</th>
                                  <th className="py-2.5 px-4">Observed Value</th>
                                  <th className="py-2.5 px-4">Reference Range</th>
                                  <th className="py-2.5 px-4 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                                {report.tests.map((t, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60 transition-colors">
                                    <td className="py-2.5 px-4 font-bold text-xs sm:text-sm text-foreground">
                                      {t.name}
                                    </td>
                                    <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs">
                                      {t.category}
                                    </td>
                                    <td className="py-2.5 px-4 font-mono font-extrabold text-sm sm:text-base">
                                      <span className={t.isAbnormal ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                        {t.rawValue} <span className="text-xs font-normal text-muted-foreground">{t.unit}</span>
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs">
                                      {t.referenceRange || '—'}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                      {t.isAbnormal ? (
                                        <Badge variant="destructive" className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-none">
                                          Abnormal
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-none">
                                          Normal
                                        </Badge>
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
    <React.Suspense fallback={<Skeleton className="h-96 w-full rounded-3xl" />}>
      <ReportsContent />
    </React.Suspense>
  );
}
