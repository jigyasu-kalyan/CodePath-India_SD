import api from './api';
import { Submission } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const submissionService = {
  submitCode: async (challengeId: string | number, code: string, language: string): Promise<Submission> => {
    const response = await api.post<Submission>('/submissions', { challengeId, code, language });
    return response.data;
  },

  verifyCodeforces: async (challengeId: string, handle: string): Promise<Submission> => {
    const response = await api.post<ApiResponse<Submission>>('/submissions/verify', { challengeId, handle });
    return response.data.data;
  },

  getSubmissionsByChallenge: async (challengeId: number): Promise<Submission[]> => {
    const response = await api.get<Submission[]>(`/challenges/${challengeId}/submissions`);
    return response.data;
  },

  getMySubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/submissions/me');
    return response.data;
  },
};
