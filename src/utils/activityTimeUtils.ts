/**
 * Utility for formatting activity timestamps consistently in local timezone (12-hour AM/PM).
 * Handles ISO strings, Date objects, Unix timestamps, and UTC time strings.
 */
export const formatActivityTime = (item: any): string => {
  if (!item) return "--";

  if (typeof item === "string" || item instanceof Date || typeof item === "number") {
    return formatSingleTimeValue(item);
  }

  // Look for raw timestamp fields on the object in order of preference
  const rawTimestamp =
    item.timestamp ||
    item.created_at ||
    item.created_at_iso ||
    item.time_added ||
    item.at ||
    item.datetime ||
    item.date ||
    item.time;

  if (!rawTimestamp) return "--";

  return formatSingleTimeValue(rawTimestamp);
};

export const formatSingleTimeValue = (val: any): string => {
  if (!val) return "--";

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "--";
    return val.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (typeof val === "number") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const str = String(val).trim();
  if (!str) return "--";

  // If the string already contains a formatted 12-hour AM/PM time (e.g. "9:06 AM" or "Screening · 9:06 AM"), return it directly
  const match12 = str.match(/\b(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM))\b/i);
  if (match12) {
    return match12[1].toUpperCase();
  }

  // 1. Full ISO or date/time string (e.g. "2026-09-18T05:59:00Z", "2026-09-18 05:59:00+00:00")

  // 3. 24-hour UTC time string e.g. "05:59:00" or "05:59"
  const time24Regex = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;
  const match24 = str.match(time24Regex);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);

    const now = new Date();
    const utcDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)
    );

    if (!isNaN(utcDate.getTime())) {
      return utcDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return str;
};
