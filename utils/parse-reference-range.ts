export interface ReferenceBounds {
  min: number;
  max: number;
}

export function parseReferenceRange(rangeStr: string | null | undefined): ReferenceBounds | null {
  if (!rangeStr) return null;

  const str = rangeStr.trim();

  // Pattern: "135-145", "3.5-5.1", "11.5-14.5%", "15.0±2.0"
  const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  }

  // Pattern: "15.0±2.0"
  const plusMinusMatch = str.match(/(\d+(?:\.\d+)?)\s*±\s*(\d+(?:\.\d+)?)/);
  if (plusMinusMatch) {
    const base = parseFloat(plusMinusMatch[1]);
    const margin = parseFloat(plusMinusMatch[2]);
    if (!isNaN(base) && !isNaN(margin)) {
      return { min: base - margin, max: base + margin };
    }
  }

  // Pattern: "< 200", "< 150"
  const lessThanMatch = str.match(/<\s*(\d+(?:\.\d+)?)/);
  if (lessThanMatch) {
    const max = parseFloat(lessThanMatch[1]);
    if (!isNaN(max)) {
      return { min: 0, max };
    }
  }

  // Pattern: "> 30", "30-100"
  const greaterThanMatch = str.match(/>\s*(\d+(?:\.\d+)?)/);
  if (greaterThanMatch) {
    const min = parseFloat(greaterThanMatch[1]);
    if (!isNaN(min)) {
      return { min, max: min * 3 };
    }
  }

  return null;
}
