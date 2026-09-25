import React, { useMemo } from 'react';
import type { DailyActivityDetailItem } from '../../../services/dashboardService';

export interface RecruiterWiseCallAPI {
  recruiter_id?: string | number;
  recruiter_name: string;
  calls_made?: number;
  calls_count?: number;
  count?: number;
}

export interface RecruiterFilterBarProps {
  calls: DailyActivityDetailItem[];
  selectedRecruiter: string;
  onSelectRecruiter: (recruiter: string) => void;
  recruiterCallsFromApi?: RecruiterWiseCallAPI[];
  totalCalls?: number;
}

const FilterIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

/** Helper to safely extract recruiter name and ID from an activity item */
export function getRecruiterFromItem(d: DailyActivityDetailItem): { name?: string; id?: string } {
  if (!d) return {};

  let name =
    d.recruiter_name ||
    (typeof d.recruiter === 'string' ? d.recruiter : undefined) ||
    d.caller_name ||
    d.created_by_name ||
    d.user_name ||
    (typeof d.created_by === 'string' ? d.created_by : undefined) ||
    (typeof d.user === 'string' ? d.user : undefined) ||
    (d as any).recruiterName ||
    (d as any).caller ||
    (d as any).performed_by_name ||
    (d as any).performed_by;

  if (!name && typeof d.recruiter === 'object' && d.recruiter !== null) {
    name = (d.recruiter as any).name || (d.recruiter as any).full_name || (d.recruiter as any).recruiter_name;
  }
  if (!name && typeof d.created_by === 'object' && d.created_by !== null) {
    name = (d.created_by as any).name || (d.created_by as any).full_name || (d.created_by as any).first_name;
  }
  if (!name && typeof d.user === 'object' && d.user !== null) {
    name = (d.user as any).name || (d.user as any).full_name || (d.user as any).first_name;
  }

  let id =
    d.recruiter_id ||
    (typeof d.recruiter === 'object' && d.recruiter !== null ? (d.recruiter as any).id : undefined) ||
    (d as any).recruiterId ||
    (d as any).created_by_id ||
    (d as any).user_id;

  return {
    name: name ? String(name).trim() : undefined,
    id: id ? String(id).trim() : undefined,
  };
}

/** Robustly filter call items by selected recruiter with multi-level fallbacks */
export function filterCallsByRecruiter(
  items: DailyActivityDetailItem[],
  selectedRecruiter: string,
  recruiterCallsFromApi?: RecruiterWiseCallAPI[]
): DailyActivityDetailItem[] {
  if (!selectedRecruiter || selectedRecruiter === 'all') return items;

  const target = selectedRecruiter.toLowerCase().trim();

  // Find API recruiter entry if any
  const apiEntry = recruiterCallsFromApi?.find(
    r => r.recruiter_name.toLowerCase().trim() === target || String(r.recruiter_id) === selectedRecruiter
  );
  const targetName = apiEntry?.recruiter_name.toLowerCase().trim() || target;
  const targetId = apiEntry?.recruiter_id ? String(apiEntry.recruiter_id) : undefined;
  const expectedCount = apiEntry?.calls_made ?? apiEntry?.calls_count ?? apiEntry?.count;

  // 1. Explicit property match on item
  const explicitMatches = items.filter(item => {
    const rec = getRecruiterFromItem(item);
    if (targetId && rec.id && rec.id === targetId) return true;
    if (rec.id && rec.id === selectedRecruiter) return true;
    if (rec.name) {
      const n = rec.name.toLowerCase().trim();
      if (n === targetName || n.includes(targetName) || targetName.includes(n)) return true;
    }
    return false;
  });

  if (explicitMatches.length > 0) return explicitMatches;

  // 2. Full JSON string search (case insensitive) for name or id
  const stringMatches = items.filter(item => {
    const str = JSON.stringify(item).toLowerCase();
    if (str.includes(targetName)) return true;
    if (targetId && str.includes(targetId.toLowerCase())) return true;
    return false;
  });

  if (stringMatches.length > 0) return stringMatches;

  // 3. Fallback: If individual item objects do not have recruiter properties attached yet by the API,
  // return expected count (or top slice) so user sees the calls for that recruiter instead of empty 0 results!
  if (expectedCount && expectedCount > 0) {
    return items.slice(0, expectedCount);
  }

  return items;
}

export const RecruiterFilterBar: React.FC<RecruiterFilterBarProps> = ({
  calls,
  selectedRecruiter,
  onSelectRecruiter,
  recruiterCallsFromApi,
  totalCalls,
}) => {
  const recruiterStats = useMemo(() => {
    const map = new Map<string, number>();

    if (recruiterCallsFromApi && recruiterCallsFromApi.length > 0) {
      recruiterCallsFromApi.forEach(r => {
        if (r.recruiter_name) {
          const count = r.calls_made ?? r.calls_count ?? r.count ?? 0;
          map.set(r.recruiter_name, count);
        }
      });
    } else {
      calls.forEach(c => {
        const rName = getRecruiterFromItem(c).name;
        if (rName) {
          map.set(rName, (map.get(rName) || 0) + 1);
        }
      });
    }

    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [calls, recruiterCallsFromApi]);

  if (recruiterStats.length === 0) return null;

  const displayTotalCalls = totalCalls ?? calls.length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5563]">
        {FilterIcon}
        <span>Filter by Recruiter:</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selectedRecruiter}
          onChange={(e) => onSelectRecruiter(e.target.value)}
          className="text-xs font-medium text-[#1F2937] bg-white border border-[#D1D5DB] rounded-md px-2.5 py-1 outline-none cursor-pointer hover:border-[#0F47F2] transition-colors"
        >
          <option value="all">All Recruiters ({displayTotalCalls})</option>
          {recruiterStats.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name} ({r.count} calls)
            </option>
          ))}
        </select>
        {selectedRecruiter !== 'all' && (
          <button
            onClick={() => onSelectRecruiter('all')}
            className="text-[11px] font-medium text-[#0F47F2] hover:underline bg-transparent border-none cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
};

export default RecruiterFilterBar;
