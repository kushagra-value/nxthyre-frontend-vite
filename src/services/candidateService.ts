import apiClient from "./api";

export interface CandidateListItem {
  id: string;
  full_name: string;
  last_active_at: string;
  current_salary_lpa: string;
  avatar: string;
  headline: string;
  location: string;
  linkedin_url?: string;
  is_background_verified: boolean;
  profile_picture_url: string;
  experience_years: string;
  experience_summary: {
    title: string;
    date_range: string;
    duration_years: number;
  };
  education_summary: {
    title: string;
    date_range: string;
  };
  notice_period_summary: string;
  skills_list: string[];
  premium_data_unlocked: boolean;
  premium_data_availability: {
    email: boolean;
    resume_url: boolean;
    resume_text: boolean;
    linkedin_url: boolean;
    portfolio_url: boolean;
    phone_number: boolean;
    dribble_username: boolean;
    behance_username: boolean;
    instagram_username: boolean;
    pinterest_username: boolean;
    twitter_username: boolean;
    github_username: boolean;
    all_emails: boolean;
    all_phone_numbers: boolean;
  };
  premium_data: {
    email: string;
    phone: string;
    linkedin_url: string | null;
    github_url: string | null;
    twitter_url: string | null;
    resume_url: string;
    resume_text: string;
    portfolio_url: string | null;
    dribble_username: string;
    behance_username: string;
    instagram_username: string;
    pinterest_username: string;
    all_emails: string[];
    all_phone_numbers: string[];
  } | null;
}

export interface CandidateSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CandidateListItem[];
  sourcing_counts?: {
    inbound: number;
    outbound: number;
    active: number;
    prevetted: number;
  };
  boolean_search_terms?: string;
}

export interface TestEmailResponse {
  success: string;
  results: {
    email: string;
    whatsapp: string;
    call: string;
  };
}

export interface CandidateDetailData {
  recruiter_id: string;
  credit_balance: number;
  candidate: {
    id: string;
    full_name: string;
    profile_summary?: string;
    email?: string;
    phone?: string;
    headline: string;
    location: string;
    profile_picture_url: string;
    status: string;
    linkedin_url?: string;
    total_experience: number;
    github_url?: string;
    twitter_url?: string;
    portfolio_url?: string;
    resume_url?: string;
    experience: {
      job_title: string;
      company: string;
      location: string;
      start_date: string;
      end_date: string | null;
      description: string;
      is_current: boolean;
    }[];
    education: {
      institution: string;
      degree: string;
      specialization: string;
      is_top_tier: boolean;
      start_date: string;
      end_date: string;
    }[];
    certifications: {
      name: string;
      issuer: string;
      license_number: string;
      issued_date: string;
      valid_until: string | null;
      url: string;
    }[];
    recommendations: {
      recommender_name: string;
      recommender_title: string;
      recommender_company: string;
      recommender_relationship: string;
      recommender_profile_pic_url: string;
      feedback: string;
      date_received: string;
    }[];
    notes: {
      noteId: string;
      content: string;
      is_team_note: boolean;
      is_community_note: boolean;
      postedBy: {
        userId: string;
        userName: string;
        email: string;
      } | null;
      posted_at: string;
      organisation: {
        orgId: string;
        orgName: string;
      };
    }[];
    skills_data: {
      skills_mentioned: { skill: string; number_of_endorsements: number }[];
      endorsements: {
        skill_endorsed: string;
        endorser_name: string;
        endorser_title: string;
        endorser_company: string;
        endorser_profile_pic_url: string;
      }[];
    };
    current_stage_in_job: string | null;
    gender: string;
    is_recently_promoted: boolean;
    is_background_verified: boolean;
    is_active: boolean;
    is_prevetted: boolean;
    notice_period_days: number;
    application_type: string;
    stage: string;
    premium_data_unlocked: boolean;
    has_premium_data: boolean;
    premium_data_availability: {
      email: boolean;
      resume_url: boolean;
      resume_text: boolean;
      linkedin_url: boolean;
      portfolio_url: boolean;
      phone_number: boolean;
      dribble_username: boolean;
      behance_username: boolean;
      instagram_username: boolean;
      pinterest_username: boolean;
      twitter_username: boolean;
      github_username: boolean;
      all_emails: boolean;
      all_phone_numbers: boolean;
    };
    premium_data: {
      email: string;
      phone: string;
      linkedin_url: string | null;
      github_url: string | null;
      twitter_url: string | null;
      resume_url: string;
      resume_text: string;
      portfolio_url: string | null;
      dribble_username: string;
      behance_username: string;
      instagram_username: string;
      pinterest_username: string;
      all_emails: string[];
      all_phone_numbers: string[];
    } | null;
    ai_interview_report: {
      score: {
        resume: number;
        knowledge: number;
        technical: number;
        communication: number;
      };
      integrity_score: {
        device_usage: number;
        assistance: number;
        reference_materials: number;
        environmental_assistance: number;
      };
      QA_analysis: [
        {
          question: string;
          answer: string;
          score: number;
          feedback: string;
        }
      ];
      technicalSkills: {
        weakSkills: [
          {
            skill: string;
            rating: number;
            reason: string;
          }
        ];
        strongSkills: [
          {
            skill: string;
            rating: number;
            reason: string;
          }
        ];
        skillsCoverage: string;
      };
      feedbacks: {
        overallFeedback: string;
        communicationFeedback: string;
        resumeScoreReason: string;
        developmentAreas: Array<string>;
      };
      questionsCovered: {
        asked: number;
        total: number;
        coveragePercentage: number;
      };
      potential_red_flags: Array<string>;
      transcript: string;
    };
  };
}

