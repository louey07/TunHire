export type UserRole = "CANDIDATE" | "RECRUITER";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type ApplicationStatus =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "SHORTLISTED"
  | "REJECTED";

export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export type WorkMode = "ON_SITE" | "HYBRID" | "REMOTE";

export type RecruiterJobSummary = {
  id: number;
  title: string;
  location: string;
  workMode?: WorkMode | string;
  status: JobStatus | string;
};

export type JobFormValues = {
  title: string;
  location: string;
  workMode: WorkMode;
  contractType: string;
  description: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
};

export type Job = {
  id: number;
  title: string;
  location: string;
  workMode?: WorkMode | string;
  contractType: string;
  description: string;
  companyId?: number;
  companyName?: string | null;
  companySlug?: string | null;
  companyLogoUrl?: string | null;
  companyLocation?: string | null;
  companyDescription?: string | null;
  companyWebsite?: string | null;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  status?: JobStatus;
};

export type Application = {
  id: number;
  jobId?: number;
  status?: ApplicationStatus | string;
  createdAt?: string;
  score?: number;
};

export type CandidateProfile = {
  id: number;
  userId: number;
  bio: string | null;
  resumeUrl: string | null;
  resumeFileName?: string | null;
  resumeContentType?: string | null;
  hasResume?: boolean;
  location: string | null;
  availableFrom: string | null;
  yearsOfExperience: number | null;
  skills: { id: number; skillName: string }[];
};

export type RankedApplicationRaw = {
  applicationId: number;
  jobId: number;
  userId: number;
  status: ApplicationStatus;
  createdAt: string;
  score: number | null;
  level: string | null;
  matchedSkills: string[] | null;
  gaps?: string[] | null;
  summary?: string | null;
};

export type EnrichedRankedApplication = RankedApplicationRaw & {
  candidateFirstName?: string;
  candidateLastName?: string;
  resumeUrl?: string | null;
};

/** @deprecated Use EnrichedRankedApplication or RankedApplicationRaw */
export type RankedApplication = EnrichedRankedApplication;

/** @deprecated Use EnrichedRankedApplication fields (applicationId) */
export type LegacyRankedApplication = EnrichedRankedApplication & {
  id?: number;
  candidate?: {
    firstName?: string;
    lastName?: string;
  };
};

export type PaginatedResponse<T> = {
  content?: T[];
  totalPages?: number;
  number?: number;
  totalElements?: number;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type MemberRole = "RECRUITER_ADMIN" | "MEMBER";

export type CompanyMembershipSummary = {
  companyId: number;
  companyName: string;
  slug?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  role: MemberRole;
  joinedAt?: string;
};

export type MembershipResponse = {
  id: number;
  companyId: number;
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role: MemberRole;
  joinedAt?: string;
};

export type Company = {
  id: number;
  name: string;
  slug?: string | null;
  location?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
};

export type CompanyFormValues = {
  name: string;
  location: string;
  description: string;
  logoUrl: string;
  website: string;
};

export type DashboardApplicationItem = {
  id: number;
  jobId: number;
  jobTitle: string;
  userId: number;
  candidateFirstName: string;
  candidateLastName: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type CompanyDashboardResponse = {
  company: Company;
  jobs: RecruiterJobSummary[];
  applications: DashboardApplicationItem[];
};

export type ConversationType = "COMPANY_TEAM" | "DIRECT";

export type ChatConversation = {
  id: number;
  type: ConversationType;
  companyId: number | null;
  directUserId: number | null;
  title: string;
  otherParticipantName?: string | null;
  companyName?: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  updatedAt: string;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderFirstName: string;
  senderLastName: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
};
