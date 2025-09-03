export interface PipelineCandidate {
  id: string; // application ID
  candidateId: string; // candidate UUID from API
  fullName: string;
  headline: string;
  profile_summary: string;
  location: string;
  profilePicture: {
    displayImageUrl: string;
    artifacts: Array<{
      width: number;
      height: number;
      url: string;
    }>;
  };
  gender: string;
  is_recently_promoted: boolean;
  is_background_verified: boolean;
  is_active: boolean;
  is_prevetted: boolean;
  notice_period_days: number;
  current_salary: string;
  application_type: string;
  total_experience: number;
  email: string;
  phone: string;
  positions: Array<{
    title: string;
    companyName: string;
    companyUrn: string;
    startDate: {
      month: number;
      year: number;
    };
    endDate?: {
      month: number;
      year: number;
    };
    isCurrent: boolean;
    location: string;
    description: string;
  }>;
  educations: Array<{
    schoolName: string;
    degreeName: string;
    fieldOfStudy: string;
    startDate: {
      year: number;
    };
    endDate: {
      year: number;
    };
    activities: string;
    description: string;
    is_top_tier: boolean;
  }>;
  certifications: Array<{
    name: string;
    authority: string;
    licenseNumber: string;
    startDate: {
      month: number;
      year: number;
    };
    endDate?: {
      month: number;
      year: number;
    };
    url: string;
  }>;
  skills: Array<{
    name: string;
    endorsementCount: number;
  }>;
  endorsements: Array<{
    endorser_name: string;
    endorser_title: string;
    endorser_profile_pic_url: string;
    skill_endorsed: string;
    endorser_company: string;
    message: string;
  }>;
  recommendations: {
    received: Array<{
      recommender: {
        id: string;
        name: string;
        headline: string;
        profileImageUrl: string;
      };
      message: string;
      relationship: string;
      createdDate: string;
    }>;
    given: Array<{
      recipient: {
        id: string;
        name: string;
        headline: string;
        profileImageUrl: string;
      };
      message: string;
      relationship: string;
      createdDate: string;
    }>;
  };
  notes: Array<{
    noteId: string;
    content: string;
    is_team_note: boolean;
    is_community_note: boolean;
    postedBy: {
      userId: string;
      userName: string;
      email: string;
    };
    posted_at: string;
    organisation: {
      orgId: string;
      orgName: string;
    };
  }>;
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
  // Stage-specific data
  stageData: {
    uncontacted?: {
      notes: string[];
    };
    invitesSent?: {
      currentStatus: string;
      notes: string[];
      dateSent: string;
      responseStatus: string;
    };
    applied?: {
      appliedDate: string;
      resumeScore: number;
      skillsMatch: string;
      experienceMatch: string;
      highlights: string;
      notes: string[];
    };
    aiInterview?: {
      interviewedDate: string;
      resumeScore: number;
      knowledgeScore: number;
      communicationScore: number;
      integrityScore: number;
      proctoring: {
        deviceUsage: number;
        assistance: number;
        referenceMaterial: number;
        environment: number;
      };
      questions: string[];
      notes: string[];
    };
    shortlisted?: {
      interviewedDate: string;
      resumeScore: number;
      knowledgeScore: number;
      communicationScore: number;
      integrityScore: number;
      proctoring: {
        deviceUsage: number;
        assistance: number;
        referenceMaterial: number;
        environment: number;
      };
      questions: string[];
      notes: string[];
    };
    firstInterview?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    otherInterviews?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    hrRound?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    salaryNegotiation?: {
      salary: string;
      negotiation: string;
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    offerSent?: {
      offerAcceptanceStatus: string;
      offerSentDate: string;
      followups: string[];
      interviewNotes: string[];
      interviewerName: string;
      interviewerEmail: string;
    };
    archived?: {
      reason: string;
      archivedDate: string;
      notes: string[];
    };
  };
}

export const pipelineStages = [
  "Uncontacted",
  "Invites Sent",
  "Applied",
  "AI Interview",
  "Shortlisted",
  "First Interview",
  "Other Interviews",
  "HR Round",
  "Salary Negotiation",
  "Offer Sent",
  "Archives",
];

export const pipelineCandidates: Record<string, PipelineCandidate[]> = {
  Uncontacted: [
  
  ],
};