export interface ReferenceData {
  hr_name: string;
  hr_title: string;
  is_data_correct: boolean;
}

export interface ShareableProfileSensitiveCandidate {
  id: string;
  profile_picture_url: string;
  total_experience: string;
  time_in_current_company: string;
  notice_period: string;
  current_salary_formatted: string;
  profile_summary: string;
  experience: {
    job_title: string;
    location: string;
    start_date: string;
    end_date: string | null;
    description: string;
    is_current: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    specialization: string;
    is_top_tier: boolean;
    start_date: string;
    end_date: string;
  }[];
  skills: {
    skill: string;
    number_of_endorsements: number;
  }[];
  certifications: {
    name: string;
    issuer: string;
    license_number: string;
    issued_date: string;
    valid_until: string | null;
    url: string;
  }[];
  community_notes: {
    content: string;
    posted_at: string;
    organization_name: string;
  }[];
}

export type ExportCandidateResponse = string;

export interface FollowUpStep {
  id: number;
  send_after_hours: number;
  mode: "EMAIL" | "WHATSAPP" | "CALL";
  subject: string;
  body: string;
  order: number;
}

export interface Template {
  id: number;
  name: string;
  initial_subject: string;
  initial_body: string;
  can_be_sent_via_email: boolean;
  can_be_sent_via_whatsapp: boolean;
  can_be_sent_via_call: boolean;
  follow_up_steps: FollowUpStep[];
  created_at?: string;
  updated_at?: string;
}

export interface InviteResponse {
  success: string;
  invite_id: number;
  candidate_email: string;
  candidate_name: string;
  candidate_phone: string;
}

export interface PipelineResponse {
  id: number;
  job: number;
  candidate: string;
  current_stage: number;
  status: string;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface BulkPipelineResponse {
  message: string;
  added_count: number;
  skipped_count: number;
}

export interface PipelineStage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  candidate_count: number;
}

export type Note = {
  noteId: string;
  content: string;
  is_team_note: boolean;
  is_community_note: boolean;
  postedBy: {
    userId: string;
    userName: string;
    email: string;
  } | null;
  posted_at: string;
  organisation: {
    orgId: string;
    orgName: string;
  };
};

export interface CandidateMatchScore {
  score: string;
  label: string;
  description: string;
  note: string;
}

export interface QuickFitItem {
  badge: string;
  status: string;
  color: string;
}

export interface AnalysisResult {
  candidate_id: string;
  candidate_name: string;
  candidate_match_score: CandidateMatchScore;
  quick_fit_summary: QuickFitItem[];
  gaps_risks: string[];
  recommended_message: string;
  call_attention: string[];
}

export interface AnalyzeResponse {
  analysis_results: AnalysisResult[];
  total_candidates: number;
  bool_query_used: string;
}

