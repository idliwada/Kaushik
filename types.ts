export enum LeadStatus {
  NEW = "New",
  CONTACTED = "Contacted",
  NURTURING = "Nurturing",
  MEETING_BOOKED = "Meeting Booked",
  CLOSED = "Closed",
  ARCHIVED = "Archived"
}

export enum InteractionType {
  EMAIL = "Email",
  CALL = "Call",
  MEETING = "Meeting",
  LINKEDIN = "LinkedIn",
  NOTE = "Note"
}

export interface Interaction {
  id: string;
  contactId: string;
  date: string; // ISO Date string
  type: InteractionType;
  notes: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  companyId?: string;
  linkedInUrl?: string;
  location?: string;
  status: LeadStatus;
  tags: string[];
  lastContacted?: string; // ISO Date
  followUpFrequencyDays: number; // 30 for VIP, 90 for Regular, etc.
  notes?: string;
  avatarUrl?: string;
}

export interface DashboardStats {
  totalContacts: number;
  interactionsLast30Days: number;
  dueFollowUps: number;
  pipelineValue: number; // Mock value for simplicity
}