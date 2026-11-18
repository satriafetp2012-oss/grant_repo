export type Language = "id" | "en";

export type GrantOrigin = "IDN" | "INT";

export type GrantStatus =
  | "live"
  | "recurring"
  | "closed"
  | "paused"
  | "invite"
  | "institution"
  | "resource";

export type EligibilityRole =
  | "lead"
  | "partner"
  | "fellowship"
  | "institution"
  | "ineligible";

export type ResearchDomain = "Health" | "Social Science" | "Road Safety";

export interface RawGrantEntry {
  id?: string;
  n: string; // Name
  f: string; // Funder
  o: GrantOrigin; // Origin: IDN | INT
  reg: string; // Region / Country
  th: string[]; // Themes
  domains?: ResearchDomain[]; // High-level domain tags
  amt: string; // Award amount
  dl: string | null; // ISO deadline YYYY-MM-DD or null
  dlnote: string; // Deadline note
  st: GrantStatus; // Status
  el: EligibilityRole; // Indonesian role
  eln: string; // Eligibility note
  d: string; // Description
  u: string; // Official URL
  win: number[]; // Opening window months (1-12)
  warn?: string; // Important warning / eligibility trap
  on?: string; // Opportunity number / Grants.gov ID
  custom?: boolean;
}

export interface PipelineTask {
  id: string;
  text: string;
  done: boolean;
}

export type PipelineStage =
  | "watch"
  | "prep"
  | "submitted"
  | "awarded"
  | "rejected";

export interface PipelineItem {
  s: PipelineStage;
  owner: string;
  note: string;
  ts: number;
  tasks?: PipelineTask[];
}

export interface AlertRule {
  id: string;
  name: string;
  recipientEmail: string;
  frequency: "instant" | "weekly" | "monthly";
  keywords: string[];
  domains: ResearchDomain[];
  origins: GrantOrigin[];
  roles: EligibilityRole[];
  onlyOpenOrSoon: boolean;
  enabled: boolean;
  createdAt: number;
}

export interface GuidelineItem {
  id: string;
  funder: string;
  schemeName: string;
  origin: GrantOrigin;
  domains: ResearchDomain[];
  tktRange: string;
  budgetCap: string;
  overheadCap: string;
  cycleWindow: string;
  eligibilitySummaryId: string;
  eligibilitySummaryEn: string;
  requirementsId: string[];
  requirementsEn: string[];
  documentsId: string[];
  documentsEn: string[];
  officialUrl: string;
  portalName: string;
}

export interface ExcludedFunder {
  n: string;
  why: string;
  u: string;
}

export interface PortalEntry {
  g: string;
  n: string;
  d: string;
  u: string;
}

export interface WatchEntry {
  k: string;
  n: string;
  why: string;
  u: string;
}

export interface TrackerState {
  items: Record<string, PipelineItem>;
  custom: RawGrantEntry[];
  checks: Record<string, { by: string; ts: number }>;
  alerts: AlertRule[];
  dismissedMatches: string[];
  v: number;
  ts: number;
}
