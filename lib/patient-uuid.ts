'use client';

import * as React from 'react';

const STORAGE_KEY = 'meditracker_patient_uuid';
export const DEFAULT_PATIENT_UUID = 'D198349';

export function getPatientUuid(): string {
  if (typeof window === 'undefined') return DEFAULT_PATIENT_UUID;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_PATIENT_UUID;
}

export function setPatientUuid(uuid: string): void {
  if (typeof window === 'undefined') return;
  const cleanUuid = uuid.trim().toUpperCase() || DEFAULT_PATIENT_UUID;
  localStorage.setItem(STORAGE_KEY, cleanUuid);
  window.dispatchEvent(new CustomEvent('patient_uuid_changed', { detail: cleanUuid }));
}

/**
 * Custom React hook for subscribing to active Patient UUID changes.
 */
export function usePatientUuid(): [string, (newUuid: string) => void] {
  const [uuid, setUuidState] = React.useState<string>(DEFAULT_PATIENT_UUID);

  React.useEffect(() => {
    setUuidState(getPatientUuid());

    const handleUuidChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setUuidState(customEvent.detail || getPatientUuid());
    };

    window.addEventListener('patient_uuid_changed', handleUuidChange);
    return () => {
      window.removeEventListener('patient_uuid_changed', handleUuidChange);
    };
  }, []);

  const updateUuid = React.useCallback((newUuid: string) => {
    setPatientUuid(newUuid);
  }, []);

  return [uuid, updateUuid];
}
