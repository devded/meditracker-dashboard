'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Code, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { createReport } from '@/services/report-service';
import { extractReportFromFile } from '@/services/parser-service';
import { getPatientUuid } from '@/lib/patient-uuid';

interface UploadDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function UploadDialog({ open, onOpenChange, trigger }: UploadDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [activeTab, setActiveTab] = React.useState<'file' | 'json'>('file');
  const [file, setFile] = React.useState<File | null>(null);
  const [jsonText, setJsonText] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file format. Please upload JPG, PNG, or PDF.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessUpload = async () => {
    const activeUuid = getPatientUuid();
    setIsUploading(true);
    setProgress(15);
    setStatusMessage('Connecting to Gemini 3.6 Flash Parser Service...');

    // Option A: Raw JSON Paste Mode
    if (activeTab === 'json' && jsonText.trim()) {
      try {
        const parsed = JSON.parse(jsonText.trim());
        setProgress(60);
        setStatusMessage('Saving parsed biomarkers to Cloud Firestore...');
        await createReport(parsed, activeUuid);
        setProgress(100);

        setTimeout(() => {
          setIsUploading(false);
          setOpen(false);
          setJsonText('');
          setProgress(0);
          toast.success('Gemini AI Report Processed & Saved', {
            description: `Saved to Cloud Firestore under Patient UUID: ${activeUuid}`,
          });
          window.dispatchEvent(new CustomEvent('patient_uuid_changed', { detail: activeUuid }));
        }, 400);
      } catch (err) {
        setIsUploading(false);
        toast.error('Invalid JSON payload', {
          description: 'Please ensure valid Gemini 3.6 Flash parsed JSON format.',
        });
      }
      return;
    }

    // Option B: Real Live 3rd-Party Extraction via https://medparser.vercel.app/extract
    if (!file) return;

    try {
      setProgress(35);
      setStatusMessage('Extracting text & quantitative parameters with Gemini 3.6 Flash...');
      
      const extractedResult = await extractReportFromFile(file);
      
      setProgress(75);
      setStatusMessage('Persisting extracted report payload into Cloud Firestore...');

      const savedReport = await createReport(extractedResult, activeUuid);
      
      setProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setOpen(false);
        setFile(null);
        setProgress(0);
        toast.success('Diagnostic Report Extracted & Saved', {
          description: `Extracted ${savedReport.tests.length} tests for Patient UUID: ${activeUuid}`,
        });
        window.dispatchEvent(new CustomEvent('patient_uuid_changed', { detail: activeUuid }));
      }, 400);
    } catch (error: any) {
      console.error('MedParser extraction error:', error);
      setIsUploading(false);
      toast.error('Extraction Failed', {
        description: error?.message || 'Unable to process diagnostic report with MedParser API.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as any} />}
      <DialogContent className="sm:max-w-[540px] rounded-3xl p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold font-sans text-foreground">
            <Sparkles className="h-5 w-5 text-emerald-500" /> Upload Diagnostic Lab Report
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload your lab test image/PDF. Powered by live <strong>MedParser (Gemini 3.6 Flash)</strong> service.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('file')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'file'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
            }`}
          >
            <UploadCloud className="size-3.5" /> File Upload (MedParser)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'json'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="size-3.5 text-emerald-500" /> Paste Gemini JSON
          </button>
        </div>

        <div className="space-y-4 py-2">
          {activeTab === 'file' ? (
            !file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.jpg,.jpeg,.png';
                  input.onchange = (e: any) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
              >
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-500">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-xs text-foreground">
                    Drag & drop report file here or <span className="text-emerald-500 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports clear diagnostic scans (JPG, PNG, JPEG) or digital PDF files
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-[10px] font-mono rounded-full">PDF</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono rounded-full">JPG</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono rounded-full">PNG</Badge>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs truncate max-w-[280px] text-foreground">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || 'Document'}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs rounded-xl text-muted-foreground hover:text-foreground"
                      onClick={() => setFile(null)}
                    >
                      Change
                    </Button>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-500 truncate max-w-[340px]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> {statusMessage}
                      </span>
                      <span className="font-mono">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full" />
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground font-mono">Paste Gemini 3.6 Flash JSON Payload:</label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='Paste raw JSON payload (e.g. { "success": true, "model_used": "gemini-3.6-flash", "data": { ... } })'
                className="w-full h-44 rounded-2xl p-3 font-mono text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              All extracted reports automatically persist to Cloud Firestore for Patient UUID: <strong className="text-foreground font-mono">{getPatientUuid()}</strong>.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading} className="rounded-xl text-xs font-semibold">
            Cancel
          </Button>
          <Button
            onClick={handleProcessUpload}
            disabled={isUploading || (activeTab === 'file' && !file) || (activeTab === 'json' && !jsonText.trim())}
            className="min-w-[150px] rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 text-xs font-bold shadow-xs"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" /> Extracting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Extract & Save
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
