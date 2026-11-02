import { MyWorkspace } from "../../../services/organizationService";
import { Job } from "../../../services/jobPostService";
import { CandidateCallItem, CallStatsData } from "../../../services/callService";
import { CallFiltersState, EMPTY_CALL_FILTERS } from "./CallFiltersDialog";

export interface CallPageState {
  companies: MyWorkspace[];
  jobs: Job[];
  selectedCompanyId: number | null;
  selectedJobId: number | null;
  candidates: CandidateCallItem[];
  totalCount: number;
  currentPage: number;
  filters: CallFiltersState;
  selectedScoreRange: string | null;
  searchQuery?: string;
  hasFetched: boolean;
  stages: any[];
  callStats?: CallStatsData | null;
  activeTab?: "call" | "history" | "shortlist";
}

const STORAGE_KEY = "nxthyre_call_listing_cache";

// Module-level in-memory cache to preserve state across router navigations
let inMemoryCache: CallPageState | null = null;

export const callStateCache = {
  get(): CallPageState | null {
    if (inMemoryCache) {
      return inMemoryCache;
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        inMemoryCache = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to read call listing cache from sessionStorage:", e);
    }
    return null;
  },

  set(state: Partial<CallPageState>) {
    const current: CallPageState = inMemoryCache || {
      companies: [],
      jobs: [],
      selectedCompanyId: null,
      selectedJobId: null,
      candidates: [],
      totalCount: 0,
      currentPage: 1,
      filters: EMPTY_CALL_FILTERS,
      selectedScoreRange: null,
      searchQuery: "",
      hasFetched: false,
      stages: [],
      callStats: null,
    };

    inMemoryCache = {
      ...current,
      ...state,
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryCache));
    } catch (e) {
      console.warn("Failed to persist call listing cache:", e);
    }
  },

  clear() {
    inMemoryCache = null;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) { }
  },

  // Update a single candidate's details (e.g. call status / note) without refetching the whole list
  updateCandidate(
    candidateId: string | number,
    updates: Partial<CandidateCallItem>
  ) {
    if (!inMemoryCache) {
      this.get();
    }
    if (!inMemoryCache || !inMemoryCache.candidates) return;
    inMemoryCache.candidates = inMemoryCache.candidates.map((item) => {
      const id = item.candidate?.id || item.id;
      if (String(id) === String(candidateId)) {
        return {
          ...item,
          ...updates,
          candidate: {
            ...item.candidate,
            ...(updates.candidate || {}),
          },
        };
      }
      return item;
    });

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(inMemoryCache));
    } catch (e) { }
  },
};
