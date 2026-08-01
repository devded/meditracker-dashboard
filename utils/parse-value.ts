/**
 * Helper to parse a numerical string (which may contain commas like "10,940" or "1,50,000")
 * into a clean float value for charting.
 */
export function parseValue(val: string | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  
  // Strip commas, spaces, non-breaking spaces, and any non-numeric prefixes/suffixes except decimal point and minus
  const cleaned = val.toString().replace(/,/g, '').trim();
  
  // Extract number pattern if mixed with text (e.g., "< 0.5" or "15.3 g/dl")
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return 0;
  
  const parsed = parseFloat(match[0]);
  return isNaN(parsed) ? 0 : parsed;
}
