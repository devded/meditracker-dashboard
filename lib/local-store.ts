import fs from 'fs';
import path from 'path';
import { ApiReport, Report } from '@/types';
import { mapReport } from '@/utils/map-report';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'reports-store.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({}), 'utf-8');
  }
}

function readAllStore(): Record<string, Record<string, ApiReport>> {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    return {};
  }
}

function writeAllStore(store: Record<string, Record<string, ApiReport>>) {
  try {
    ensureDataFile();
    fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local report store:', err);
  }
}

export function getLocalReports(patientUuid: string): Report[] {
  const store = readAllStore();
  const userReports = store[patientUuid] || {};
  const list = Object.entries(userReports).map(([id, apiReport]) => {
    const mapped = mapReport(apiReport, id);
    mapped.patientId = patientUuid;
    return mapped;
  });

  return list.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
}

export function getLocalReportById(reportId: string, patientUuid: string): Report | null {
  const store = readAllStore();
  const userReports = store[patientUuid] || {};
  const apiReport = userReports[reportId];
  if (!apiReport) return null;
  const mapped = mapReport(apiReport, reportId);
  mapped.patientId = patientUuid;
  return mapped;
}

export function saveLocalReport(apiReport: ApiReport, patientUuid: string, reportId: string): Report {
  const store = readAllStore();
  if (!store[patientUuid]) {
    store[patientUuid] = {};
  }

  apiReport.patient_id = patientUuid;
  store[patientUuid][reportId] = apiReport;
  writeAllStore(store);

  const mapped = mapReport(apiReport, reportId);
  mapped.patientId = patientUuid;
  return mapped;
}

export function deleteLocalReport(reportId: string, patientUuid: string): boolean {
  const store = readAllStore();
  if (store[patientUuid] && store[patientUuid][reportId]) {
    delete store[patientUuid][reportId];
    writeAllStore(store);
    return true;
  }
  return false;
}
