export interface User {
  id: number;
  name: string;
  email: string;
  preferredLanguage: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
export interface ParsedCV {
  name: string | null;
  email: string | null;
  phone: string | null;
  summary: string | null;
  skills: string[];
  experiences: {
    title: string;
    company: string | null;
    startDate: string | null;
    endDate: string | null;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string | null;
    year: string | null;
  }[];
  languages: {
    language: string;
    level: string | null;
  }[];
  certifications: string[];
  projects: {
    name: string;
    description: string;
  }[];
}

export type CVStatus = "pending" | "processing" | "completed" | "failed";

export interface CV {
  id: number;
  userId: number;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  extractedText?: string | null;
  parsedData: ParsedCV | null;
  processingStatus: CVStatus;
  processingError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: { path: string; message: string }[];
}

export interface JobOfferRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: string | null;
  requiredEducation: string | null;
  requiredLanguages: { language: string; level: string | null }[];
  responsibilities: string[];
  keywords: string[];
  summary: string | null;
}

export type JobOfferParsingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface JobOffer {
  id: number;
  userId: number;
  title: string;
  company: string | null;
  description: string;
  sourceUrl: string | null;
  location: string | null;
  requirements: JobOfferRequirements | null;
  parsingStatus: JobOfferParsingStatus;
  parsingError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MatchedRequirement {
  requirement: string;
  evidence: string;
}

export interface MissingRequirement {
  requirement: string;
  reason: string;
}

export interface RelevantExperience {
  title: string;
  company: string | null;
  relevance: string;
}

export interface MatchingDetails {
  matchedSkills: string[];
  missingSkills: string[];
  matchedRequirements: MatchedRequirement[];
  missingRequirements: MissingRequirement[];
  relevantExperiences: RelevantExperience[];
  strengths: string[];
  gaps: string[];
}

export interface AnalysisRecommendations {
  list: string[];
  atsKeywords: string[];
}

export interface JobAnalysis {
  id: number;
  userId: number;
  cvId: number;
  jobOfferId: number;
  matchingScore: number;
  matchingDetails: MatchingDetails;
  recommendations: AnalysisRecommendations | null;
  createdAt: string;
  updatedAt: string;

  cv?: {
    id: number;
    originalFileName: string;
    parsedData: ParsedCV | null;
  };
  jobOffer?: {
    id: number;
    title: string;
    company: string | null;
    location: string | null;
    requirements?: JobOfferRequirements | null;
  };
}
