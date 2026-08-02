/**
 * Unit normalisation for chart display.
 *
 * Different labs report the same biomarker in different units — WBC in
 * "/cumm" vs "K / µL" (×10³), MCV in "fl" vs "fL", Creatinine in "mg/dl"
 * vs "mg/dL", etc.
 *
 * This module picks a **target unit** for each biomarker name and converts
 * incoming values on the fly for charting. The stored data is never mutated.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * HOW IT WORKS
 * ──────────────────────────────────────────────────────────────────────────────
 * 1. Normalise unit strings (trim, lowercase, collapse aliases like "µl" / "ul").
 * 2. Look up (biomarkerName, normalisedUnit) → conversion factor + target unit.
 * 3. Return { value, unit } ready for the chart.
 *
 * If no conversion is found the value passes through unchanged.
 */

// ─── Unit string normalisation ───────────────────────────────────────────────
function normaliseUnitString(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    // Normalise micro-symbol variants
    .replace(/[µμ]/g, 'u')
    // Strip trailing dots
    .replace(/\.+$/, '');
}

// ─── Conversion tables ──────────────────────────────────────────────────────
// Key: "biomarkerName|fromUnit" (both lowercased + normalised)
// Value: { factor, targetUnit }
//   convertedValue = originalValue * factor
//   targetUnit is the display string for the chart axis / tooltip

interface Conversion {
  factor: number;
  targetUnit: string;
}

const CONVERSIONS: Record<string, Conversion> = {
  // ── WBC: /cumm → K/µL  (÷1000) ────────────────────────────────────────────
  'total wbc|/cumm':                  { factor: 1 / 1000, targetUnit: 'K/µL' },
  'total wbc|k / ul':                 { factor: 1,        targetUnit: 'K/µL' },
  'total wbc|k/ul':                   { factor: 1,        targetUnit: 'K/µL' },
  'total wbc|x10^3/ul':              { factor: 1,        targetUnit: 'K/µL' },
  'total wbc|10^3/ul':               { factor: 1,        targetUnit: 'K/µL' },
  'total wbc|thou/ul':               { factor: 1,        targetUnit: 'K/µL' },

  // ── Platelets: /cumm → K/µL  (÷1000) ──────────────────────────────────────
  'total platelet count|/cumm':       { factor: 1 / 1000, targetUnit: 'K/µL' },
  'total platelet count|k / ul':      { factor: 1,        targetUnit: 'K/µL' },
  'total platelet count|k/ul':        { factor: 1,        targetUnit: 'K/µL' },
  'total platelet count|x10^3/ul':   { factor: 1,        targetUnit: 'K/µL' },
  'total platelet count|lac/ul':     { factor: 100,      targetUnit: 'K/µL' }, // lakh = 100K
  'total platelet count|lakh/ul':    { factor: 100,      targetUnit: 'K/µL' },

  // ── RBC: million/µl and m/uL are the same; /HPF is urine (excluded) ───────
  'total rbc|million/ul':             { factor: 1,        targetUnit: 'M/µL' },
  'total rbc|m/ul':                   { factor: 1,        targetUnit: 'M/µL' },
  'total rbc|x10^6/ul':             { factor: 1,        targetUnit: 'M/µL' },
  'total rbc|mill/ul':               { factor: 1,        targetUnit: 'M/µL' },

  // ── Differentials: prefer % (absolute counts in K/µL are a different axis) ─
  'neutrophils|%':                    { factor: 1,        targetUnit: '%' },
  'neutrophils|k / ul':              { factor: 1,        targetUnit: 'K/µL' },
  'neutrophils|k/ul':                { factor: 1,        targetUnit: 'K/µL' },

  'lymphocytes|%':                    { factor: 1,        targetUnit: '%' },
  'lymphocytes|k / ul':              { factor: 1,        targetUnit: 'K/µL' },
  'lymphocytes|k/ul':                { factor: 1,        targetUnit: 'K/µL' },

  'monocytes|%':                      { factor: 1,        targetUnit: '%' },
  'monocytes|k / ul':                { factor: 1,        targetUnit: 'K/µL' },
  'monocytes|k/ul':                  { factor: 1,        targetUnit: 'K/µL' },

  'eosinophils|%':                    { factor: 1,        targetUnit: '%' },
  'eosinophils|k / ul':              { factor: 1,        targetUnit: 'K/µL' },
  'eosinophils|k/ul':                { factor: 1,        targetUnit: 'K/µL' },

  'basophils|%':                      { factor: 1,        targetUnit: '%' },
  'basophils|k / ul':                { factor: 1,        targetUnit: 'K/µL' },
  'basophils|k/ul':                  { factor: 1,        targetUnit: 'K/µL' },

  // ── Case normalisation ─────────────────────────────────────────────────────
  'creatinine|mg/dl':                 { factor: 1,        targetUnit: 'mg/dL' },
  'mcv|fl':                           { factor: 1,        targetUnit: 'fL' },
  'mpv|fl':                           { factor: 1,        targetUnit: 'fL' },
  'rdw-sd|fl':                        { factor: 1,        targetUnit: 'fL' },
  'pdw|fl':                           { factor: 1,        targetUnit: 'fL' },
  'haemoglobin|gm/dl':               { factor: 1,        targetUnit: 'g/dL' },
  'haemoglobin|gms/dl':              { factor: 1,        targetUnit: 'g/dL' },
  'haemoglobin|g/dl':                { factor: 1,        targetUnit: 'g/dL' },
  'mchc|gm/dl':                      { factor: 1,        targetUnit: 'g/dL' },
  'mchc|g/dl':                       { factor: 1,        targetUnit: 'g/dL' },

  // ── Fasting / PP blood sugar: mmol/l casing ────────────────────────────────
  'fasting blood sugar|mmol/l':       { factor: 1,        targetUnit: 'mmol/L' },
  'post-prandial blood sugar|mmol/l': { factor: 1,        targetUnit: 'mmol/L' },
  'glucose|mmol/l':                   { factor: 1,        targetUnit: 'mmol/L' },
  'glucose|mg/dl':                    { factor: 1,        targetUnit: 'mg/dL' },

  // ── ESR: strip trailing dot ────────────────────────────────────────────────
  'esr|mm':                           { factor: 1,        targetUnit: 'mm/hr' },
  'esr|mm/hr':                        { factor: 1,        targetUnit: 'mm/hr' },
  'esr|mm/1st hr':                    { factor: 1,        targetUnit: 'mm/hr' },
};

