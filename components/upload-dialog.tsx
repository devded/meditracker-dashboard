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
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface UploadDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function UploadDialog({ open, onOpenChange, trigger }: UploadDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
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

  const simulateUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setOpen(false);
            setFile(null);
            setProgress(0);
            toast.success('Medical report uploaded & processed successfully', {
              description: 'OCR parsing mock completed: 23 biomarkers extracted.',
              action: {
                label: 'View Report',
                onClick: () => {},
              },
            });
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as any} />}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-primary" /> Upload Medical Lab Report
          </DialogTitle>
          <DialogDescription>
            Upload your lab test document (PDF or image). Our automated parser will map and extract biomarker values automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border/80 hover:border-primary/50 hover:bg-accent/40'
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
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  Drag & drop report file here or <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports clear diagnostic scans or digital PDFs
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="text-[11px] font-mono">PDF</Badge>
                <Badge variant="outline" className="text-[11px] font-mono">JPG</Badge>
                <Badge variant="outline" className="text-[11px] font-mono">PNG</Badge>
                <Badge variant="outline" className="text-[11px] font-mono">JPEG</Badge>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl p-4 bg-card space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[280px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || 'Document'}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setFile(null)}
                  >
                    Change
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-primary">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" /> Parsing document structure & extracting tests...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
            <span>
              This is a UI mock shell. Uploading simulates OCR extraction and seeds data into local state without making external server calls.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={simulateUpload} disabled={!file || isUploading} className="min-w-[110px]">
            {isUploading ? (
              <span className="flex items-center gap-2">Processing...</span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Start Parse
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
