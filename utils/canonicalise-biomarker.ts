/**
 * Biomarker name canonicalisation.
 *
 * Different labs (and different LLM extractions of the same lab) produce wildly
 * varying names for the same test — "Haemoglobin", "Hemoglobin(Hb%)", "Hb",
 * "S. Creatinine", "S.Creatinine", "Serum Creatinine", etc.
 *
 * This module normalises every test name to a single canonical form so that
 * timeline charts, comparison charts, and deduplication all work correctly.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * HOW IT WORKS
 * ──────────────────────────────────────────────────────────────────────────────
 * 1. Strip parenthesised suffixes, leading "S." / "Serum" / "T." prefixes,
 *    trailing "%", and collapse whitespace.
 * 2. Look up the cleaned string in a hand-curated alias → canonical map.
 * 3. If no alias matches, return the cleaned string as-is (new/unknown tests
 *    pass through unchanged).
 *
 * To add a new alias, just append it to BIOMARKER_ALIASES below.
 */

// ─── Canonical name → known aliases ──────────────────────────────────────────
// The KEY is the canonical display name. VALUES are lowercase aliases that
// should all collapse to that canonical name.
const CANONICAL_GROUPS: Record<string, string[]> = {
  // ── Haematology ────────────────────────────────────────────────────────────
  'Haemoglobin':        ['haemoglobin', 'hemoglobin', 'hb', 'hb%', 'hemoglobin(hb%)', 'hemoglobin (hb%)', 'hemoglobin hb'],
  'HCT':                ['hct', 'hct/pcv', 'pcv', 'haematocrit', 'hematocrit', 'packed cell volume'],
  'MCV':                ['mcv', 'mean corpuscular volume'],
  'MCH':                ['mch', 'mean corpuscular haemoglobin', 'mean corpuscular hemoglobin'],
  'MCHC':               ['mchc', 'mean corpuscular haemoglobin concentration', 'mean corpuscular hemoglobin concentration'],
  'RDW-CV':             ['rdw-cv', 'rdw-cv(%)', 'rdw cv', 'rdw cv(%)', 'rdw', 'red cell distribution width'],
  'RDW-SD':             ['rdw-sd', 'rdw sd'],
  'MPV':                ['mpv', 'mean platelet volume'],
  'PDW':                ['pdw', 'platelet distribution width'],
  'PCT':                ['pct', 'plateletcrit', 'procalcitonin'],
  'P-LCR':              ['p-lcr', 'p-lcc', 'platelet large cell ratio', 'platelet large cell count'],

  'Total Platelet Count':['platelets', 'platelet', 'platelet count', 'plt', 'platelet (plt)', 'total platelet count'],
  'Total WBC':          ['white blood cells', 'wbc', 'total wbc', 'white blood cells (wbcs)', 'total leucocyte count', 'tlc', 'total wbc count'],
  'Total RBC':          ['red blood cells', 'rbc', 'total rbc', 'red blood cells (rbcs)', 'total rbc count', 'erythrocyte count'],

  // ── Differential Count ─────────────────────────────────────────────────────
  'Neutrophils':        ['neutrophils', 'neutrophil', 'neutrophil%', 'neutrophils%', 'neut', 'neut%'],
  'Lymphocytes':        ['lymphocytes', 'lymphocyte', 'lymphocyte%', 'lymphocytes%', 'lymph', 'lymph%'],
  'Monocytes':          ['monocytes', 'monocyte', 'monocyte%', 'monocytes%', 'mono', 'mono%'],
  'Eosinophils':        ['eosinophils', 'eosinophil', 'eosinophil%', 'eosinophils%', 'eos', 'eos%'],
  'Basophils':          ['basophils', 'basophil', 'basophil%', 'basophils%', 'baso', 'baso%'],

  // ── Renal ──────────────────────────────────────────────────────────────────
  'Creatinine':         ['creatinine', 's. creatinine', 's.creatinine', 'serum creatinine', 'sr creatinine', 'blood creatinine'],
  'Urea':               ['urea', 'blood urea', 'bun', 'blood urea nitrogen', 'serum urea'],
  'Uric Acid':          ['uric acid', 'serum uric acid', 's. uric acid'],

  // ── Electrolytes ───────────────────────────────────────────────────────────
  'Sodium':             ['sodium', 'sodium (na)', 'na', 'na+', 's. sodium', 'serum sodium'],
  'Potassium':          ['potassium', 'potassium (k)', 'k', 'k+', 's. potassium', 'serum potassium'],
  'Chloride':           ['chloride', 'chloride (cl)', 'cl', 'cl-', 's. chloride', 'serum chloride'],
  'Calcium':            ['calcium', 'ca', 'ca++', 's. calcium', 'serum calcium', 'total calcium'],
  'Magnesium':          ['magnesium', 'mg', 'mg++', 's. magnesium', 'serum magnesium'],
  'Phosphate':          ['phosphate', 'phosphorus', 's. phosphate', 'serum phosphate', 'inorganic phosphorus'],
  'Bicarbonate':        ['bicarbonate', 'bicarbonate (hco3)', 'hco3', 'hco3-', 'serum bicarbonate'],
  'CO2':                ['co2', 'carbondioxide', 'carbondioxide (co2)', 'carbon dioxide', 'total co2'],

  // ── Glucose / Sugar ────────────────────────────────────────────────────────
  'Fasting Blood Sugar':['fasting blood sugar', 'fasting blood sugar(fbs)', 'fbs', 'fasting glucose', 'fasting blood glucose'],
  'Post-Prandial Blood Sugar': ['2hr after breakfast', 'ppbs', 'post prandial blood sugar', '2 hr pp glucose', '2hr pp glucose', '2 hour post prandial'],
  'Glucose':            ['glucose', 'blood glucose', 'blood sugar', 'sugar', 'random blood sugar', 'rbs', 'random glucose'],

  // ── Liver ──────────────────────────────────────────────────────────────────
  'Albumin':            ['albumin', 'serum albumin', 's. albumin'],
  'Bilirubin':          ['bilirubin', 'total bilirubin', 'serum bilirubin', 's. bilirubin'],

  // ── ESR ────────────────────────────────────────────────────────────────────
  'ESR':                ['esr', 'esr (automated)', 'erythrocyte sedimentation rate', 'esr automated', 'esr (westergren)'],

  // ── Eosinophil Absolute ────────────────────────────────────────────────────
  'Total Eosinophil Count': ['t.cir.eosinophil count (tce)', 'tce', 'total eosinophil count', 'absolute eosinophil count', 'aec'],

  // ── Urinalysis ─────────────────────────────────────────────────────────────
  'Urine Appearance':   ['appearance', 'urine appearance'],
  'Urine Color':        ['color', 'colour', 'urine color', 'urine colour'],
  'Urine pH':           ['reaction (ph)', 'ph', 'urine ph', 'reaction ph'],
  'Specific Gravity':   ['specific gravity', 'urine for specific gravity', 'sp. gravity', 'sp gravity'],
  'Urine Sugar':        ['sugar (urine)', 'urine sugar', 'urine glucose'],
  'Urine Protein':      ['urine protein', 'protein (urine)', 'albumin (urine)'],
  'Urine Ketone':       ['ketone', 'ketone bodies', 'urine ketone'],
  'Urine Bilirubin':    ['bilirubin (urine)', 'urine bilirubin'],
  'Urobilinogen':       ['urobilinogen', 'urine urobilinogen'],
  'Urine Nitrite':      ['nitrite', 'urine nitrite'],
  'Pus Cells':          ['pus cells', 'wbc (urine)', 'urine wbc'],
  'Epithelial Cells':   ['epithelial cells', 'squamous epithelial cells', 'urine epithelial'],
  'RBC (Urine)':        ['rbc (urine)', 'urine rbc', 'red blood cells (urine)'],
  'Hyaline Casts':      ['hyaline casts', 'casts hyaline'],
  'Granular Casts':     ['granular casts', 'casts granular'],
  'Cellular Cast':      ['cellular cast', 'cellular casts'],
  'CUS':                ['cus', 'crystals urine sediment'],
  'Amorphous Phosphate':['amorphous phosphate', 'amorphous phosphates'],
  'Calcium Oxalate':    ['calcium oxalate', 'calcium oxalate crystals'],
  'Triple Phosphate':   ['triple phosphate', 'triple phosphate crystals'],
  'Urates':             ['urates', 'amorphous urates', 'urate crystals'],
  'Sediment':           ['sediment', 'urine sediment'],
  'Quantity':           ['quantity', 'urine quantity', 'volume'],
};

