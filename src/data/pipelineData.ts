export interface PipelineCandidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  publicIdentifier: string;
  headline: string;
  summary: string;
  profilePicture: {
    displayImageUrl: string;
    artifacts: Array<{
      width: number;
      height: number;
      url: string;
    }>;
  };
  location: {
    country: string;
    city: string;
  };
  industry: string;
  email: string;
  phone: {
    type: string;
    number: string;
  };
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
    endorser: {
      id: string;
      name: string;
      headline: string;
      profileImageUrl: string;
    };
    skill: string;
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
  visibility: {
    profile: "PUBLIC" | "CONNECTIONS" | "PRIVATE";
    email: boolean;
    phone: boolean;
  };
  connections: Array<{
    id: string;
    fullName: string;
    publicIdentifier: string;
    headline: string;
    profilePicture: {
      displayImageUrl: string;
    };
    location: {
      country: string;
      city: string;
    };
    linkedProfilePath: string;
  }>;
  meta: {
    fetchedAt: string;
    dataCompleteness: "full" | "partial";
    source: string;
    scopesGranted: string[];
  };
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
    //   {
    //     id: 'uc1',
    //     firstName: 'Rajesh',
    //     lastName: 'Kumar',
    //     fullName: 'Rajesh Kumar',
    //     publicIdentifier: 'rajesh-kumar-dev',
    //     headline: 'Senior Software Engineer at TCS',
    //     summary: 'Experienced software engineer with 8+ years in full-stack development',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Bangalore'
    //     },
    //     industry: 'Information Technology',
    //     email: 'rajesh.kumar@email.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543220'
    //     },
    //     positions: [{
    //       title: 'Senior Software Engineer',
    //       companyName: 'TCS',
    //       companyUrn: 'tcs',
    //       startDate: { month: 3, year: 2020 },
    //       isCurrent: true,
    //       location: 'Bangalore',
    //       description: 'Leading development of enterprise applications'
    //     }],
    //     educations: [{
    //       schoolName: 'IIT Bangalore',
    //       degreeName: 'B.Tech',
    //       fieldOfStudy: 'Computer Science',
    //       startDate: { year: 2012 },
    //       endDate: { year: 2016 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Java', endorsementCount: 25 },
    //       { name: 'Spring Boot', endorsementCount: 18 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2024-01-15',
    //       dataCompleteness: 'full',
    //       source: 'LinkedIn APIs',
    //       scopesGranted: ['r_fullprofile']
    //     },
    //     stageData: {
    //       uncontacted: {
    //         notes: ['Strong technical background', 'Good fit for senior role']
    //       }
    //     }
    //   },
    //  {
    //     id: '1',
    //     firstName: 'Sunny',
    //     lastName: 'Humbro',
    //     fullName: 'Sunny Humbro',
    //     publicIdentifier: 'sunny-humbro',
    //     headline: 'Senior Seller Performance Support Analyst at Amazon',
    //     summary: 'Experienced analyst with expertise in data analysis and seller support',
    //     profilePicture: {
    //       displayImageUrl: 'https://tse4.mm.bing.net/th/id/OIP.audMX4ZGbvT2_GJTx2c4GgHaHw?pid=Api&P=0&h=220',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Mumbai'
    //     },
    //     industry: 'E-commerce',
    //     email: 'sunny.humbro@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543210'
    //     },
    //     positions: [{
    //       title: 'Senior Seller Performance Support Analyst',
    //       companyName: 'Amazon',
    //       companyUrn: 'amazon',
    //       startDate: { month: 1, year: 2022 },
    //       isCurrent: true,
    //       location: 'Mumbai, Maharashtra, India',
    //       description: 'Supporting seller performance through data analysis'
    //     }],
    //     educations: [{
    //       schoolName: 'Indian Institute of Foreign Trade',
    //       degreeName: 'Post Graduate Diploma',
    //       fieldOfStudy: 'Business',
    //       startDate: { year: 2018 },
    //       endDate: { year: 2020 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Python', endorsementCount: 20 },
    //       { name: 'Data Analysis', endorsementCount: 18 },
    //       { name: 'SQL', endorsementCount: 15 },
    //       { name: 'Excel', endorsementCount: 12 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       uncontacted: {
    //         notes: ['Expert in data analysis', 'Potential for senior analyst role']
    //       }
    //     }
    //   }, {
    //     id: '5',
    //     firstName: 'Arjun',
    //     lastName: 'Kumar',
    //     fullName: 'Arjun Kumar',
    //     publicIdentifier: 'arjun-kumar-ios',
    //     headline: 'iOS Developer at Swiggy',
    //     summary: 'iOS developer with expertise in Swift and UIKit',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Bangalore'
    //     },
    //     industry: 'Technology',
    //     email: 'arjun.kumar@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543214'
    //     },
    //     positions: [{
    //       title: 'iOS Developer',
    //       companyName: 'Swiggy',
    //       companyUrn: 'swiggy',
    //       startDate: { month: 1, year: 2022 },
    //       isCurrent: true,
    //       location: 'Bangalore, Karnataka, India',
    //       description: 'Developing iOS applications for food delivery platform'
    //     }],
    //     educations: [{
    //       schoolName: 'National Institute of Technology, Karnataka',
    //       degreeName: 'B.Tech',
    //       fieldOfStudy: 'Computer Science',
    //       startDate: { year: 2016 },
    //       endDate: { year: 2020 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'iOS', endorsementCount: 15 },
    //       { name: 'Swift', endorsementCount: 12 },
    //       { name: 'Objective-C', endorsementCount: 10 },
    //       { name: 'UIKit', endorsementCount: 8 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       uncontacted: {
    //         notes: ['Intermediate iOS skills', 'Good fit for mobile dev role']
    //       }
    //     }
    //   },{
    //     id: '6',
    //     firstName: 'Neha',
    //     lastName: 'Singh',
    //     fullName: 'Neha Singh',
    //     publicIdentifier: 'neha-singh-android',
    //     headline: 'Android Developer at Paytm',
    //     summary: 'Android developer with expertise in Kotlin and Firebase',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Noida'
    //     },
    //     industry: 'Fintech',
    //     email: 'neha.singh@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543215'
    //     },
    //     positions: [{
    //       title: 'Android Developer',
    //       companyName: 'Paytm',
    //       companyUrn: 'paytm',
    //       startDate: { month: 1, year: 2021 },
    //       isCurrent: true,
    //       location: 'Noida, Uttar Pradesh, India',
    //       description: 'Developing Android applications for payment platform'
    //     }],
    //     educations: [{
    //       schoolName: 'Delhi Technological University',
    //       degreeName: 'B.Tech',
    //       fieldOfStudy: 'Computer Science',
    //       startDate: { year: 2016 },
    //       endDate: { year: 2020 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Android', endorsementCount: 15 },
    //       { name: 'Kotlin', endorsementCount: 12 },
    //       { name: 'Java', endorsementCount: 10 },
    //       { name: 'Firebase', endorsementCount: 8 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       uncontacted: {
    //         notes: ['Intermediate Android skills', 'Potential for fintech role']
    //       }
    //     }
    //   },{
    //     id: '2',
    //     firstName: 'Samina',
    //     lastName: 'Haque',
    //     fullName: 'Samina Haque',
    //     publicIdentifier: 'samina-haque',
    //     headline: 'Software Engineer at Razorpay',
    //     summary: 'Software engineer with expertise in full-stack development',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Bangalore'
    //     },
    //     industry: 'Fintech',
    //     email: 'samina.haque@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543211'
    //     },
    //     positions: [{
    //       title: 'Software Engineer',
    //       companyName: 'Razorpay',
    //       companyUrn: 'razorpay',
    //       startDate: { month: 1, year: 2021 },
    //       isCurrent: true,
    //       location: 'Bangalore, Karnataka, India',
    //       description: 'Developing full-stack applications for payment platform'
    //     }],
    //     educations: [{
    //       schoolName: 'Indian Institute of Technology, Hyderabad',
    //       degreeName: 'Masters',
    //       fieldOfStudy: 'Computer Science',
    //       startDate: { year: 2018 },
    //       endDate: { year: 2020 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'React', endorsementCount: 18 },
    //       { name: 'Node.js', endorsementCount: 15 },
    //       { name: 'MongoDB', endorsementCount: 12 },
    //       { name: 'JavaScript', endorsementCount: 10 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       invitesSent: {
    //         currentStatus: 'Pending Response',
    //         notes: ['Invite sent via email', 'Follow up in 3 days'],
    //         dateSent: '2025-07-01',
    //         responseStatus: 'No Response'
    //       }
    //     }
    //   },{
    //     id: '8',
    //     firstName: 'Anita',
    //     lastName: 'Desai',
    //     fullName: 'Anita Desai',
    //     publicIdentifier: 'anita-desai-designer',
    //     headline: 'Designer at Zomato',
    //     summary: 'UI/UX designer with expertise in user-centric design',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Gurgaon'
    //     },
    //     industry: 'Design',
    //     email: 'anita.desai@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543217'
    //     },
    //     positions: [{
    //       title: 'Designer',
    //       companyName: 'Zomato',
    //       companyUrn: 'zomato',
    //       startDate: { month: 1, year: 2020 },
    //       isCurrent: true,
    //       location: 'Gurgaon, Haryana, India',
    //       description: 'Designing user interfaces for food delivery platform'
    //     }],
    //     educations: [{
    //       schoolName: 'National Institute of Design',
    //       degreeName: 'Bachelor of Design',
    //       fieldOfStudy: 'Design',
    //       startDate: { year: 2015 },
    //       endDate: { year: 2019 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'UI/UX Design', endorsementCount: 20 },
    //       { name: 'Figma', endorsementCount: 18 },
    //       { name: 'Adobe Creative Suite', endorsementCount: 15 },
    //       { name: 'Prototyping', endorsementCount: 12 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       invitesSent: {
    //         currentStatus: 'Responded - Interested',
    //         notes: ['Positive response received', 'Scheduling initial call'],
    //         dateSent: '2025-06-30',
    //         responseStatus: 'Interested'
    //       }
    //     }
    //   },{
    //     id: '4',
    //     firstName: 'Priya',
    //     lastName: 'Patel',
    //     fullName: 'Priya Patel',
    //     publicIdentifier: 'priya-patel-ml',
    //     headline: 'Machine Learning Engineer at Google',
    //     summary: 'Expert in machine learning and deep learning models',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Hyderabad'
    //     },
    //     industry: 'Technology',
    //     email: 'priya.patel@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543213'
    //     },
    //     positions: [{
    //       title: 'Machine Learning Engineer',
    //       companyName: 'Google',
    //       companyUrn: 'google',
    //       startDate: { month: 1, year: 2019 },
    //       isCurrent: true,
    //       location: 'Hyderabad, Telangana, India',
    //       description: 'Developing machine learning solutions for enterprise applications'
    //     }],
    //     educations: [{
    //       schoolName: 'IIT Delhi',
    //       degreeName: 'PhD',
    //       fieldOfStudy: 'Computer Science',
    //       startDate: { year: 2014 },
    //       endDate: { year: 2019 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Machine Learning', endorsementCount: 30 },
    //       { name: 'Python', endorsementCount: 25 },
    //       { name: 'TensorFlow', endorsementCount: 20 },
    //       { name: 'Deep Learning', endorsementCount: 18 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       applied: {
    //         appliedDate: '2025-06-28',
    //         resumeScore: 92,
    //         skillsMatch: '90%',
    //         experienceMatch: '85%',
    //         highlights: 'Machine Learning, Python, TensorFlow',
    //         notes: ['Expert in ML', 'Strong academic background']
    //       }
    //     }
    //   },{
    //     id: '10',
    //     firstName: 'Deepika',
    //     lastName: 'Agarwal',
    //     fullName: 'Deepika Agarwal',
    //     publicIdentifier: 'deepika-agarwal-operations',
    //     headline: 'Operations Manager at Ola',
    //     summary: 'Operations manager with expertise in process optimization',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Bangalore'
    //     },
    //     industry: 'Transportation',
    //     email: 'deepika.agarwal@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543219'
    //     },
    //     positions: [{
    //       title: 'Operations Manager',
    //       companyName: 'Ola',
    //       companyUrn: 'ola',
    //       startDate: { month: 1, year: 2021 },
    //       isCurrent: true,
    //       location: 'Bangalore, Karnataka, India',
    //       description: 'Optimizing operations for ride-sharing platform'
    //     }],
    //     educations: [{
    //       schoolName: 'Vellore Institute of Technology',
    //       degreeName: 'B.Tech',
    //       fieldOfStudy: 'Engineering',
    //       startDate: { year: 2016 },
    //       endDate: { year: 2020 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Operations', endorsementCount: 25 },
    //       { name: 'Process Optimization', endorsementCount: 20 },
    //       { name: 'Analytics', endorsementCount: 15 },
    //       { name: 'Project Management', endorsementCount: 12 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       applied: {
    //         appliedDate: '2025-07-02',
    //         resumeScore: 88,
    //         skillsMatch: '80%',
    //         experienceMatch: '75%',
    //         highlights: 'Operations, Analytics',
    //         notes: ['Strong operations skills', 'Good fit for process improvement']
    //       }
    //     }
    //   },{
    //     id: '9',
    //     firstName: 'Karthik',
    //     lastName: 'Iyer',
    //     fullName: 'Karthik Iyer',
    //     publicIdentifier: 'karthik-iyer-sales',
    //     headline: 'Sales Manager at Salesforce',
    //     summary: 'Sales professional with expertise in CRM and lead generation',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Mumbai'
    //     },
    //     industry: 'Software',
    //     email: 'karthik.iyer@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543218'
    //     },
    //     positions: [{
    //       title: 'Sales Manager',
    //       companyName: 'Salesforce',
    //       companyUrn: 'salesforce',
    //       startDate: { month: 1, year: 2019 },
    //       isCurrent: true,
    //       location: 'Mumbai, Maharashtra, India',
    //       description: 'Managing sales operations and client relationships'
    //     }],
    //     educations: [{
    //       schoolName: 'XLRI Jamshedpur',
    //       degreeName: 'MBA',
    //       fieldOfStudy: 'Business Administration',
    //       startDate: { year: 2016 },
    //       endDate: { year: 2018 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Sales', endorsementCount: 25 },
    //       { name: 'CRM', endorsementCount: 20 },
    //       { name: 'Lead Generation', endorsementCount: 18 },
    //       { name: 'Client Management', endorsementCount: 15 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       firstInterview: {
    //         followups: ['Schedule technical discussion', 'Client case study review'],
    //         interviewNotes: ['Strong sales experience', 'Good communication skills'],
    //         interviewDate: '2025-07-03',
    //         interviewerName: 'Emma Brown',
    //         interviewerEmail: 'emma.brown@company.com'
    //       }
    //     }
    //   }, {
    //     id: '3',
    //     firstName: 'Rahul',
    //     lastName: 'Sharma',
    //     fullName: 'Rahul Sharma',
    //     publicIdentifier: 'rahul-sharma-pm',
    //     headline: 'Product Manager at Flipkart',
    //     summary: 'Product manager with expertise in strategy and analytics',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Bangalore'
    //     },
    //     industry: 'E-commerce',
    //     email: 'rahul.sharma@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543212'
    //     },
    //     positions: [{
    //       title: 'Product Manager',
    //       companyName: 'Flipkart',
    //       companyUrn: 'flipkart',
    //       startDate: { month: 1, year: 2020 },
    //       isCurrent: true,
    //       location: 'Bangalore, Karnataka, India',
    //       description: 'Leading product strategy and development'
    //     }],
    //     educations: [{
    //       schoolName: 'Indian Institute of Management, Bangalore',
    //       degreeName: 'MBA',
    //       fieldOfStudy: 'Business Administration',
    //       startDate: { year: 2018 },
    //       endDate: { year: 2020 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Product Strategy', endorsementCount: 25 },
    //       { name: 'Analytics', endorsementCount: 20 },
    //       { name: 'Leadership', endorsementCount: 18 },
    //       { name: 'Agile', endorsementCount: 15 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       hrRound: {
    //         followups: ['Salary discussion', 'Background check'],
    //         interviewNotes: ['Strong product management skills', 'Good leadership potential'],
    //         interviewDate: '2025-07-02',
    //         interviewerName: 'John Doe',
    //         interviewerEmail: 'john.doe@company.com'
    //       }
    //     }
    //   },{
    //     id: '7',
    //     firstName: 'Vikram',
    //     lastName: 'Reddy',
    //     fullName: 'Vikram Reddy',
    //     publicIdentifier: 'vikram-reddy-em',
    //     headline: 'Engineering Manager at Microsoft',
    //     summary: 'Engineering manager with expertise in team leadership and system design',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Hyderabad'
    //     },
    //     industry: 'Technology',
    //     email: 'vikram.reddy@gmail.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543216'
    //     },
    //     positions: [{
    //       title: 'Engineering Manager',
    //       companyName: 'Microsoft',
    //       companyUrn: 'microsoft',
    //       startDate: { month: 1, year: 2018 },
    //       isCurrent: true,
    //       location: 'Hyderabad, Telangana, India',
    //       description: 'Leading engineering teams and system design'
    //     }],
    //     educations: [{
    //       schoolName: 'Indian Institute of Science, Bangalore',
    //       degreeName: 'M.Tech',
    //       fieldOfStudy: 'Computer Science',
    //       startDate: { year: 2012 },
    //       endDate: { year: 2014 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Engineering Management', endorsementCount: 30 },
    //       { name: 'Team Leadership', endorsementCount: 25 },
    //       { name: 'System Design', endorsementCount: 20 },
    //       { name: 'Mentoring', endorsementCount: 18 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2025-07-04',
    //       dataCompleteness: 'partial',
    //       source: 'Manual Entry',
    //       scopesGranted: []
    //     },
    //     stageData: {
    //       hrRound: {
    //         followups: ['Final approval', 'Offer preparation'],
    //         interviewNotes: ['Strong leadership skills', 'Expert in system design'],
    //         interviewDate: '2025-07-01',
    //         interviewerName: 'Jane Smith',
    //         interviewerEmail: 'jane.smith@company.com'
    //       }
    //     }
    //   },
    //   {
    //     id: 'uc2',
    //     firstName: 'Priya',
    //     lastName: 'Sharma',
    //     fullName: 'Priya Sharma',
    //     publicIdentifier: 'priya-sharma-pm',
    //     headline: 'Product Manager at Flipkart',
    //     summary: 'Product management professional with expertise in e-commerce',
    //     profilePicture: {
    //       displayImageUrl: '',
    //       artifacts: []
    //     },
    //     location: {
    //       country: 'India',
    //       city: 'Mumbai'
    //     },
    //     industry: 'E-commerce',
    //     email: 'priya.sharma@email.com',
    //     phone: {
    //       type: 'mobile',
    //       number: '+91 9876543221'
    //     },
    //     positions: [{
    //       title: 'Product Manager',
    //       companyName: 'Flipkart',
    //       companyUrn: 'flipkart',
    //       startDate: { month: 6, year: 2021 },
    //       isCurrent: true,
    //       location: 'Mumbai',
    //       description: 'Managing product roadmap for mobile applications'
    //     }],
    //     educations: [{
    //       schoolName: 'IIM Ahmedabad',
    //       degreeName: 'MBA',
    //       fieldOfStudy: 'Marketing',
    //       startDate: { year: 2018 },
    //       endDate: { year: 2020 },
    //       activities: '',
    //       description: ''
    //     }],
    //     certifications: [],
    //     skills: [
    //       { name: 'Product Strategy', endorsementCount: 30 },
    //       { name: 'Analytics', endorsementCount: 22 }
    //     ],
    //     endorsements: [],
    //     recommendations: { received: [], given: [] },
    //     visibility: { profile: 'PUBLIC', email: true, phone: true },
    //     connections: [],
    //     meta: {
    //       fetchedAt: '2024-01-15',
    //       dataCompleteness: 'full',
    //       source: 'LinkedIn APIs',
    //       scopesGranted: ['r_fullprofile']
    //     },
    //     stageData: {
    //       uncontacted: {
    //         notes: ['Excellent product management experience', 'Strong analytical skills']
    //       }
    //     }
    //   }
  ],
  "Invites Sent": [
    // {
    //   id: 'is1',
    //   firstName: 'Amit',
    //   lastName: 'Patel',
    //   fullName: 'Amit Patel',
    //   publicIdentifier: 'amit-patel-dev',
    //   headline: 'Full Stack Developer at Infosys',
    //   summary: 'Full stack developer with React and Node.js expertise',
    //   profilePicture: {
    //     displayImageUrl: '',
    //     artifacts: []
    //   },
    //   location: {
    //     country: 'India',
    //     city: 'Pune'
    //   },
    //   industry: 'Information Technology',
    //   email: 'amit.patel@email.com',
    //   phone: {
    //     type: 'mobile',
    //     number: '+91 9876543222'
    //   },
    //   positions: [{
    //     title: 'Full Stack Developer',
    //     companyName: 'Infosys',
    //     companyUrn: 'infosys',
    //     startDate: { month: 1, year: 2022 },
    //     isCurrent: true,
    //     location: 'Pune',
    //     description: 'Developing web applications using React and Node.js'
    //   }],
    //   educations: [{
    //     schoolName: 'Pune University',
    //     degreeName: 'B.E.',
    //     fieldOfStudy: 'Computer Engineering',
    //     startDate: { year: 2017 },
    //     endDate: { year: 2021 },
    //     activities: '',
    //     description: ''
    //   }],
    //   certifications: [],
    //   skills: [
    //     { name: 'React', endorsementCount: 20 },
    //     { name: 'Node.js', endorsementCount: 15 }
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: 'PUBLIC', email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: '2024-01-15',
    //     dataCompleteness: 'full',
    //     source: 'LinkedIn APIs',
    //     scopesGranted: ['r_fullprofile']
    //   },
    //   stageData: {
    //     invitesSent: {
    //       currentStatus: 'Pending Response',
    //       notes: ['Invite sent via LinkedIn', 'Follow up scheduled'],
    //       dateSent: '2024-01-10',
    //       responseStatus: 'No Response'
    //     }
    //   }
    // },
    // {
    //   id: 'is2',
    //   firstName: 'Sneha',
    //   lastName: 'Reddy',
    //   fullName: 'Sneha Reddy',
    //   publicIdentifier: 'sneha-reddy-designer',
    //   headline: 'UI/UX Designer at Zomato',
    //   summary: 'Creative designer with focus on user experience',
    //   profilePicture: {
    //     displayImageUrl: '',
    //     artifacts: []
    //   },
    //   location: {
    //     country: 'India',
    //     city: 'Hyderabad'
    //   },
    //   industry: 'Design',
    //   email: 'sneha.reddy@email.com',
    //   phone: {
    //     type: 'mobile',
    //     number: '+91 9876543223'
    //   },
    //   positions: [{
    //     title: 'UI/UX Designer',
    //     companyName: 'Zomato',
    //     companyUrn: 'zomato',
    //     startDate: { month: 8, year: 2021 },
    //     isCurrent: true,
    //     location: 'Hyderabad',
    //     description: 'Designing user interfaces for mobile and web applications'
    //   }],
    //   educations: [{
    //     schoolName: 'NID Ahmedabad',
    //     degreeName: 'M.Des',
    //     fieldOfStudy: 'Interaction Design',
    //     startDate: { year: 2019 },
    //     endDate: { year: 2021 },
    //     activities: '',
    //     description: ''
    //   }],
    //   certifications: [],
    //   skills: [
    //     { name: 'Figma', endorsementCount: 35 },
    //     { name: 'User Research', endorsementCount: 28 }
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: 'PUBLIC', email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: '2024-01-15',
    //     dataCompleteness: 'full',
    //     source: 'LinkedIn APIs',
    //     scopesGranted: ['r_fullprofile']
    //   },
    //   stageData: {
    //     invitesSent: {
    //       currentStatus: 'Responded - Interested',
    //       notes: ['Positive response received', 'Scheduling initial call'],
    //       dateSent: '2024-01-08',
    //       responseStatus: 'Interested'
    //     }
    //   }
    // }
  ],
  Applied: [
    // {
    //   id: 'ap1',
    //   firstName: 'Vikram',
    //   lastName: 'Singh',
    //   fullName: 'Vikram Singh',
    //   publicIdentifier: 'vikram-singh-data',
    //   headline: 'Data Scientist at Amazon',
    //   summary: 'Data scientist with machine learning expertise',
    //   profilePicture: {
    //     displayImageUrl: '',
    //     artifacts: []
    //   },
    //   location: {
    //     country: 'India',
    //     city: 'Bangalore'
    //   },
    //   industry: 'Technology',
    //   email: 'vikram.singh@email.com',
    //   phone: {
    //     type: 'mobile',
    //     number: '+91 9876543224'
    //   },
    //   positions: [{
    //     title: 'Data Scientist',
    //     companyName: 'Amazon',
    //     companyUrn: 'amazon',
    //     startDate: { month: 4, year: 2020 },
    //     isCurrent: true,
    //     location: 'Bangalore',
    //     description: 'Building ML models for recommendation systems'
    //   }],
    //   educations: [{
    //     schoolName: 'IISc Bangalore',
    //     degreeName: 'M.Tech',
    //     fieldOfStudy: 'Data Science',
    //     startDate: { year: 2018 },
    //     endDate: { year: 2020 },
    //     activities: '',
    //     description: ''
    //   }],
    //   certifications: [],
    //   skills: [
    //     { name: 'Python', endorsementCount: 40 },
    //     { name: 'Machine Learning', endorsementCount: 35 }
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: 'PUBLIC', email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: '2024-01-15',
    //     dataCompleteness: 'full',
    //     source: 'LinkedIn APIs',
    //     scopesGranted: ['r_fullprofile']
    //   },
    //   stageData: {
    //     applied: {
    //       appliedDate: '2024-01-12',
    //       resumeScore: 85,
    //       skillsMatch: '90%',
    //       experienceMatch: '80%',
    //       highlights: 'Python, Machine Learning, AWS',
    //       notes: ['Strong technical background', 'Good cultural fit']
    //     }
    //   }
    // },
    // {
    //   id: 'ap2',
    //   firstName: 'Kavya',
    //   lastName: 'Nair',
    //   fullName: 'Kavya Nair',
    //   publicIdentifier: 'kavya-nair-marketing',
    //   headline: 'Marketing Manager at Swiggy',
    //   summary: 'Digital marketing professional with growth expertise',
    //   profilePicture: {
    //     displayImageUrl: '',
    //     artifacts: []
    //   },
    //   location: {
    //     country: 'India',
    //     city: 'Bangalore'
    //   },
    //   industry: 'Marketing',
    //   email: 'kavya.nair@email.com',
    //   phone: {
    //     type: 'mobile',
    //     number: '+91 9876543225'
    //   },
    //   positions: [{
    //     title: 'Marketing Manager',
    //     companyName: 'Swiggy',
    //     companyUrn: 'swiggy',
    //     startDate: { month: 2, year: 2021 },
    //     isCurrent: true,
    //     location: 'Bangalore',
    //     description: 'Leading digital marketing campaigns and growth initiatives'
    //   }],
    //   educations: [{
    //     schoolName: 'XLRI Jamshedpur',
    //     degreeName: 'MBA',
    //     fieldOfStudy: 'Marketing',
    //     startDate: { year: 2018 },
    //     endDate: { year: 2020 },
    //     activities: '',
    //     description: ''
    //   }],
    //   certifications: [],
    //   skills: [
    //     { name: 'Digital Marketing', endorsementCount: 32 },
    //     { name: 'Growth Hacking', endorsementCount: 25 }
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: 'PUBLIC', email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: '2024-01-15',
    //     dataCompleteness: 'full',
    //     source: 'LinkedIn APIs',
    //     scopesGranted: ['r_fullprofile']
    //   },
    //   stageData: {
    //     applied: {
    //       appliedDate: '2024-01-14',
    //       resumeScore: 78,
    //       skillsMatch: '85%',
    //       experienceMatch: '75%',
    //       highlights: 'Digital Marketing, Analytics, Growth',
    //       notes: ['Strong marketing background', 'Good growth experience']
    //     }
    //   }
    // }
  ],
  "AI Interview": [
    // {
    //   id: "ai1",
    //   firstName: "Rohit",
    //   lastName: "Gupta",
    //   fullName: "Rohit Gupta",
    //   publicIdentifier: "rohit-gupta-backend",
    //   headline: "Backend Developer at PayTM",
    //   summary: "Backend developer with microservices expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Noida",
    //   },
    //   industry: "Fintech",
    //   email: "rohit.gupta@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543226",
    //   },
    //   positions: [
    //     {
    //       title: "Backend Developer",
    //       companyName: "PayTM",
    //       companyUrn: "paytm",
    //       startDate: { month: 7, year: 2021 },
    //       isCurrent: true,
    //       location: "Noida",
    //       description: "Developing scalable backend services",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "DTU Delhi",
    //       degreeName: "B.Tech",
    //       fieldOfStudy: "Computer Science",
    //       startDate: { year: 2017 },
    //       endDate: { year: 2021 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Java", endorsementCount: 28 },
    //     { name: "Microservices", endorsementCount: 22 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     aiInterview: {
    //       interviewedDate: "2024-01-16",
    //       resumeScore: 90,
    //       knowledgeScore: 85,
    //       communicationScore: 88,
    //       integrityScore: 92,
    //       proctoring: {
    //         deviceUsage: 95,
    //         assistance: 0,
    //         referenceMaterial: 0,
    //         environment: 90,
    //       },
    //       questions: [
    //         "Explain microservices architecture",
    //         "How do you handle database transactions?",
    //       ],
    //       notes: ["Strong technical knowledge", "Good communication skills"],
    //     },
    //   },
    // },
    // {
    //   id: "ai2",
    //   firstName: "Ananya",
    //   lastName: "Iyer",
    //   fullName: "Ananya Iyer",
    //   publicIdentifier: "ananya-iyer-frontend",
    //   headline: "Frontend Developer at Razorpay",
    //   summary: "Frontend developer specializing in React applications",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Bangalore",
    //   },
    //   industry: "Fintech",
    //   email: "ananya.iyer@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543227",
    //   },
    //   positions: [
    //     {
    //       title: "Frontend Developer",
    //       companyName: "Razorpay",
    //       companyUrn: "razorpay",
    //       startDate: { month: 9, year: 2020 },
    //       isCurrent: true,
    //       location: "Bangalore",
    //       description: "Building responsive web applications with React",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "VIT Vellore",
    //       degreeName: "B.Tech",
    //       fieldOfStudy: "Information Technology",
    //       startDate: { year: 2016 },
    //       endDate: { year: 2020 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "React", endorsementCount: 33 },
    //     { name: "JavaScript", endorsementCount: 29 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     aiInterview: {
    //       interviewedDate: "2024-01-17",
    //       resumeScore: 82,
    //       knowledgeScore: 80,
    //       communicationScore: 85,
    //       integrityScore: 88,
    //       proctoring: {
    //         deviceUsage: 92,
    //         assistance: 5,
    //         referenceMaterial: 10,
    //         environment: 85,
    //       },
    //       questions: [
    //         "Explain React hooks",
    //         "How do you optimize React performance?",
    //       ],
    //       notes: [
    //         "Good React knowledge",
    //         "Needs improvement in advanced concepts",
    //       ],
    //     },
    //   },
    // },
  ],
  Shortlisted: [
    // {
    //   id: "sl1",
    //   firstName: "Arjun",
    //   lastName: "Mehta",
    //   fullName: "Arjun Mehta",
    //   publicIdentifier: "arjun-mehta-devops",
    //   headline: "DevOps Engineer at Microsoft",
    //   summary: "DevOps engineer with cloud infrastructure expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Hyderabad",
    //   },
    //   industry: "Technology",
    //   email: "arjun.mehta@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543228",
    //   },
    //   positions: [
    //     {
    //       title: "DevOps Engineer",
    //       companyName: "Microsoft",
    //       companyUrn: "microsoft",
    //       startDate: { month: 5, year: 2019 },
    //       isCurrent: true,
    //       location: "Hyderabad",
    //       description: "Managing cloud infrastructure and CI/CD pipelines",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "BITS Pilani",
    //       degreeName: "B.E.",
    //       fieldOfStudy: "Computer Science",
    //       startDate: { year: 2015 },
    //       endDate: { year: 2019 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "AWS", endorsementCount: 45 },
    //     { name: "Docker", endorsementCount: 38 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     shortlisted: {
    //       interviewedDate: "2024-01-18",
    //       resumeScore: 88,
    //       knowledgeScore: 90,
    //       communicationScore: 85,
    //       integrityScore: 95,
    //       proctoring: {
    //         deviceUsage: 98,
    //         assistance: 0,
    //         referenceMaterial: 0,
    //         environment: 95,
    //       },
    //       questions: [
    //         "Explain CI/CD pipeline",
    //         "How do you handle infrastructure scaling?",
    //       ],
    //       notes: ["Excellent technical skills", "Ready for next round"],
    //     },
    //   },
    // },
    // {
    //   id: "sl2",
    //   firstName: "Meera",
    //   lastName: "Joshi",
    //   fullName: "Meera Joshi",
    //   publicIdentifier: "meera-joshi-qa",
    //   headline: "QA Engineer at Google",
    //   summary: "Quality assurance engineer with automation expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Bangalore",
    //   },
    //   industry: "Technology",
    //   email: "meera.joshi@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543229",
    //   },
    //   positions: [
    //     {
    //       title: "QA Engineer",
    //       companyName: "Google",
    //       companyUrn: "google",
    //       startDate: { month: 3, year: 2020 },
    //       isCurrent: true,
    //       location: "Bangalore",
    //       description: "Developing automated testing frameworks",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "Anna University",
    //       degreeName: "B.E.",
    //       fieldOfStudy: "Electronics and Communication",
    //       startDate: { year: 2016 },
    //       endDate: { year: 2020 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Selenium", endorsementCount: 30 },
    //     { name: "Test Automation", endorsementCount: 25 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     shortlisted: {
    //       interviewedDate: "2024-01-19",
    //       resumeScore: 85,
    //       knowledgeScore: 88,
    //       communicationScore: 90,
    //       integrityScore: 92,
    //       proctoring: {
    //         deviceUsage: 95,
    //         assistance: 0,
    //         referenceMaterial: 5,
    //         environment: 90,
    //       },
    //       questions: [
    //         "Explain test automation strategy",
    //         "How do you handle flaky tests?",
    //       ],
    //       notes: ["Strong QA background", "Good automation skills"],
    //     },
    //   },
    // },
  ],
  "First Interview": [
    // {
    //   id: "fi1",
    //   firstName: "Karthik",
    //   lastName: "Rao",
    //   fullName: "Karthik Rao",
    //   publicIdentifier: "karthik-rao-mobile",
    //   headline: "Mobile Developer at Ola",
    //   summary: "Mobile app developer with iOS and Android expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Bangalore",
    //   },
    //   industry: "Transportation",
    //   email: "karthik.rao@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543230",
    //   },
    //   positions: [
    //     {
    //       title: "Mobile Developer",
    //       companyName: "Ola",
    //       companyUrn: "ola",
    //       startDate: { month: 6, year: 2020 },
    //       isCurrent: true,
    //       location: "Bangalore",
    //       description:
    //         "Developing mobile applications for ride-sharing platform",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "PES University",
    //       degreeName: "B.Tech",
    //       fieldOfStudy: "Computer Science",
    //       startDate: { year: 2016 },
    //       endDate: { year: 2020 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "iOS", endorsementCount: 25 },
    //     { name: "Android", endorsementCount: 22 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     firstInterview: {
    //       followups: ["Schedule technical round", "Send coding assignment"],
    //       interviewNotes: [
    //         "Good mobile development experience",
    //         "Strong problem-solving skills",
    //       ],
    //       interviewDate: "2024-01-20",
    //       interviewerName: "Sarah Johnson",
    //       interviewerEmail: "sarah.johnson@company.com",
    //     },
    //   },
    // },
    // {
    //   id: "fi2",
    //   firstName: "Divya",
    //   lastName: "Krishnan",
    //   fullName: "Divya Krishnan",
    //   publicIdentifier: "divya-krishnan-analyst",
    //   headline: "Business Analyst at Accenture",
    //   summary: "Business analyst with domain expertise in finance",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Chennai",
    //   },
    //   industry: "Consulting",
    //   email: "divya.krishnan@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543231",
    //   },
    //   positions: [
    //     {
    //       title: "Business Analyst",
    //       companyName: "Accenture",
    //       companyUrn: "accenture",
    //       startDate: { month: 8, year: 2021 },
    //       isCurrent: true,
    //       location: "Chennai",
    //       description: "Analyzing business requirements and processes",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "IIT Madras",
    //       degreeName: "B.Tech",
    //       fieldOfStudy: "Industrial Engineering",
    //       startDate: { year: 2017 },
    //       endDate: { year: 2021 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Business Analysis", endorsementCount: 20 },
    //     { name: "Process Improvement", endorsementCount: 18 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     firstInterview: {
    //       followups: [
    //         "Arrange case study discussion",
    //         "Connect with domain expert",
    //       ],
    //       interviewNotes: [
    //         "Strong analytical skills",
    //         "Good business understanding",
    //       ],
    //       interviewDate: "2024-01-21",
    //       interviewerName: "Michael Chen",
    //       interviewerEmail: "michael.chen@company.com",
    //     },
    //   },
    // },
  ],
  "Other Interviews": [
    // {
    //   id: "oi1",
    //   firstName: "Suresh",
    //   lastName: "Babu",
    //   fullName: "Suresh Babu",
    //   publicIdentifier: "suresh-babu-architect",
    //   headline: "Solution Architect at IBM",
    //   summary: "Solution architect with enterprise application expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Pune",
    //   },
    //   industry: "Technology",
    //   email: "suresh.babu@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543232",
    //   },
    //   positions: [
    //     {
    //       title: "Solution Architect",
    //       companyName: "IBM",
    //       companyUrn: "ibm",
    //       startDate: { month: 4, year: 2018 },
    //       isCurrent: true,
    //       location: "Pune",
    //       description: "Designing enterprise solutions and architecture",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "NIT Trichy",
    //       degreeName: "M.Tech",
    //       fieldOfStudy: "Computer Science",
    //       startDate: { year: 2014 },
    //       endDate: { year: 2016 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Solution Architecture", endorsementCount: 40 },
    //     { name: "Enterprise Systems", endorsementCount: 35 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     otherInterviews: {
    //       followups: ["Technical architecture review", "Team fit assessment"],
    //       interviewNotes: [
    //         "Excellent architecture knowledge",
    //         "Strong leadership potential",
    //       ],
    //       interviewDate: "2024-01-22",
    //       interviewerName: "David Wilson",
    //       interviewerEmail: "david.wilson@company.com",
    //     },
    //   },
    // },
    // {
    //   id: "oi2",
    //   firstName: "Lakshmi",
    //   lastName: "Venkat",
    //   fullName: "Lakshmi Venkat",
    //   publicIdentifier: "lakshmi-venkat-scrum",
    //   headline: "Scrum Master at Wipro",
    //   summary: "Certified Scrum Master with agile methodology expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Hyderabad",
    //   },
    //   industry: "Technology",
    //   email: "lakshmi.venkat@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543233",
    //   },
    //   positions: [
    //     {
    //       title: "Scrum Master",
    //       companyName: "Wipro",
    //       companyUrn: "wipro",
    //       startDate: { month: 2, year: 2020 },
    //       isCurrent: true,
    //       location: "Hyderabad",
    //       description: "Facilitating agile development processes",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "JNTU Hyderabad",
    //       degreeName: "MBA",
    //       fieldOfStudy: "Project Management",
    //       startDate: { year: 2017 },
    //       endDate: { year: 2019 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Scrum", endorsementCount: 30 },
    //     { name: "Agile Methodology", endorsementCount: 28 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     otherInterviews: {
    //       followups: ["Cultural fit assessment", "Reference check"],
    //       interviewNotes: [
    //         "Strong agile experience",
    //         "Good team management skills",
    //       ],
    //       interviewDate: "2024-01-23",
    //       interviewerName: "Lisa Anderson",
    //       interviewerEmail: "lisa.anderson@company.com",
    //     },
    //   },
    // },
  ],
  "HR Round": [
    // {
    //   id: "hr1",
    //   firstName: "Ravi",
    //   lastName: "Teja",
    //   fullName: "Ravi Teja",
    //   publicIdentifier: "ravi-teja-sales",
    //   headline: "Sales Manager at Salesforce",
    //   summary: "Sales professional with B2B software expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Mumbai",
    //   },
    //   industry: "Software",
    //   email: "ravi.teja@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543234",
    //   },
    //   positions: [
    //     {
    //       title: "Sales Manager",
    //       companyName: "Salesforce",
    //       companyUrn: "salesforce",
    //       startDate: { month: 7, year: 2019 },
    //       isCurrent: true,
    //       location: "Mumbai",
    //       description: "Managing enterprise sales for CRM solutions",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "XLRI Jamshedpur",
    //       degreeName: "MBA",
    //       fieldOfStudy: "Sales & Marketing",
    //       startDate: { year: 2017 },
    //       endDate: { year: 2019 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "B2B Sales", endorsementCount: 35 },
    //     { name: "CRM", endorsementCount: 30 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     hrRound: {
    //       followups: ["Salary negotiation", "Background verification"],
    //       interviewNotes: [
    //         "Strong cultural fit",
    //         "Excellent communication skills",
    //       ],
    //       interviewDate: "2024-01-24",
    //       interviewerName: "Jennifer Smith",
    //       interviewerEmail: "jennifer.smith@company.com",
    //     },
    //   },
    // },
    // {
    //   id: "hr2",
    //   firstName: "Pooja",
    //   lastName: "Agarwal",
    //   fullName: "Pooja Agarwal",
    //   publicIdentifier: "pooja-agarwal-finance",
    //   headline: "Finance Manager at HDFC Bank",
    //   summary: "Finance professional with banking domain expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Delhi",
    //   },
    //   industry: "Banking",
    //   email: "pooja.agarwal@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543235",
    //   },
    //   positions: [
    //     {
    //       title: "Finance Manager",
    //       companyName: "HDFC Bank",
    //       companyUrn: "hdfc-bank",
    //       startDate: { month: 5, year: 2020 },
    //       isCurrent: true,
    //       location: "Delhi",
    //       description: "Managing financial operations and compliance",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "FMS Delhi",
    //       degreeName: "MBA",
    //       fieldOfStudy: "Finance",
    //       startDate: { year: 2018 },
    //       endDate: { year: 2020 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Financial Analysis", endorsementCount: 28 },
    //     { name: "Risk Management", endorsementCount: 25 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     hrRound: {
    //       followups: ["Final approval", "Offer preparation"],
    //       interviewNotes: [
    //         "Strong finance background",
    //         "Good analytical skills",
    //       ],
    //       interviewDate: "2024-01-25",
    //       interviewerName: "Robert Johnson",
    //       interviewerEmail: "robert.johnson@company.com",
    //     },
    //   },
    // },
  ],
  "Salary Negotiation": [
    // {
    //   id: "sn1",
    //   firstName: "Arun",
    //   lastName: "Kumar",
    //   fullName: "Arun Kumar",
    //   publicIdentifier: "arun-kumar-lead",
    //   headline: "Tech Lead at Flipkart",
    //   summary: "Technical leader with team management experience",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Bangalore",
    //   },
    //   industry: "E-commerce",
    //   email: "arun.kumar@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543236",
    //   },
    //   positions: [
    //     {
    //       title: "Tech Lead",
    //       companyName: "Flipkart",
    //       companyUrn: "flipkart",
    //       startDate: { month: 3, year: 2019 },
    //       isCurrent: true,
    //       location: "Bangalore",
    //       description: "Leading development team for e-commerce platform",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "IIT Bombay",
    //       degreeName: "B.Tech",
    //       fieldOfStudy: "Computer Science",
    //       startDate: { year: 2015 },
    //       endDate: { year: 2019 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Team Leadership", endorsementCount: 32 },
    //     { name: "System Design", endorsementCount: 28 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     salaryNegotiation: {
    //       salary: "₹25,00,000 - ₹30,00,000",
    //       negotiation: "Candidate requested ₹32,00,000, under discussion",
    //       followups: ["Final salary approval", "Benefits discussion"],
    //       interviewNotes: [
    //         "Strong technical leadership",
    //         "Good team management",
    //       ],
    //       interviewDate: "2024-01-26",
    //       interviewerName: "Mark Thompson",
    //       interviewerEmail: "mark.thompson@company.com",
    //     },
    //   },
    // },
    // {
    //   id: "sn2",
    //   firstName: "Nisha",
    //   lastName: "Kapoor",
    //   fullName: "Nisha Kapoor",
    //   publicIdentifier: "nisha-kapoor-operations",
    //   headline: "Operations Head at Zomato",
    //   summary: "Operations leader with logistics expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Gurgaon",
    //   },
    //   industry: "Food Delivery",
    //   email: "nisha.kapoor@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543237",
    //   },
    //   positions: [
    //     {
    //       title: "Operations Head",
    //       companyName: "Zomato",
    //       companyUrn: "zomato",
    //       startDate: { month: 6, year: 2018 },
    //       isCurrent: true,
    //       location: "Gurgaon",
    //       description: "Managing operations and logistics for food delivery",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "ISB Hyderabad",
    //       degreeName: "MBA",
    //       fieldOfStudy: "Operations",
    //       startDate: { year: 2016 },
    //       endDate: { year: 2017 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Operations Management", endorsementCount: 40 },
    //     { name: "Logistics", endorsementCount: 35 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     salaryNegotiation: {
    //       salary: "₹35,00,000 - ₹40,00,000",
    //       negotiation: "Agreed on ₹38,00,000 with performance bonus",
    //       followups: ["Contract preparation", "Joining date confirmation"],
    //       interviewNotes: [
    //         "Excellent operations experience",
    //         "Strong leadership skills",
    //       ],
    //       interviewDate: "2024-01-27",
    //       interviewerName: "Sarah Williams",
    //       interviewerEmail: "sarah.williams@company.com",
    //     },
    //   },
    // },
  ],
  "Offer Sent": [
    // {
    //   id: "os1",
    //   firstName: "Manish",
    //   lastName: "Jain",
    //   fullName: "Manish Jain",
    //   publicIdentifier: "manish-jain-consultant",
    //   headline: "Senior Consultant at Deloitte",
    //   summary: "Management consultant with strategy expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Mumbai",
    //   },
    //   industry: "Consulting",
    //   email: "manish.jain@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543238",
    //   },
    //   positions: [
    //     {
    //       title: "Senior Consultant",
    //       companyName: "Deloitte",
    //       companyUrn: "deloitte",
    //       startDate: { month: 8, year: 2020 },
    //       isCurrent: true,
    //       location: "Mumbai",
    //       description: "Providing strategic consulting to enterprise clients",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "IIM Calcutta",
    //       degreeName: "MBA",
    //       fieldOfStudy: "Strategy",
    //       startDate: { year: 2018 },
    //       endDate: { year: 2020 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Strategy Consulting", endorsementCount: 30 },
    //     { name: "Business Strategy", endorsementCount: 25 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     offerSent: {
    //       offerAcceptanceStatus: "Pending",
    //       offerSentDate: "2024-01-28",
    //       followups: ["Follow up on offer status", "Answer any questions"],
    //       interviewNotes: [
    //         "Excellent strategic thinking",
    //         "Strong consulting background",
    //       ],
    //       interviewerName: "Emily Davis",
    //       interviewerEmail: "emily.davis@company.com",
    //     },
    //   },
    // },
    // {
    //   id: "os2",
    //   firstName: "Shreya",
    //   lastName: "Malhotra",
    //   fullName: "Shreya Malhotra",
    //   publicIdentifier: "shreya-malhotra-hr",
    //   headline: "HR Manager at TCS",
    //   summary: "Human resources professional with talent management expertise",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Chennai",
    //   },
    //   industry: "Human Resources",
    //   email: "shreya.malhotra@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543239",
    //   },
    //   positions: [
    //     {
    //       title: "HR Manager",
    //       companyName: "TCS",
    //       companyUrn: "tcs",
    //       startDate: { month: 4, year: 2019 },
    //       isCurrent: true,
    //       location: "Chennai",
    //       description: "Managing talent acquisition and employee relations",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "TISS Mumbai",
    //       degreeName: "MA",
    //       fieldOfStudy: "Human Resources",
    //       startDate: { year: 2017 },
    //       endDate: { year: 2019 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Talent Management", endorsementCount: 28 },
    //     { name: "Employee Relations", endorsementCount: 22 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     offerSent: {
    //       offerAcceptanceStatus: "Accepted",
    //       offerSentDate: "2024-01-26",
    //       followups: ["Onboarding preparation", "Welcome kit preparation"],
    //       interviewNotes: ["Strong HR background", "Good cultural fit"],
    //       interviewerName: "James Wilson",
    //       interviewerEmail: "james.wilson@company.com",
    //     },
    //   },
    // },
  ],
  Archives: [
    // {
    //   id: "ar1",
    //   firstName: "Deepak",
    //   lastName: "Verma",
    //   fullName: "Deepak Verma",
    //   publicIdentifier: "deepak-verma-rejected",
    //   headline: "Software Engineer at Infosys",
    //   summary: "Software engineer with Java development experience",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Pune",
    //   },
    //   industry: "Technology",
    //   email: "deepak.verma@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543240",
    //   },
    //   positions: [
    //     {
    //       title: "Software Engineer",
    //       companyName: "Infosys",
    //       companyUrn: "infosys",
    //       startDate: { month: 7, year: 2021 },
    //       isCurrent: true,
    //       location: "Pune",
    //       description: "Developing enterprise Java applications",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "Pune University",
    //       degreeName: "B.E.",
    //       fieldOfStudy: "Computer Engineering",
    //       startDate: { year: 2017 },
    //       endDate: { year: 2021 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Java", endorsementCount: 15 },
    //     { name: "Spring", endorsementCount: 12 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     archived: {
    //       reason: "Did not meet technical requirements",
    //       archivedDate: "2024-01-15",
    //       notes: ["Insufficient experience", "Technical skills gap"],
    //     },
    //   },
    // },
    // {
    //   id: "ar2",
    //   firstName: "Ritika",
    //   lastName: "Gupta",
    //   fullName: "Ritika Gupta",
    //   publicIdentifier: "ritika-gupta-declined",
    //   headline: "Marketing Executive at HUL",
    //   summary: "Marketing professional with FMCG experience",
    //   profilePicture: {
    //     displayImageUrl: "",
    //     artifacts: [],
    //   },
    //   location: {
    //     country: "India",
    //     city: "Mumbai",
    //   },
    //   industry: "FMCG",
    //   email: "ritika.gupta@email.com",
    //   phone: {
    //     type: "mobile",
    //     number: "+91 9876543241",
    //   },
    //   positions: [
    //     {
    //       title: "Marketing Executive",
    //       companyName: "HUL",
    //       companyUrn: "hul",
    //       startDate: { month: 9, year: 2020 },
    //       isCurrent: true,
    //       location: "Mumbai",
    //       description: "Managing brand marketing campaigns",
    //     },
    //   ],
    //   educations: [
    //     {
    //       schoolName: "Mumbai University",
    //       degreeName: "MBA",
    //       fieldOfStudy: "Marketing",
    //       startDate: { year: 2018 },
    //       endDate: { year: 2020 },
    //       activities: "",
    //       description: "",
    //     },
    //   ],
    //   certifications: [],
    //   skills: [
    //     { name: "Brand Marketing", endorsementCount: 18 },
    //     { name: "Campaign Management", endorsementCount: 15 },
    //   ],
    //   endorsements: [],
    //   recommendations: { received: [], given: [] },
    //   visibility: { profile: "PUBLIC", email: true, phone: true },
    //   connections: [],
    //   meta: {
    //     fetchedAt: "2024-01-15",
    //     dataCompleteness: "full",
    //     source: "LinkedIn APIs",
    //     scopesGranted: ["r_fullprofile"],
    //   },
    //   stageData: {
    //     archived: {
    //       reason: "Candidate declined offer",
    //       archivedDate: "2024-01-20",
    //       notes: [
    //         "Received counter offer",
    //         "Decided to stay with current company",
    //       ],
    //     },
    //   },
    // },
  ],
};
