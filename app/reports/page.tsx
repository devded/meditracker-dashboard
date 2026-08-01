'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getReports } from '@/services/report-service';
import { Report } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search, Eye, Download, Trash2, ArrowUpDown, Plus, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { UploadDialog } from '@/components/upload-dialog';

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialAbnormal = searchParams.get('filter') === 'abnormal';

  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLab, setSelectedLab] = React.useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>('all');
  const [filterAbnormalOnly, setFilterAbnormalOnly] = React.useState<boolean>(initialAbnormal);
  const [sortField, setSortField] = React.useState<'date' | 'lab' | 'abnormal'>('date');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [uploadOpen, setUploadOpen] = React.useState(false);

  React.useEffect(() => {
    if (searchParams.get('filter') === 'abnormal') {
      setFilterAbnormalOnly(true);
    }
  }, [searchParams]);

  React.useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

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
          report.clinicalSummary.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLab = selectedLab === 'all' || report.labName === selectedLab;
        const matchesDoctor = selectedDoctor === 'all' || report.doctorName === selectedDoctor;
        
        const hasAbnormal = report.tests.some((t) => t.isAbnormal);
        const matchesAbnormal = !filterAbnormalOnly || hasAbnormal;

        return matchesQuery && matchesLab && matchesDoctor && matchesAbnormal;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'date') {
          comp = new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime();
        } else if (sortField === 'lab') {
          comp = a.labName.localeCompare(b.labName);
        } else if (sortField === 'abnormal') {
          const abA = a.tests.filter((t) => t.isAbnormal).length;
          const abB = b.tests.filter((t) => t.isAbnormal).length;
          comp = abA - abB;
        }
        return sortDirection === 'desc' ? -comp : comp;
      });
  }, [reports, searchQuery, selectedLab, selectedDoctor, filterAbnormalOnly, sortField, sortDirection]);

  // Group filtered reports by date
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

  const toggleSort = (field: 'date' | 'lab' | 'abnormal') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleNoOpAction = (actionName: string, reportId: string) => {
    toast.info(`${actionName} action triggered`, {
      description: `Report ${reportId} - UI mock shell handler executed cleanly.`,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Diagnostic Lab Reports <FileText className="h-5 w-5 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, filter, and inspect structured medical lab reports grouped by date.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2 shadow-xs">
          <Plus className="h-4 w-4" /> Upload New Report
        </Button>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Filter Controls Card */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lab name, physician, clinical summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Lab Filter */}
            <Select value={selectedLab} onValueChange={(val) => setSelectedLab(val || 'all')}>
              <SelectTrigger className="w-full md:w-[200px] h-9 text-xs">
                <SelectValue placeholder="All Diagnostic Labs" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger className="w-full md:w-[200px] h-9 text-xs">
                <SelectValue placeholder="All Physicians" />
              </SelectTrigger>
              <SelectContent>
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
              className="h-9 text-xs gap-1.5 shrink-0"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {filterAbnormalOnly ? 'Abnormal Only Active' : 'Filter Abnormal Only'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table Card */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Reports Archive</CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredReports.length} of {reports.length} diagnostic reports grouped across {groupedReports.length} dates
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="font-medium text-sm">No reports match your current filter parameters.</p>
              <p className="text-xs text-muted-foreground">Try clearing filters or search query.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLab('all');
                  setSelectedDoctor('all');
                  setFilterAbnormalOnly(false);
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[150px]">
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('date')} className="text-xs font-semibold p-0 h-auto gap-1">
                        Report Date <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('lab')} className="text-xs font-semibold p-0 h-auto gap-1">
                        Diagnostic Center <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-xs font-semibold">Attending Doctor</TableHead>
                    <TableHead className="text-xs font-semibold">Patient</TableHead>
                    <TableHead className="text-center text-xs font-semibold">Total Tests</TableHead>
                    <TableHead className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('abnormal')} className="text-xs font-semibold p-0 h-auto gap-1">
                        Abnormal Flags <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedReports.map((group) => (
                    <React.Fragment key={group.dateKey}>
                      {/* Date Group Header Row */}
                      <TableRow className="bg-slate-100/80 dark:bg-slate-800/60 font-bold border-t border-slate-200/80 dark:border-slate-700">
                        <TableCell colSpan={7} className="py-2.5 px-4">
                          <div className="flex items-center gap-2 text-xs text-foreground font-mono">
                            <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>{group.formattedDate}</span>
                            <span className="text-[11px] font-normal text-muted-foreground">
                              ({group.items.length} {group.items.length === 1 ? 'report' : 'reports'} uploaded)
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Individual Report Sub-Rows for this Date */}
                      {group.items.map((report) => {
                        const abnormalCount = report.tests.filter((t) => t.isAbnormal).length;
                        return (
                          <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs font-medium pl-6 text-muted-foreground">
                              {report.formattedDate}
                            </TableCell>
                            <TableCell className="font-medium text-xs">
                              {report.labName}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {report.doctorName}
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                              {report.patientName} ({report.patientId})
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs">
                              {report.tests.length}
                            </TableCell>
                            <TableCell className="text-center">
                              {abnormalCount > 0 ? (
                                <Badge variant="destructive" className="font-mono text-[11px] gap-1">
                                  <AlertTriangle className="h-3 w-3" /> {abnormalCount} Abnormal
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> All Normal
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/reports/${report.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="View Full Report">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  title="Download Raw Report"
                                  onClick={() => handleNoOpAction('Download', report.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  title="Delete Report"
                                  onClick={() => handleNoOpAction('Delete', report.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
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