// ─── Build reverse lookup: lowercase alias → canonical name ──────────────────
const ALIAS_MAP = new Map<string, string>();

for (const [canonical, aliases] of Object.entries(CANONICAL_GROUPS)) {
  // The canonical name itself (lowercased) is also a valid alias.
  ALIAS_MAP.set(canonical.toLowerCase(), canonical);
  for (const alias of aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), canonical);
  }
}

/**
 * Lightweight pre-clean before alias lookup:
 * - Strip parenthesised suffixes like "(Hb%)" or "(Na)"
 * - Remove leading "S." / "S " / "Serum " / "T." / "Sr " prefixes
 * - Trim whitespace and trailing "%"
 * - Collapse multiple spaces
 */
function preClean(raw: string): string {
  let s = raw.trim();

  // Try the raw string first (before stripping) — many aliases include the
  // parenthesised part intentionally (e.g. "Hemoglobin(Hb%)").
  if (ALIAS_MAP.has(s.toLowerCase())) return s;

  // Strip content in parentheses
  s = s.replace(/\s*\(.*?\)\s*/g, ' ').trim();

  // Remove common prefixes
  s = s.replace(/^(S\.\s*|S\s+|Serum\s+|T\.\s*|Sr\s+|Blood\s+)/i, '').trim();

  // Remove trailing % sign
  s = s.replace(/%$/, '').trim();

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ');

  return s;
}

/**
 * Normalise a biomarker / test name to its canonical form.
 *
 * ```ts
 * canonicaliseBiomarker('Hemoglobin(Hb%)')  // → 'Haemoglobin'
 * canonicaliseBiomarker('S. Creatinine')     // → 'Creatinine'
 * canonicaliseBiomarker('White Blood Cells') // → 'Total WBC'
 * canonicaliseBiomarker('SomeNewTest')       // → 'SomeNewTest' (pass-through)
 * ```
 */
export function canonicaliseBiomarker(raw: string): string {
  if (!raw) return raw;

  // 1. Direct lookup on the original string (case-insensitive)
  const directHit = ALIAS_MAP.get(raw.toLowerCase().trim());
  if (directHit) return directHit;

  // 2. Pre-clean then look up
  const cleaned = preClean(raw);
  const cleanedHit = ALIAS_MAP.get(cleaned.toLowerCase());
  if (cleanedHit) return cleanedHit;

  // 3. Unknown test — return cleaned form with consistent casing
  return cleaned || raw;
}
