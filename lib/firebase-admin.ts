import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'meditracker-dev-cfaed-firebase-adminsdk-fbsvc-23de478cf1.json');

function initAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || 'meditracker-dev-cfaed',
      });
    }
  } catch (error) {
    console.warn('Firebase Admin SDK service account load warning:', error);
  }

  return initializeApp({
    projectId: 'meditracker-dev-cfaed',
  });
}

export const adminApp = initAdminApp();
export const adminDb = getFirestore(adminApp);
