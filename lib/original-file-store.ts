import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET, isS3Configured } from '@/lib/s3-client';
import { SourceFile } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORIGINALS_DIR = path.join(DATA_DIR, 'originals');

const EXTENSION_BY_TYPE: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

export const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;

export const ALLOWED_ORIGINAL_TYPES = Object.keys(EXTENSION_BY_TYPE);

function extensionFor(contentType: string, filename: string): string {
  const byType = EXTENSION_BY_TYPE[contentType.toLowerCase()];
  if (byType) return byType;
  const byName = path.extname(filename).replace('.', '').toLowerCase();
  return byName || 'bin';
}

/**
 * Content-addressed object key. Hashing the bytes means re-uploading the same
 * document is idempotent rather than accumulating duplicates.
 */
function objectKeyFor(patientUuid: string, sha256: string, extension: string): string {
  return `users/${patientUuid}/originals/${sha256}.${extension}`;
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function saveToS3(
  buffer: Buffer,
  key: string,
  contentType: string,
  filename: string,
  sha256: string
): Promise<void> {
  // Content-addressed, so an existing object is byte-identical — skip the re-upload.
  if (await objectExists(key)) return;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: `inline; filename="${filename.replace(/"/g, '')}"`,
      CacheControl: 'private, max-age=0, no-transform',
      Metadata: {
        sha256,
        'original-filename': encodeURIComponent(filename),
      },
    })
  );
}

function saveToLocalDisk(buffer: Buffer, relativePath: string): void {
  const absolutePath = path.join(ORIGINALS_DIR, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  if (!fs.existsSync(absolutePath)) {
    fs.writeFileSync(absolutePath, buffer);
  }
}

/**
 * Persist the original report document before extraction runs, so that a failed or
 * degraded extraction still leaves the source available to retry against.
 *
 * Writes to Tigris object storage when credentials are present and the bucket is
 * reachable, otherwise falls back to the server-local data directory (mirrors the
 * Firestore -> local-store fallback used for the structured data).
 */
export async function saveOriginalFile(params: {
  buffer: Buffer;
  contentType: string;
  filename: string;
  patientUuid: string;
  extractorModel?: string;
}): Promise<SourceFile> {
  const { buffer, contentType, filename, patientUuid, extractorModel } = params;

  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const extension = extensionFor(contentType, filename);
  const key = objectKeyFor(patientUuid, sha256, extension);

  const base = {
    path: key,
    bucket: S3_BUCKET,
    filename,
    contentType,
    size: buffer.byteLength,
    sha256,
    uploadedAt: new Date().toISOString(),
    extractorModel,
  };

  if (isS3Configured) {
    try {
      await saveToS3(buffer, key, contentType, filename, sha256);
      return { backend: 's3', ...base };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Tigris object storage unavailable, saving original to server local store:', message);
    }
  }

  saveToLocalDisk(buffer, key);
  return { backend: 'local', ...base };
}
