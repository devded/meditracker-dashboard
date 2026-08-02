import { S3Client } from '@aws-sdk/client-s3';

/**
 * S3-compatible client for Tigris (storage.dev), used to archive the original
 * PDF/image each report was extracted from.
 *
 * Server-side only — these credentials must never reach the browser, so nothing
 * here may be imported from a Client Component.
 */

export const S3_BUCKET = process.env.S3_BUCKET || 'meditracker-dev';

const endpoint = process.env.AWS_ENDPOINT_URL_S3 || 'https://t3.storage.dev';
const region = process.env.AWS_REGION || 'auto';

export const isS3Configured = Boolean(
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

export const s3Client = new S3Client({
  region,
  endpoint,
  // Tigris uses virtual-hosted-style addressing, matching S3 defaults.
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
