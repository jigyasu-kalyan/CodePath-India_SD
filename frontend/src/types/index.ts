export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Challenge {
  id: string | number;
  title: string;
  difficulty: string;
  tags: string[];
  source: string;
  description?: string;
  rating?: number;
  sampleInput?: string;
  sampleOutput?: string;
  testCases?: { input: string; output: string }[];
}

export interface Submission {
  id: number;
  challengeId: number;
  userId: number;
  code: string;
  language: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'PENDING';
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string | number;
  name: string;
  score: number;
  badges: string[];
}

export interface Classroom {
  id: number | string;
  name: string;
  joinCode: string;
  teacherId: number | string;
  meetLink?: string;
  scheduleDays?: string;
  scheduleTime?: string;
  _count?: {
    students: number;
  };
}
