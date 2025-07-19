import apiClient from "./api";

export interface CandidateListItem {
  id: string;
  full_name: string;
  avatar: string;
  headline: string;
  location: string;
  linkedin_url?: string;
  is_background_verified: boolean;
  experience_years: string;
  experience_summary: {
    title: string;
    date_range: string;
  };
  education_summary: {
    title: string;
    date_range: string;
  };
  notice_period_summary: string;
  skills_list: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    resume?: string;
  };
}

export interface CandidateDetailData {
  recruiter_id: string;
  credit_balance: number;
  candidate: {
    id: string;
    full_name: string;
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
      endorsements: { skill_endorsed: string; endorser_name: string; endorser_title: string; endorser_company: string, endorser_profile_pic_url: string; }[];
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
    ai_interview_report: string | null;
  }
}

export interface ShareableProfileSensitiveCandidate {
  id: string;
  about: string;
  location: string;
  total_experience_years: number;
  experience: {
    job_title: string;
    location: string;
    start_date: string;
    end_date: string | null;
    description: string;
    is_current: boolean;
  }[];
  education: {
    degree: string;
    specialization: string;
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
}

class CandidateService {
  async getCandidates(filters: any): Promise<{ results: CandidateListItem[]; count: number }> {
    try {
      const response = await apiClient.post("/candidates/search/", filters);
      if (Array.isArray(response.data)) {
        return {
          results: response.data,
          count: response.data.length,
        };
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch candidates");
    }
  }

  async getCandidateDetails(candidateId: string): Promise<CandidateDetailData> {
    try {
      const response = await apiClient.get(`/candidates/${candidateId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch candidate details");
    }
  }
  async getShareableProfile(candidateId: string): Promise<ShareableProfileSensitiveCandidate> {
    try {
      const response = await apiClient.get(`/api/candidates/share/${candidateId}/`);
      return response.data;
    } catch (error: any) {
      console.warn("Failed to fetch shareable profile, returning dummy data");
      return {
        id: "ed51c22f-517c-4f71-884b-55b56c9bea1a",
        about: "Machine Learning Engineer | NLP, Deep Learning, MLOps | Healthcare AI",
        location: "Hyderabad, India",
        total_experience_years: 6.6,
        experience: [
          {
            job_title: "Machine Learning Engineer",
            location: "Remote",
            start_date: "2021-06-01",
            end_date: null,
            description: "Developed and deployed deep learning models for radiology report summarization and image-text cross-modal retrieval. Worked closely with radiologists to build annotation pipelines and establish data quality baselines. Designed custom CNN+Transformer hybrid architectures in PyTorch, achieving 92% F1 score in disease classification. Built internal autoML tooling for model benchmarking and hyperparameter tuning using Optuna. Also led the end-to-end MLOps setup using MLflow and AWS SageMaker for model versioning, reproducibility, and monitoring in production. Mentored 2 interns on explainable AI (GradCAM, SHAP) and supervised learning projects.",
            is_current: true
          },
          {
            job_title: "Data Scientist",
            location: "Bangalore, India",
            start_date: "2018-11-01",
            end_date: "2021-05-01",
            description: "Worked on natural language understanding (NLU) problems in digital health. Built intent recognition models for symptom checkers using BERT and fastText embeddings. Contributed to internal Python packages for text preprocessing and spell correction tailored to medical transcripts. Improved chatbot performance by 15% by integrating rule-based fallback layers. Also explored weak supervision and active learning strategies to improve low-resource language coverage. Supported product analytics using cohort tracking and built dashboards in Streamlit for internal stakeholders.",
            is_current: false
          }
        ],
        education: [
          {
            degree: "M.Tech",
            specialization: "Artificial Intelligence",
            start_date: "2016-07-01",
            end_date: "2018-06-01"
          },
          {
            degree: "B.E.",
            specialization: "Computer Science",
            start_date: "2012-07-01",
            end_date: "2016-06-01"
          }
        ],
        skills: [
          {
            skill: "PyTorch",
            number_of_endorsements: 1
          },
          {
            skill: "Transformers",
            number_of_endorsements: 0
          },
          {
            skill: "NLP",
            number_of_endorsements: 1
          },
          {
            skill: "MLOps",
            number_of_endorsements: 0
          },
          {
            skill: "AWS SageMaker",
            number_of_endorsements: 0
          }
        ],
        certifications: [
          {
            name: "AWS Certified Machine Learning - Specialty",
            issuer: "Amazon Web Services",
            license_number: "AWS-ML-SP-1012",
            issued_date: "2023-01-01",
            valid_until: "2026-01-01",
            url: "https://aws.amazon.com/verification/aws-ml-sp-1012"
          },
          {
            name: "Deep Learning Specialization",
            issuer: "Coursera / DeepLearning.AI",
            license_number: "DL-3021-998",
            issued_date: "2019-08-01",
            valid_until: null,
            url: "https://coursera.org/certificate/dl-3021-998"
          }
        ]
      };
    }
  }
}

export const candidateService = new CandidateService();
export default candidateService;