class CandidateService {
  async getCandidates(filters: any): Promise<CandidateSearchResponse> {
    try {
      const requestBody: any = {
        job_id: filters.jobId,
        tab: filters.application_type,
      };

      const ignoredKeys = [
        "jobId",
        "application_type",
        "booleanSearch",
        "boolQuery",
        "semanticSearch",
        "city", // Handled via locations array
        "funInCurrentCompany", // Unused
        "maxExperience", // Unused
        "selectedCategories", // Unused
        "hasLinkedIn", // Not supported by backend
        "is_prevetted",
        "is_active",
      ];

      // Updated snake case mapping to exactly match backend expectations
      // Direct passthrough for already snake_case keys like country, sort_by
      const snakeCaseMap: Record<string, string> = {
        minTotalExp: "experience_min",
        maxTotalExp: "experience_max",
        minExperience: "exp_in_current_company_min",
        locations: "locations",
        companies: "companies",
        industries: "industries",
        minSalary: "salary_min",
        maxSalary: "salary_max",
        colleges: "colleges",
        noticePeriod: "notice_period_max_days",
        topTierUniversities: "is_top_tier_college",
        computerScienceGraduates: "is_cs_graduate",
        showFemaleCandidates: "is_female_only",
        recentlyPromoted: "is_recently_promoted",
        backgroundVerified: "is_background_verified",
        hasCertification: "has_certification",
        hasResearchPaper: "has_research_paper",
        hasBehance: "has_behance",
        hasTwitter: "has_twitter",
        hasPortfolio: "has_portfolio",
        country: "country", // Direct
        sort_by: "sort_by", // Direct (already snake_case)
      };

      // Notice period parsing map
      const noticePeriodMap: Record<string, number> = {
        Immediate: 0,
        "15 days": 15,
        "30 days": 30,
        "45 days": 45,
        "60 days": 60,
        "90 days": 90,
      };

      // Add all other filters
      Object.keys(filters).forEach((key) => {
        if (ignoredKeys.includes(key)) return;

        let value = filters[key];
        if (value === undefined || value === null || value === "") return;

        let backendKey = key;
        if (key in snakeCaseMap) {
          backendKey = snakeCaseMap[key];
        }

        // Special handling for arrays/strings that should be arrays (split by comma if string)
        if (
          backendKey === "companies" ||
          backendKey === "industries" ||
          backendKey === "colleges"
        ) {
          if (typeof value === "string" && value.trim() !== "") {
            value = value
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
          if (Array.isArray(value) && value.length > 0) {
            requestBody[backendKey] = value;
            return;
          }
        }

        // Special handling for noticePeriod: parse to number
        if (key === "noticePeriod" && typeof value === "string") {
          value = noticePeriodMap[value] ?? 0; // Default to 0 if unknown
        }

        if (Array.isArray(value) && value.length > 0) {
          requestBody[backendKey] = value;
        } else if (
          typeof value === "object" &&
          Object.keys(value).length > 0 &&
          !(value instanceof Date)
        ) {
          requestBody[backendKey] = value;
        } else if (typeof value === "boolean" && value) {
          requestBody[backendKey] = value;
        } else if (typeof value === "string") {
          const trimmed = value.trim();
          if (trimmed !== "") {
            // Parse numeric strings to numbers for experience/salary if applicable
            if (
              (backendKey.includes("exp") || backendKey.includes("salary")) &&
              /^\d+(\.\d+)?$/.test(trimmed)
            ) {
              requestBody[backendKey] = parseFloat(trimmed);
            } else {
              requestBody[backendKey] = trimmed;
            }
          }
        } else if (typeof value === "number" && !isNaN(value)) {
          requestBody[backendKey] = value;
        }
      });

      // Handle keywords/search terms (q) only if not booleanSearch
      if (
        !filters.booleanSearch &&
        filters.keywords &&
        Array.isArray(filters.keywords) &&
        filters.keywords.length > 0
      ) {
        requestBody.q = filters.keywords;
      }

      // Handle boolean search (replaces keywords/q)
      if (
        filters.booleanSearch &&
        filters.boolQuery &&
        typeof filters.boolQuery === "string" &&
        filters.boolQuery.trim() !== ""
      ) {
        requestBody.bool_q = filters.boolQuery.trim();
      }

      // Handle search_type based on semanticSearch (defaults to 'keyword' on backend)
      // Only set explicitly if semanticSearch is true; otherwise, backend defaults
      if (filters.semanticSearch) {
        requestBody.search_type = "semantic";
      } else if (filters.keywords?.length > 0 || filters.boolQuery?.trim()) {
        requestBody.search_type = "keyword";
      }

      const response = await apiClient.post(
        "/candidates/search/?page=1",
        requestBody
      );
      // Add: Save bool_query from response to localStorage if present (for job-specific boolean query)
      if (response.data.bool_query) {
        localStorage.setItem(
          `bool_query_${filters.jobId}`,
          response.data.bool_query
        );
      }
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch candidates"
      );
    }
  }

