export enum AttachmentType {
  LINK = 'LINK',
  FILE = 'FILE'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  xp: number;
  groupRank: number;
  globalRank: number;
}

export interface StudentRank {
  rank: number;
  name: string;
  points: number;
  avgXp: string;
  isCurrentUser?: boolean;
}

export interface ActivityItem {
  id: string;
  date: string;
  action: string;
  xpChange: number | null;
  coinChange: number;
  negative?: boolean;
}


export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  description: string;
  claimed: boolean;
  image?: string;
}

export interface HomeworkSubmission {
  lessonId: number;
  date: string;
  status: 'Awaiting approval' | 'Rejected' | 'Approved';
  comment?: string;
}

export type ViewState = 'login' | 'dashboard' | 'leaderboard' | 'lessons' | 'rewards';

export interface CurriculumItem {
  id: string;
  order: number;
  topic: string;
  date: string; // Format: "YYYY-MM-DD"
  time: string; // Format: "HH:mm"
  duration: string; // e.g. "90 min"
  status: 'upcoming' | 'attended' | 'absent';
}