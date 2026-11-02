import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Meh, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { Job, jobPostService } from "../../../../../services/jobPostService";
import { candidateService } from "../../../../../services/candidateService";
import { getCallLogs, saveCallLog } from "../../../../../services/jobPipelineDashboardService";

export type SkillFeedbackRating = "positive" | "neutral" | "negative" | null;
export type SkillsFeedbackState = Record<string, SkillFeedbackRating>;

export interface SkillItem {
  name: string;
  category: "must_have" | "good_to_have";
  notInResume: boolean;
}

export interface SkillsMatchTabProps {
  candidateId?: string;
  jobId?: string | number;
  candidate?: any;
  candidateDetails?: any;
  jobData?: Job | null;
  competenciesData?: any;
  callUuid?: string | null;
  skillsFeedback?: SkillsFeedbackState;
  onFeedbackChange?: (feedback: SkillsFeedbackState) => void;
  [key: string]: any;
}

/**
 * Escapes regex special characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Checks if a given skill is found in the candidate's resume text, skills list, experience, or certifications.
 */
function isSkillInCandidateResume(skillName: string, candidateData: any): boolean {
  if (!skillName || !candidateData) return false;
  const target = skillName.trim().toLowerCase();
  if (!target) return false;

  // 1. Check skills_data.skills_mentioned
  const skillsMentioned =
    candidateData?.skills_data?.skills_mentioned ||
    candidateData?.candidate?.skills_data?.skills_mentioned ||
    [];
  if (Array.isArray(skillsMentioned)) {
    for (const item of skillsMentioned) {
      const s = (typeof item === "string" ? item : item?.skill || "").trim().toLowerCase();
      if (s && (s === target || s.includes(target) || target.includes(s))) {
        return true;
      }
    }
  }

  // 2. Check candidate skills_list / skills array
  const skillsList =
    candidateData?.skills_list ||
    candidateData?.candidate?.skills_list ||
    candidateData?.skills ||
    candidateData?.candidate?.skills ||
    [];
  if (Array.isArray(skillsList)) {
    for (const item of skillsList) {
      const s = String(item).trim().toLowerCase();
      if (s && (s === target || s.includes(target) || target.includes(s))) {
        return true;
      }
    }
  }

  // 3. Check resume_text if available
  const resumeText = (
    candidateData?.premium_data?.resume_text ||
    candidateData?.candidate?.premium_data?.resume_text ||
    candidateData?.resume_text ||
    candidateData?.candidate?.resume_text ||
    ""
  ).toLowerCase();

  if (resumeText) {
    const escaped = escapeRegex(target);
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, "i");
    if (regex.test(resumeText)) return true;

    // Common technical variations
    const variations: Record<string, string[]> = {
      react: ["react.js", "reactjs", "react native"],
      "react.js": ["react", "reactjs"],
      vue: ["vue.js", "vuejs"],
      angular: ["angularjs", "angular 2+"],
      node: ["node.js", "nodejs"],
      "node.js": ["node", "nodejs"],
      postgres: ["postgresql"],
      postgresql: ["postgres"],
      aws: ["amazon web services"],
      gcp: ["google cloud"],
      ts: ["typescript"],
      js: ["javascript"],
      k8s: ["kubernetes"],
      next: ["next.js", "nextjs"],
      "next.js": ["next", "nextjs"],
    };

    if (variations[target]) {
      for (const alias of variations[target]) {
        const aliasRegex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegex(alias)}(?:$|[^a-zA-Z0-9])`, "i");
        if (aliasRegex.test(resumeText)) return true;
      }
    }
  }

  // 4. Check experience titles, companies, descriptions
  const experiences =
    candidateData?.experience ||
    candidateData?.candidate?.experience ||
    [];
  if (Array.isArray(experiences)) {
    for (const exp of experiences) {
      const expText = `${exp?.job_title || ""} ${exp?.company || ""} ${exp?.description || ""}`.toLowerCase();
      if (expText.includes(target)) return true;
    }
  }

  // 5. Check candidate headline and profile summary
  const headline = (candidateData?.headline || candidateData?.candidate?.headline || "").toLowerCase();
  const summary = (candidateData?.profile_summary || candidateData?.candidate?.profile_summary || "").toLowerCase();
  if (headline.includes(target) || summary.includes(target)) return true;

  // 6. Check certifications
  const certs =
    candidateData?.certifications ||
    candidateData?.candidate?.certifications ||
    [];
  if (Array.isArray(certs)) {
    for (const c of certs) {
      const cName = (c?.name || "").toLowerCase();
      if (cName.includes(target)) return true;
    }
  }

  return false;
}

/**
 * Extracts and cleans a list of skill/requirement items from various potential JD text segments or bullet points.
 */
function cleanSkillList(items: (string | any)[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  items.forEach((item) => {
    let text = typeof item === "string" ? item : item?.skill || item?.competency || item?.name || "";
    if (!text) return;

    // Clean up bullets, numbered points, dashes
    text = text
      .replace(/^[\s•\-\*–—\d\.\)]+/, "")
      .replace(/[:;,\.]+$/, "")
      .trim();

    if (text.length > 1 && text.length <= 60) {
      const lower = text.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(text);
      }
    }
  });

  return result;
}

export default function SkillsMatchTab({
  candidateId,
  jobId,
  candidate,
  candidateDetails,
  jobData: propJobData,
  competenciesData: propCompetenciesData,
  callUuid,
  skillsFeedback: propSkillsFeedback,
  onFeedbackChange,
}: SkillsMatchTabProps) {
  const [jobData, setJobData] = useState<Job | null>(propJobData || null);
  const [competenciesData, setCompetenciesData] = useState<any>(propCompetenciesData || null);
  const [candidateDetailData, setCandidateDetailData] = useState<any>(candidateDetails || null);
  const [isLoading, setIsLoading] = useState<boolean>(!propJobData && !!jobId);
  const [error, setError] = useState<string | null>(null);

  // Recruiter ratings state: map of skillName -> "positive" | "neutral" | "negative" | null
  const [feedback, setFeedback] = useState<SkillsFeedbackState>(propSkillsFeedback || {});
  const feedbackRef = useRef<SkillsFeedbackState>(feedback);
  feedbackRef.current = feedback;

  const storageKey = useMemo(() => {
    const cId = candidateId || candidate?.id || "unknown";
    const jId = jobId || "unknown";
    return `nxthyre_skills_feedback_${jId}_${cId}`;
  }, [candidateId, candidate?.id, jobId]);

  // Sync prop changes for jobData and competenciesData
  useEffect(() => {
    if (propJobData) setJobData(propJobData);
  }, [propJobData]);

  useEffect(() => {
    if (propCompetenciesData) setCompetenciesData(propCompetenciesData);
  }, [propCompetenciesData]);

  useEffect(() => {
    if (candidateDetails) setCandidateDetailData(candidateDetails);
  }, [candidateDetails]);

  // If propSkillsFeedback changes externally, sync it
  useEffect(() => {
    if (propSkillsFeedback && Object.keys(propSkillsFeedback).length > 0) {
      setFeedback(propSkillsFeedback);
    }
  }, [propSkillsFeedback]);

  // Fetch job & candidate data if not provided
  const loadData = useCallback(async () => {
    if (!jobId || jobId === "0") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const numericJobId = typeof jobId === "string" ? parseInt(jobId, 10) : jobId;

      const promises: Promise<any>[] = [];

      if (!propJobData && !isNaN(numericJobId)) {
        promises.push(
          jobPostService.getJob(numericJobId).then(setJobData).catch((err) => {
            console.error("Failed to load job data in SkillsMatchTab:", err);
          })
        );
      }

      if (!propCompetenciesData && !isNaN(numericJobId)) {
        promises.push(
          jobPostService.getJobCompetencies(numericJobId).then(setCompetenciesData).catch((err) => {
            console.error("Failed to load competencies in SkillsMatchTab:", err);
          })
        );
      }

      const effectiveCandId = candidateId || candidate?.id;
      if (!candidateDetails && effectiveCandId) {
        promises.push(
          candidateService
            .getCandidateInboundScore(String(effectiveCandId), String(jobId))
            .then((data) => {
              setCandidateDetailData(data?.candidate || data);
            })
            .catch(() => {
              // Fallback to general candidate details
              return candidateService.getCandidateDetails(String(effectiveCandId)).then((data) => {
                setCandidateDetailData(data?.candidate || data);
              });
            })
            .catch((err) => {
              console.error("Failed to load candidate details in SkillsMatchTab:", err);
            })
        );
      }

      await Promise.all(promises);
    } catch (err: any) {
      console.error("Error loading Skills Match data:", err);
      setError("Unable to load job skills data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [jobId, propJobData, propCompetenciesData, candidateId, candidate?.id, candidateDetails]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Restore previously saved feedback from localStorage and/or call logs
  useEffect(() => {
    const effectiveCandId = candidateId || candidate?.id;
    if (!effectiveCandId) return;

    let restoredFeedback: SkillsFeedbackState = {};

    // 1. Try reading from localStorage first (fastest and most immediate)
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          restoredFeedback = { ...parsed };
        }
      }
    } catch (e) {
      console.warn("Failed to read skills feedback from localStorage:", e);
    }

    // 2. Try fetching from previous call log if localStorage is empty
    if (Object.keys(restoredFeedback).length === 0) {
      getCallLogs(String(effectiveCandId), 5)
        .then((logs) => {
          if (Array.isArray(logs) && logs.length > 0) {
            for (const log of logs) {
              if (log.skills_data && typeof log.skills_data === "object") {
                const logSkills = log.skills_data as Record<string, any>;
                const normalizedLogSkills: SkillsFeedbackState = {};

                Object.entries(logSkills).forEach(([key, val]) => {
                  if (val === "positive" || val === "neutral" || val === "negative") {
                    normalizedLogSkills[key] = val;
                  } else if (val === true) {
                    normalizedLogSkills[key] = "positive";
                  } else if (val === false) {
                    normalizedLogSkills[key] = "negative";
                  }
                });

                if (Object.keys(normalizedLogSkills).length > 0) {
                  setFeedback(normalizedLogSkills);
                  try {
                    localStorage.setItem(storageKey, JSON.stringify(normalizedLogSkills));
                  } catch { }
                  onFeedbackChange?.(normalizedLogSkills);
                  break;
                }
              }
            }
          }
        })
        .catch((err) => {
          console.warn("Could not retrieve past call logs for skills feedback:", err);
        });
    } else {
      setFeedback(restoredFeedback);
      onFeedbackChange?.(restoredFeedback);
    }
  }, [candidateId, candidate?.id, storageKey, onFeedbackChange]);

  // Fast background save to backend
  const debouncedSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveFeedbackToBackend = useCallback(
    (newFeedback: SkillsFeedbackState) => {
      const effectiveCandId = candidateId || candidate?.id;
      if (!effectiveCandId) return;

      if (debouncedSaveTimerRef.current) {
        clearTimeout(debouncedSaveTimerRef.current);
      }

      debouncedSaveTimerRef.current = setTimeout(async () => {
        try {
          await saveCallLog({
            candidate_id: String(effectiveCandId),
            call_uuid: callUuid || undefined,
            skills_data: newFeedback as any,
          });
        } catch (err) {
          console.warn("Silently failed to auto-save skills feedback to backend:", err);
        }
      }, 300);
    },
    [candidateId, candidate?.id, callUuid]
  );

  const handleRatingClick = (skillName: string, selectedRating: "positive" | "neutral" | "negative") => {
    const currentRating = feedback[skillName] || null;
    const nextRating = currentRating === selectedRating ? null : selectedRating;

    const nextFeedback: SkillsFeedbackState = {
      ...feedback,
      [skillName]: nextRating,
    };

    setFeedback(nextFeedback);

    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextFeedback));
    } catch (e) {
      console.warn("Failed to save skills feedback to localStorage:", e);
    }

    // Notify parent
    onFeedbackChange?.(nextFeedback);

    // Trigger auto-save to backend
    saveFeedbackToBackend(nextFeedback);
  };

  // Derive Must-Have and Good-to-Have skills dynamically
  const { mustHaveSkills, goodToHaveSkills, totalSkillsCount } = useMemo(() => {
    const rawMustHave: string[] = [];
    const rawGoodToHave: string[] = [];

    // 1. Structured AI JD Object
    const aiJdObj = jobData?.ai_jd_object;
    if (aiJdObj) {
      const mSkills = aiJdObj.must_have || aiJdObj.must_have_skills || aiJdObj.requirements;
      if (Array.isArray(mSkills)) rawMustHave.push(...mSkills);
      else if (typeof mSkills === "string") rawMustHave.push(...mSkills.split(/[\n•,]/));

      const gSkills = aiJdObj.good_to_have || aiJdObj.nice_to_have || aiJdObj.nice_to_have_skills;
      if (Array.isArray(gSkills)) rawGoodToHave.push(...gSkills);
      else if (typeof gSkills === "string") rawGoodToHave.push(...gSkills.split(/[\n•,]/));
    }

    // 2. Competencies Data
    if (competenciesData) {
      if (Array.isArray(competenciesData.the_core_expectation)) {
        rawMustHave.push(...competenciesData.the_core_expectation);
      }
      if (Array.isArray(competenciesData.required_technical_skills_purpose)) {
        competenciesData.required_technical_skills_purpose.forEach((item: any) => {
          if (item?.skill) rawMustHave.push(item.skill);
        });
      }
    }

    // 3. Parse JD Description / Markdown if available
    const jdText = jobData?.job_description_markdown || jobData?.description || jobData?.ai_jd || "";
    if (jdText && (rawMustHave.length === 0 || rawGoodToHave.length === 0)) {
      const mustMatch = jdText.match(
        /(?:must[- ]have(?:\s+skills)?|requirements|required(?:\s+skills)?|core(?:\s+skills)?)\s*[:\n]([\s\S]*?)(?=(?:good[- ]to[- ]have|nice[- ]to[- ]have|preferred|benefits|about\s+us|responsibilities|$))/i
      );
      if (mustMatch && mustMatch[1]) {
        rawMustHave.push(...mustMatch[1].split(/[\n•\-*]/));
      }

      const goodMatch = jdText.match(
        /(?:good[- ]to[- ]have(?:\s+skills)?|nice[- ]to[- ]have(?:\s+skills)?|preferred(?:\s+skills|\s+qualifications)?|bonus)\s*[:\n]([\s\S]*?)(?=(?:must[- ]have|requirements|benefits|about\s+us|$))/i
      );
      if (goodMatch && goodMatch[1]) {
        rawGoodToHave.push(...goodMatch[1].split(/[\n•\-*]/));
      }
    }

    // 4. Primary Job Skills
    const primarySkills = cleanSkillList(jobData?.skills || []);
    const technicalCompetencies = cleanSkillList(jobData?.technical_competencies || []);
    const combinedBaseSkills = cleanSkillList([...primarySkills, ...technicalCompetencies]);

    let cleanedMust = cleanSkillList(rawMustHave);
    let cleanedGood = cleanSkillList(rawGoodToHave);

    // If we have primary skills from job post, integrate them
    if (combinedBaseSkills.length > 0) {
      if (cleanedMust.length === 0 && cleanedGood.length === 0) {
        // Intelligently distribute skills: first ~65% as Must Have, remaining as Good to Have
        const cutIndex = Math.max(1, Math.ceil(combinedBaseSkills.length * 0.65));
        cleanedMust = combinedBaseSkills.slice(0, cutIndex);
        cleanedGood = combinedBaseSkills.slice(cutIndex);
      } else {
        // Make sure primary skills appear in the lists without duplicates
        const mustSet = new Set(cleanedMust.map((s) => s.toLowerCase()));
        const goodSet = new Set(cleanedGood.map((s) => s.toLowerCase()));

        combinedBaseSkills.forEach((skill) => {
          const lower = skill.toLowerCase();
          if (!mustSet.has(lower) && !goodSet.has(lower)) {
            if (cleanedMust.length <= 8) {
              cleanedMust.push(skill);
              mustSet.add(lower);
            } else {
              cleanedGood.push(skill);
              goodSet.add(lower);
            }
          }
        });
      }
    }

    // Ensure non-empty fallback if job has some description but no structured skills
    if (cleanedMust.length === 0 && cleanedGood.length === 0) {
      if (jobData?.title) {
        cleanedMust.push(jobData.title);
      }
    }

    // Compare with candidate resume data to determine missing status
    const effectiveCandidate = candidateDetailData || candidate;

    const mustHaveMapped: SkillItem[] = cleanedMust.map((skill) => ({
      name: skill,
      category: "must_have",
      notInResume: !isSkillInCandidateResume(skill, effectiveCandidate),
    }));

    const goodToHaveMapped: SkillItem[] = cleanedGood.map((skill) => ({
      name: skill,
      category: "good_to_have",
      notInResume: !isSkillInCandidateResume(skill, effectiveCandidate),
    }));

    // CRITICAL REQUIREMENT: "Missing must-haves are listed first. Ask these."
    // Sort so notInResume === true comes first
    mustHaveMapped.sort((a, b) => {
      if (a.notInResume === b.notInResume) return 0;
      return a.notInResume ? -1 : 1;
    });

    goodToHaveMapped.sort((a, b) => {
      if (a.notInResume === b.notInResume) return 0;
      return a.notInResume ? -1 : 1;
    });

    return {
      mustHaveSkills: mustHaveMapped,
      goodToHaveSkills: goodToHaveMapped,
      totalSkillsCount: mustHaveMapped.length + goodToHaveMapped.length,
    };
  }, [jobData, competenciesData, candidateDetailData, candidate]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-4xl mx-auto pb-8 animate-fadeIn">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200/80">
          <div className="h-6 w-36 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-4 w-60 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="space-y-3 mb-6">
          <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] w-full max-w-2xl mx-auto p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h3 className="text-base font-semibold text-slate-800 mb-1">Failed to Load Skills Match</h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Empty State
  if (totalSkillsCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] w-full max-w-2xl mx-auto p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No Skills Configured</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-4">
          The selected job description does not currently have technical skills configured. Add skills to the job posting to see the Skills Match analysis.
        </p>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Check Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-10 animate-fadeIn select-none">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-4 mb-6 border-b border-slate-200/80">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[16px] font-semibold text-[#070707] tracking-tight">Skills Match</h2>
          <span className="text-[16px]  text-[#070707]">{totalSkillsCount}</span>
        </div>
        <p className="text-[14px] text-[#000000] font-normal">
          Missing must-haves are listed first. Ask these.
        </p>
      </div>

      {/* ── Must Have Skills Section ── */}
      {mustHaveSkills.length > 0 && (
        <div className="mb-7">
          <h3 className="text-[14px] font-medium text-[#0f47f2] flex items-center gap-1.5 mb-3">
            <span>Must Have Skills</span>
            <span className="text-blue-300">|</span>
            <span>{mustHaveSkills.length}</span>
          </h3>

          <div className="space-y-3">
            {mustHaveSkills.map((skill, index) => {
              const rating = feedback[skill.name] || null;

              return (
                <div
                  key={`must-${skill.name}-${index}`}
                  className={`rounded-2xl px-3 py-2 transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs ${rating === "positive"
                      ? "bg-[#F0FDF4] border border-[#BBF7D0]"
                      : rating === "neutral"
                        ? "bg-[#FFF7ED] border border-[#FED7AA]"
                        : rating === "negative"
                          ? "bg-[#FEF2F2] border border-[#FECDD3]"
                          : "bg-white border border-slate-200/90 hover:border-slate-300"
                    }`}
                >
                  {/* Left Column: Number + Skill Title + Missing Badge */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${rating === "positive"
                          ? "bg-white text-emerald-800 border border-emerald-200"
                          : rating === "neutral"
                            ? "bg-white text-orange-800 border border-orange-200"
                            : rating === "negative"
                              ? "bg-white text-rose-800 border border-rose-200"
                              : "bg-[#EFF6FF] text-[#1D4ED8]"
                        }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px]  text-slate-800 truncate" title={skill.name}>
                        {skill.name}
                      </span>
                      {skill.notInResume && (
                        <span className="bg-[#FEE9E7] text-[#FF383C] text-[10px] sm:text-[11px]  px-2 py-0.5 rounded-full inline-flex items-center w-fit mt-1">
                          Not in Resume
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 3-State Feedback Button Group */}
                  <div className="inline-flex items-center rounded-lg border border-slate-200/90 bg-white overflow-hidden shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRatingClick(skill.name, "positive")}
                      title="Proficient / Verified (Thumbs Up)"
                      aria-label={`Mark proficient for ${skill.name}`}
                      className={`p-2 sm:px-3 sm:py-2 transition-colors cursor-pointer ${rating === "positive"
                          ? "bg-[#16A34A] text-white hover:bg-[#15803D]"
                          : "text-[#16A34A] hover:bg-green-50"
                        }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 sm:h-6 bg-slate-200" />
                    <button
                      type="button"
                      onClick={() => handleRatingClick(skill.name, "neutral")}
                      title="Average / Partial (Neutral)"
                      aria-label={`Mark neutral for ${skill.name}`}
                      className={`p-2 sm:px-3 sm:py-2 transition-colors cursor-pointer ${rating === "neutral"
                          ? "bg-[#EA580C] text-white hover:bg-[#C2410C]"
                          : "text-[#EA580C] hover:bg-orange-50"
                        }`}
                    >
                      <Meh className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 sm:h-6 bg-slate-200" />
                    <button
                      type="button"
                      onClick={() => handleRatingClick(skill.name, "negative")}
                      title="Needs Improvement / Not Satisfied (Thumbs Down)"
                      aria-label={`Mark not satisfied for ${skill.name}`}
                      className={`p-2 sm:px-3 sm:py-2 transition-colors cursor-pointer ${rating === "negative"
                          ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                          : "text-[#DC2626] hover:bg-red-50"
                        }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Good to Have Section ── */}
      {goodToHaveSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#0D9488] flex items-center gap-1.5 mb-3">
            <span>Good to Have</span>
            <span className="text-teal-300">|</span>
            <span>{goodToHaveSkills.length}</span>
          </h3>

          <div className="space-y-3">
            {goodToHaveSkills.map((skill, index) => {
              const rating = feedback[skill.name] || null;

              return (
                <div
                  key={`good-${skill.name}-${index}`}
                  className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs ${rating === "positive"
                      ? "bg-[#F0FDF4] border border-[#BBF7D0]"
                      : rating === "neutral"
                        ? "bg-[#FFF7ED] border border-[#FED7AA]"
                        : rating === "negative"
                          ? "bg-[#FEF2F2] border border-[#FECDD3]"
                          : "bg-white border border-slate-200/90 hover:border-slate-300"
                    }`}
                >
                  {/* Left Column: Number + Skill Title + Missing Badge */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${rating === "positive"
                          ? "bg-white text-emerald-800 border border-emerald-200"
                          : rating === "neutral"
                            ? "bg-white text-orange-800 border border-orange-200"
                            : rating === "negative"
                              ? "bg-white text-rose-800 border border-rose-200"
                              : "bg-[#EFF6FF] text-[#1D4ED8]"
                        }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-slate-800 truncate" title={skill.name}>
                        {skill.name}
                      </span>
                      {skill.notInResume && (
                        <span className="bg-[#FEE9E7] text-[#FF383C] text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center w-fit mt-1">
                          Not in Resume
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: 3-State Feedback Button Group */}
                  <div className="inline-flex items-center rounded-lg border border-slate-200/90 bg-white overflow-hidden shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRatingClick(skill.name, "positive")}
                      title="Proficient / Verified (Thumbs Up)"
                      aria-label={`Mark proficient for ${skill.name}`}
                      className={`p-2 sm:px-3 sm:py-2 transition-colors cursor-pointer ${rating === "positive"
                          ? "bg-[#16A34A] text-white hover:bg-[#15803D]"
                          : "text-[#16A34A] hover:bg-green-50"
                        }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 sm:h-6 bg-slate-200" />
                    <button
                      type="button"
                      onClick={() => handleRatingClick(skill.name, "neutral")}
                      title="Average / Partial (Neutral)"
                      aria-label={`Mark neutral for ${skill.name}`}
                      className={`p-2 sm:px-3 sm:py-2 transition-colors cursor-pointer ${rating === "neutral"
                          ? "bg-[#EA580C] text-white hover:bg-[#C2410C]"
                          : "text-[#EA580C] hover:bg-orange-50"
                        }`}
                    >
                      <Meh className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 sm:h-6 bg-slate-200" />
                    <button
                      type="button"
                      onClick={() => handleRatingClick(skill.name, "negative")}
                      title="Needs Improvement / Not Satisfied (Thumbs Down)"
                      aria-label={`Mark not satisfied for ${skill.name}`}
                      className={`p-2 sm:px-3 sm:py-2 transition-colors cursor-pointer ${rating === "negative"
                          ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                          : "text-[#DC2626] hover:bg-red-50"
                        }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
