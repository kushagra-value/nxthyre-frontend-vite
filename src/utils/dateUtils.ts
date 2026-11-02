/**
 * Normalizes any date string (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, ISO string) to strict ISO format: YYYY-MM-DD.
 * Returns null if the value is missing or cannot be parsed as a valid calendar date.
 */
export function toIsoDate(val?: string | null): string | null {
  if (!val) return null;
  const clean = String(val).trim();
  if (!clean) return null;

  // 1. Check if already YYYY-MM-DD or starts with YYYY-MM-DD (e.g. ISO 8601 strings)
  const isoMatch = clean.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, "0");
    const day = isoMatch[3].padStart(2, "0");
    const mNum = parseInt(month, 10);
    const dNum = parseInt(day, 10);
    if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
      return `${year}-${month}-${day}`;
    }
  }

  // 2. Check DD/MM/YYYY or MM/DD/YYYY (slashes or dashes)
  const slashMatch = clean.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (slashMatch) {
    const part1 = parseInt(slashMatch[1], 10);
    const part2 = parseInt(slashMatch[2], 10);
    const year = slashMatch[3];

    let day: number;
    let month: number;

    if (part1 > 12) {
      // Must be DD/MM/YYYY (e.g. 31/10/2026)
      day = part1;
      month = part2;
    } else if (part2 > 12) {
      // Must be MM/DD/YYYY (e.g. 10/31/2026)
      month = part1;
      day = part2;
    } else {
      // Ambiguous: default to DD/MM/YYYY as standard for Indian / UK dates
      day = part1;
      month = part2;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // 3. Fallback: JS Date.parse
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return null;
}
