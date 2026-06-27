export type Role = 'Individual' | 'Police' | 'PWD';

export interface User {
  email: string;
  role: Role;
  points: number;
}

export type ReportStatus = 'Pending' | 'Validated' | 'Initiated' | 'Resolving' | 'Fixed';

export interface Comment {
  text: string;
  authorEmail: string;
  timestamp: number;
}

export interface Report {
  id: string;
  type: string;
  subCategory?: string;
  roadType?: string;
  location: string;
  status: ReportStatus;
  reporterEmail: string;
  validatorEmail?: string;
  comments: Comment[];
  createdAt: number;
  pictures?: { left: boolean, center: boolean, right: boolean };
  aiTriage?: {
    level: 'CRITICAL' | 'HIGH' | 'MODERATE';
    score: number;
    reason: string;
  };
}
