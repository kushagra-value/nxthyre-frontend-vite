import React, { useState, useEffect, useRef, useCallback } from "react";
import apiClient from "../../../services/api";
import { Stage } from "./JobPipelineDashboard";
import { candidateService } from "../../../services/candidateService";
import { GripVertical } from "lucide-react";

interface PipelineKanbanColumnProps {
  jobId: number;
  stage: Stage;
  filters: any;
  dateRange: { from: string; to: string };
  searchQuery: string;
  selectedRecruiter: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stageSlug: string) => void;
  stageBarColor: string;
  stageMenuOpenId: number | null;
  setStageMenuOpenId: (id: number | null) => void;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stage: Stage) => void;
  renderCandidateCard: (item: any, isArchived: boolean, list: any[], index: number, stageSlug: string) => React.ReactNode;
  visibleArchives: Set<string>;
  setVisibleArchives: React.Dispatch<React.SetStateAction<Set<string>>>;
  setStageMenuPos: (pos: { top: number; left: number }) => void;
  stageMenuPos: { top: number; left: number };
  stageCountOverride?: number;
  refreshCounter?: number;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
}

const PipelineKanbanColumn: React.FC<PipelineKanbanColumnProps> = ({
  jobId,
  stage,
  filters,
  dateRange,
  searchQuery,
  selectedRecruiter,
  onDragOver,
  onDrop,
  stageBarColor,
  stageMenuOpenId,
  setStageMenuOpenId,
  onEditStage,
  onDeleteStage,
  renderCandidateCard,
  visibleArchives,
  setVisibleArchives,
  setStageMenuPos,
  stageMenuPos,
  stageCountOverride,
  refreshCounter = 0,
  sortConfig,
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [archivedCandidates, setArchivedCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(stage.candidate_count || 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStageCandidates = useCallback(
    async (currentPage: number, reset: boolean = false) => {
      setLoading(true);
      if (reset) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
      }

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("job_id", jobId.toString());
        queryParams.append("stage_slug", stage.slug);
        queryParams.append("page", currentPage.toString());
        queryParams.append("page_size", "15");
        if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());

        const orderingMap: Record<string, string> = {
          "Name": "full_name",
          "AI Score": "ai_score",
          "Location": "location",
          "Exp": "experience",
          "CTC": "current_ctc",
          "Expected CTC": "expected_ctc",
          "Notice Period": "notice_period",
          "Stage": "stage",
        };

        if (sortConfig && orderingMap[sortConfig.key]) {
          const prefix = sortConfig.direction === "desc" ? "-" : "";
          queryParams.append("ordering", `${prefix}${orderingMap[sortConfig.key]}`);
        }

        if (filters.location?.length) {
          queryParams.append("location", filters.location.join(","));
        }
        if (filters.salaryRange?.min) {
          queryParams.append("salary_min", filters.salaryRange.min);
        }
        if (filters.salaryRange?.max) {
          queryParams.append("salary_max", filters.salaryRange.max);
        }
        if (filters.experience?.min) {
          queryParams.append("experience_min", filters.experience.min);
        }
        if (filters.experience?.max) {
          queryParams.append("experience_max", filters.experience.max);
        }
        if (filters.designation?.length) {
          queryParams.append("designation", filters.designation.join(","));
        }
        if (filters.noticePeriod?.selected?.length) {
          queryParams.append("notice_period", filters.noticePeriod.selected.join(","));
        }
        if (filters.noticePeriod?.minDays) {
          queryParams.append("notice_period_min_days", filters.noticePeriod.minDays);
        }
        if (filters.noticePeriod?.maxDays) {
          queryParams.append("notice_period_max_days", filters.noticePeriod.maxDays);
        }
        if (filters.attention?.length) {
          queryParams.append("attention", filters.attention.join(","));
        }
        if (dateRange?.from) {
          queryParams.append("last_activity_from", dateRange.from);
        }
        if (dateRange?.to) {
          queryParams.append("last_activity_to", dateRange.to);
        }

        const url = `/jobs/applications/?${queryParams.toString()}`;

        const [response, archivedRes] = await Promise.all([
          apiClient.get(url, { signal: abortControllerRef.current?.signal }),
          reset && visibleArchives.has(stage.slug)
            ? apiClient.get(`/jobs/roles/${jobId}/archived-applications/`, { signal: abortControllerRef.current?.signal })
            : Promise.resolve({ data: { results: archivedCandidates } })
        ]);

        const data = response.data;
        let candidateData: any[] = [];
        let count = 0;
        let limit = 15;

        if (Array.isArray(data)) {
          candidateData = data;
          count = data.length;
          limit = data.length; // fallback
        } else if (data && Array.isArray(data.results)) {
          candidateData = data.results;
          count = data.count || data.results.length;
          if (data.next) {
            limit = candidateData.length;
          }
        }

        const candidateDataWithActivities = await Promise.all(
          candidateData.map(async (item: any) => {
            if (item.candidate?.id) {
              try {
                const activities = await candidateService.getCandidateActivity(
                  item.candidate.id,
                  item.id
                );
                return { ...item, activities };
              } catch (err) {
                console.error(`Error fetching activities for candidate ${item.candidate.id}:`, err);
              }
            }
            return item;
          })
        );

        let archivedDataWithActivities = archivedCandidates;
        if (reset && archivedRes.data.results) {
          const arc = archivedRes.data.results.map((c: any) => ({ ...c, is_archived: true })).filter((c: any) => c.stage_slug === stage.slug || c.current_stage?.slug === stage.slug);
          archivedDataWithActivities = await Promise.all(
            arc.map(async (item: any) => {
              if (item.candidate?.id) {
                try {
                  const activities = await candidateService.getCandidateActivity(
                    item.candidate.id,
                    item.id
                  );
                  return { ...item, activities };
                } catch (err) {
                  console.error(`Error fetching activities for archived candidate ${item.candidate.id}:`, err);
                }
              }
              return item;
            })
          );
        }

        if (reset) {
          setCandidates(candidateDataWithActivities);
          setTotalCount(count);
          if (archivedRes.data.results) {
            setArchivedCandidates(archivedDataWithActivities);
          }
        } else {
          setCandidates((prev) => [...prev, ...candidateDataWithActivities]);
        }

        setHasMore((reset ? candidateData.length : candidates.length + candidateData.length) < count);
      } catch (error: any) {
        if (error.name === "CanceledError" || error.message === "canceled") return;
        console.error(`Error fetching pipeline column ${stage.name}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [jobId, stage.slug, stage.name, filters, dateRange, searchQuery, visibleArchives, archivedCandidates]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchStageCandidates(1, true);
  }, [filters, dateRange, searchQuery, visibleArchives, refreshCounter, sortConfig]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStageCandidates(nextPage, false);
    }
  };

  const getInitialRecruiter = (item: any): string | null => {
    const stageMoves = item.activities?.filter((a: any) => a.type === "stage_move") || [];
    if (stageMoves.length > 0) {
      const sorted = [...stageMoves].sort((a: any, b: any) => {
        const timeA = a.timestamp || a.data?.moved_at || "";
        const timeB = b.timestamp || b.data?.moved_at || "";
        return timeA.localeCompare(timeB);
      });
      const oldest = sorted[0];
      const name = oldest.data?.moved_by_name;
      if (name && name.trim()) {
        return name.trim();
      }
      const extEmail = oldest.data?.external_mover_email;
      if (extEmail && extEmail.trim()) {
        return extEmail.trim();
      }
    }
    if (item.last_moved_by_name && item.last_moved_by_name.trim()) {
      return item.last_moved_by_name.trim();
    }
    return null;
  };

  const matchesRecruiter = (item: any, selected: string | null) => {
    if (!selected) return true;
    const initialRec = getInitialRecruiter(item);
    return initialRec === selected;
  };

  let displayedCandidates = candidates;
  let displayedArchived = archivedCandidates;

  if (selectedRecruiter) {
    displayedCandidates = candidates.filter((c) => matchesRecruiter(c, selectedRecruiter));
    displayedArchived = archivedCandidates.filter((c) => matchesRecruiter(c, selectedRecruiter));
  }

  const displayCount = selectedRecruiter
    ? displayedCandidates.length
    : (stageCountOverride !== undefined ? stageCountOverride : totalCount);

  return (
    <div
      ref={columnRef}
      className="min-w-[320px] w-[320px] bg-white border border-[#E5E7EB] rounded-xl flex flex-col pt-3 pb-2 h-full relative transition-opacity duration-200"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.slug)}
    >
      <div className="px-5 pb-3 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", `stage:${stage.id}`);
              e.dataTransfer.effectAllowed = "move";
              
              if (columnRef.current) {
                // Set the entire column card as the drag ghost image
                e.dataTransfer.setDragImage(columnRef.current, 160, 40);
                
                // Change the opacity of the dragged column
                const columnEl = columnRef.current;
                requestAnimationFrame(() => {
                  columnEl.style.opacity = "0.4";
                });
              }
            }}
            onDragEnd={(e) => {
              if (columnRef.current) {
                columnRef.current.style.opacity = "1";
              }
            }}
            className="cursor-grab text-gray-400 hover:text-gray-600 mr-0.5 shrink-0 flex items-center active:cursor-grabbing"
            title="Drag column to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stageBarColor }} />
          <h3 className="text-sm font-bold text-[#4B5563] capitalize">{stage.name}</h3>
          <span className="text-xs bg-[#F9FAFB] border border-[#D1D1D6] text-[#8E8E93] rounded-full px-2 py-0.5 font-bold">
            {displayCount + (visibleArchives.has(stage.slug) ? displayedArchived.length : 0)}
          </span>
        </div>
        <div className={`relative ${stageMenuOpenId === stage.id ? "z-50" : ""}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (stageMenuOpenId === stage.id) {
                setStageMenuOpenId(null);
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              const mW = 192, mH = 120, gap = 8;
              const openUp = rect.bottom + mH + gap > window.innerHeight;
              const preferredTop = openUp ? rect.top - mH - gap : rect.bottom + gap;
              const top = Math.min(Math.max(8, preferredTop), Math.max(8, window.innerHeight - mH - 8));
              let left = rect.right - mW;
              if (left < 8) left = 8;
              if (left + mW > window.innerWidth - 8) left = window.innerWidth - mW - 8;
              setStageMenuPos({ top, left });
              setStageMenuOpenId(stage.id);
            }}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Stage options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8E8E93] rotate-90">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>

          {stageMenuOpenId === stage.id && (
            <div
              className="fixed w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[10000] py-1 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ top: stageMenuPos.top, left: stageMenuPos.left }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStage(stage);
                  setStageMenuOpenId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
              >
                Edit Stage Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStage(stage);
                  setStageMenuOpenId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[#FEE2E2] flex items-center gap-2"
              >
                Delete Stage
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Shift Stage feature coming soon");
                  setStageMenuOpenId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
              >
                Shift Stage
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleArchives((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(stage.slug)) newSet.delete(stage.slug);
                    else newSet.add(stage.slug);
                    return newSet;
                  });
                  setStageMenuOpenId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
              >
                {visibleArchives.has(stage.slug) ? "Hide" : "Show"} Archived Candidates
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 p-3 space-y-3 overflow-y-auto mt-1 custom-scrollbar pb-24"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {displayedCandidates.map((item, idx) => renderCandidateCard(item, false, displayedCandidates, idx, stage.slug))}

        {visibleArchives.has(stage.slug) && displayedArchived.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dashed border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#8E8E93] px-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                <rect x="1" y="3" width="22" height="5"></rect>
                <line x1="10" y1="12" x2="14" y2="12"></line>
              </svg>
              Archived ({displayedArchived.length})
            </div>
            {displayedArchived.map((item, idx) => renderCandidateCard(item, true, displayedArchived, idx, stage.slug))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center p-4">
            <span className="text-sm text-gray-500 animate-pulse">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineKanbanColumn;
