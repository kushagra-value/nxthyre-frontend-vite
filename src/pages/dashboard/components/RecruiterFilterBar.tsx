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

  let id =
    d.recruiter_id ||
    (typeof d.recruiter === 'object' && d.recruiter !== null ? (d.recruiter as any).id || (d.recruiter as any).recruiter_id : undefined) ||
    (d as any).recruiterId ||
    (d as any).caller_id ||
    (d as any).created_by_id ||
    (d as any).user_id ||
    (d as any).assigned_recruiter_id;

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

  return {
    name: name ? String(name).trim() : undefined,
    id: id ? String(id).trim() : undefined,
  };
}

/** Robustly filter candidate activity items by selected recruiter, strictly preferring recruiter_id over name */
export function filterCallsByRecruiter(
  items: DailyActivityDetailItem[],
  selectedRecruiter: string,
  recruiterCallsFromApi?: RecruiterWiseCallAPI[]
): DailyActivityDetailItem[] {
  if (!selectedRecruiter || selectedRecruiter === 'all') return items;

  const target = selectedRecruiter.trim();
  const targetLower = target.toLowerCase();

  // Find API recruiter entry if any (matching by recruiter_id or recruiter_name)
  const apiEntry = recruiterCallsFromApi?.find(
    r => (r.recruiter_id && String(r.recruiter_id) === target) ||
         (r.recruiter_name && r.recruiter_name.toLowerCase().trim() === targetLower)
  );

  const targetId = apiEntry?.recruiter_id ? String(apiEntry.recruiter_id) : target;
  const targetName = apiEntry?.recruiter_name ? apiEntry.recruiter_name.toLowerCase().trim() : targetLower;

  return items.filter(item => {
    const rec = getRecruiterFromItem(item);

    // 1. PREFERRED MATCH: Match using recruiter_id
    if (rec.id) {
      if (rec.id === targetId || rec.id === target) {
        return true;
      }
      // If item has a recruiter_id and we have a targetId (e.g. Firebase UID/ID),
      // but they DO NOT match, this candidate belongs to a different recruiter!
      // Do NOT fall back to soft name matching.
      if (targetId && targetId !== rec.id && (targetId.length > 5 || rec.id.length > 5)) {
        return false;
      }
    }

    // 2. SECONDARY MATCH: Match using recruiter_name
    if (rec.name) {
      const itemRecName = rec.name.toLowerCase().trim();
      if (itemRecName === targetName || itemRecName.includes(targetName) || targetName.includes(itemRecName)) {
        return true;
      }
    }

    return false;
  });
}

export const RecruiterFilterBar: React.FC<RecruiterFilterBarProps> = ({
  calls,
  selectedRecruiter,
  onSelectRecruiter,
  recruiterCallsFromApi,
  totalCalls,
}) => {
  const recruiterStats = useMemo(() => {
    const map = new Map<string, { id?: string; name: string; count: number }>();

    if (recruiterCallsFromApi && recruiterCallsFromApi.length > 0) {
      recruiterCallsFromApi.forEach(r => {
        if (r.recruiter_name || r.recruiter_id) {
          const rId = r.recruiter_id ? String(r.recruiter_id) : undefined;
          const rName = r.recruiter_name || 'Unknown Recruiter';
          const key = rId || rName;
          const count = r.calls_made ?? r.calls_count ?? r.count ?? 0;
          map.set(key, { id: rId, name: rName, count });
        }
      });
    } else {
      calls.forEach(c => {
        const rec = getRecruiterFromItem(c);
        if (rec.id || rec.name) {
          const key = rec.id || rec.name!;
          const existing = map.get(key);
          const name = rec.name || existing?.name || 'Unknown Recruiter';
          map.set(key, { id: rec.id, name, count: (existing?.count || 0) + 1 });
        }
      });
    }

    return Array.from(map.values());
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
          {recruiterStats.map((r) => {
            const val = r.id || r.name;
            return (
              <option key={val} value={val}>
                {r.name} ({r.count} calls)
              </option>
            );
          })}
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