/**
 * For differentials that come in both "%" and "K/µL", we need to pick one
 * unit family per biomarker per dataset. This returns the dominant unit
 * (the one most data points use).
 */
export function getDominantUnit(
  biomarkerName: string,
  dataPoints: { unit: string }[]
): string {
  const counts = new Map<string, number>();
  for (const dp of dataPoints) {
    const norm = normaliseUnitString(dp.unit);
    counts.set(norm, (counts.get(norm) || 0) + 1);
  }
  let best = '';
  let bestCount = 0;
  for (const [unit, count] of counts) {
    if (count > bestCount) {
      best = unit;
      bestCount = count;
    }
  }
  return best;
}

export interface NormalisedPoint {
  /** Value converted to the target unit (for chart Y-axis). */
  value: number;
  /** Consistent display unit string. */
  unit: string;
  /** Original value, untouched (for tooltip display). */
  originalValue: number;
  /** Original unit, untouched. */
  originalUnit: string;
  /** True if the value was converted (factor ≠ 1 or unit string changed). */
  wasConverted: boolean;
}

/**
 * Normalise a single data point's value + unit for chart display.
 *
 * The stored data is never mutated — this returns a new object describing
 * how to render the point. Points whose unit doesn't match the dominant
 * unit family are excluded (returns null) to avoid mixing axes.
 */
export function normaliseForChart(
  biomarkerName: string,
  value: number,
  unit: string,
  dominantUnit?: string,
): NormalisedPoint | null {
  const normUnit = normaliseUnitString(unit);
  const key = `${biomarkerName.toLowerCase()}|${normUnit}`;
  const conversion = CONVERSIONS[key];

  const targetUnit = conversion?.targetUnit ?? unit;
  const factor = conversion?.factor ?? 1;
  const convertedValue = value * factor;

  // If a dominant unit is specified, only include points that normalise to it.
  if (dominantUnit) {
    const normDominant = normaliseUnitString(dominantUnit);
    const dominantKey = `${biomarkerName.toLowerCase()}|${normDominant}`;
    const dominantConversion = CONVERSIONS[dominantKey];
    const dominantTarget = dominantConversion?.targetUnit ?? dominantUnit;

    if (targetUnit.toLowerCase() !== dominantTarget.toLowerCase()) {
      return null; // Different unit family — skip this point
    }
  }

  return {
    value: convertedValue,
    unit: targetUnit,
    originalValue: value,
    originalUnit: unit,
    wasConverted: factor !== 1 || targetUnit !== unit,
  };
}