  async sendTestEmail(data: {
    job_id: string;
    candidate_id: string;
    email: string;
    phone: string;
    subject: string;
    message_body: string;
    send_via_email: boolean;
    send_via_phone: boolean;
    send_via_whatsapp: boolean;
  }): Promise<TestEmailResponse> {
    try {
      const response = await apiClient.post("/jobs/invites/test/", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to send test email"
      );
    }
  }

  async searchCandidates(params: any): Promise<CandidateSearchResponse> {
    try {
      const { page, ...body } = params;
      const response = await apiClient.post(
        `/candidates/search/?page=${page || 1}`,
        body
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to search candidates"
      );
    }
  }

  async universalSearch(
    query: string,
    signal?: AbortSignal
  ): Promise<CandidateSearchResponse> {
    try {
      let normalizedQuery = query;
      // Check if the query is a LinkedIn URL
      if (query.startsWith("https://www.linkedin.com/in/")) {
        try {
          const url = new URL(query);
          // Ensure the pathname starts with "/in/" (LinkedIn profile URL pattern)
          if (url.pathname.startsWith("/in/")) {
            // Remove all trailing slashes from the pathname
            while (url.pathname.endsWith("/")) {
              url.pathname = url.pathname.slice(0, -1);
            }
            normalizedQuery = url.toString();
          }
        } catch (e) {
          // If the URL is invalid, fall back to the original query
        }
      }
      const rawUrl = `/candidates/universal-search/?query=${encodeURIComponent(
        normalizedQuery
      )}&page=1`;
      const response = await apiClient.get(rawUrl, { signal });
      return response.data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return { count: 0, next: null, previous: null, results: [] };
      }
      throw new Error(
        error.response?.data?.error || "Failed to search candidates"
      );
    }
  }

  async getCandidateReferences(candidateId: string): Promise<ReferenceData[]> {
    try {
      const response = await apiClient.get(
        `/organization/candidates/reference/${candidateId}/`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch candidate references"
      );
    }
  }

  async getCandidateDetails(candidateId: string): Promise<CandidateDetailData> {
    try {
      const response = await apiClient.get(`/candidates/${candidateId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch candidate details"
      );
    }
  }
  async getShareableProfile(
    candidateId: string
  ): Promise<ShareableProfileSensitiveCandidate> {
    try {
      const response = await apiClient.get(`/candidates/share/${candidateId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch shareable profile"
      );
    }
  }

  async getTemplates(): Promise<Template[]> {
    const response = await apiClient.get("/jobs/notification-templates/");
    return response.data;
  }

  async saveTemplate(template: Template): Promise<Template> {
    if (template.id) {
      // Update existing template
      const response = await apiClient.put(
        `/jobs/notification-templates/${template.id}/`,
        template
      );
      return response.data;
    } else {
      // Create new template
      const response = await apiClient.post(
        "/jobs/notification-templates/",
        template
      );
      return response.data;
    }
  }

  async sendInvite(data: {
    job_id: string;
    candidate_id: string;
    template_id?: string;
    send_via_email: boolean;

    send_via_phone: boolean;
    send_via_whatsapp: boolean;

    subject: string;
    message_body: string;

    followups: {
      send_after_hours: number;
      followup_mode: "EMAIL" | "WHATSAPP" | "CALL";
      followup_body: string;
      order_no: number;
    }[];
  }): Promise<InviteResponse> {
    const response = await apiClient.post("/jobs/invite/", data);
    return response.data;
  }

  async updateTemplate(template: Template): Promise<Template> {
    try {
      const response = await apiClient.put(
        `/jobs/notification-templates/${template.id}/`,
        {
          name: template.name,
          initial_subject: template.initial_subject,
          initial_body: template.initial_body,
          can_be_sent_via_email: template.can_be_sent_via_email,
          can_be_sent_via_whatsapp: template.can_be_sent_via_whatsapp,
          can_be_sent_via_call: template.can_be_sent_via_call,
          follow_up_steps: template.follow_up_steps.map((step) => ({
            send_after_hours: step.send_after_hours,
            mode: step.mode,
            subject: step.subject,
            body: step.body,
            order: step.order,
          })),
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to update template"
      );
    }
  }

  async saveToPipeline(
    jobId: number,
    candidateId: string,
    stageId?: number
  ): Promise<PipelineResponse> {
    try {
      const payload: {
        job: number;
        candidate: string;
        current_stage?: number;
      } = {
        job: jobId,
        candidate: candidateId,
      };
      if (stageId) {
        payload.current_stage = stageId;
      }
      const response = await apiClient.post("/jobs/applications/", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to save candidate to pipeline"
      );
    }
  }

  async bulkAddToPipeline(
    jobId: number,
    candidateIds: string[]
  ): Promise<BulkPipelineResponse> {
    try {
      const response = await apiClient.post("/jobs/bulk-add-to-pipeline/", {
        job: jobId,
        candidate_ids: candidateIds,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to add candidates to pipeline"
      );
    }
  }

  async getPipelineStages(jobId: number): Promise<PipelineStage[]> {
    try {
      const response = await apiClient.get(
        `/jobs/applications/stages/?job_id=${jobId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch pipeline stages"
      );
    }
  }

  async scheduleCodingAssessmentEmail(
    candidateId: string,
    jobId: number
  ): Promise<any> {
    try {
      const response = await apiClient.post(`/assessment/create-and-send/`, {
        candidate_id: candidateId,
        job_id: jobId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to send assessment email"
      );
    }
  }

  async getKeywordSuggestions(query: string): Promise<string[]> {
    try {
      const response = await apiClient.get(
        `/candidates/keyword-suggestions/?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch keyword suggestions"
      );
    }
  }

  async getRecentSearches(): Promise<
    { id: number; query: string; created_at: string }[]
  > {
    try {
      const response = await apiClient.get(`/candidates/recent-searches/`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch recent searches"
      );
    }
  }

  async revealPremiumData(
    candidateId: string
  ): Promise<{ message: string; premium_data: any }> {
    const response = await apiClient.post(
      `/candidates/${candidateId}/reveal-premium-data/`
    );
    return response.data;
  }

  async getCandidateNotes(candidateId: string): Promise<Note[]> {
    try {
      const response = await apiClient.get(`/candidates/${candidateId}/notes/`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch candidate notes"
      );
    }
  }

  async getAssessmentResults(jobId: number, candidateId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/assessment/results`, {
        params: {
          job_id: jobId,
          candidate_id: candidateId,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch assessment results"
      );
    }
  }

  async postCandidateNote(
    candidateId: string,
    payload: {
      teamNotes?: string;
      communityNotes?: string;
      is_community_note?: boolean;
    }
  ): Promise<Note> {
    try {
      const response = await apiClient.post(
        `/candidates/${candidateId}/notes/`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error("Server error response:", error.response?.data);
      throw new Error(
        error.response?.data?.error || "Failed to post candidate note"
      );
    }
  }

  async exportCandidates(
    candidateIds: string[]
  ): Promise<ExportCandidateResponse> {
    try {
      const response = await apiClient.post("/candidates/export-selected/", {
        candidate_ids: candidateIds,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to export candidates"
      );
    }
  }

  async getCandidateActivity(
    candidateId: string,
    applicationId?: number
  ): Promise<any[]> {
    try {
      const params = applicationId ? `?application_id=${applicationId}` : "";
      const response = await apiClient.get(
        `/candidates/${candidateId}/activity/${params}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch candidate activity"
      );
    }
  }

  async getBackgroundVerifications(candidateId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/candidates/${candidateId}/background-verifications/`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          "Failed to fetch background verifications"
      );
    }
  }

  async getCandidateBooleanSearch(
    candidateId: string
  ): Promise<AnalysisResult> {
    try {
      const boolQuery =
        "(Senior ML Engineer OR Lead ML Engineer)\nAND (Python)\nAND (PyTorch OR TensorFlow)\nAND (MLOps)\nAND (Kubernetes OR Docker)";
      const response = await apiClient.post("/candidates/analyze/", {
        candidate_ids: [candidateId],
        bool_query: boolQuery,
      });
      const data: AnalyzeResponse = response.data;
      if (data.analysis_results && data.analysis_results.length > 0) {
        return data.analysis_results[0];
      } else {
        throw new Error("No analysis results");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch boolean search"
      );
    }
  }

  // async getDefaultBoolQuery(jobId: string): Promise<string> {
  //   try {
  //     const response = await apiClient.get(`/jobs/${jobId}/default-bool-query`); // Adjust endpoint
  //     return response.data.bool_q || "";
  //   } catch (error: any) {
  //     throw new Error(
  //       error.response?.data?.error || "Failed to fetch default boolean query"
  //     );
  //   }
  // }
}

export const candidateService = new CandidateService();
export default candidateService;
