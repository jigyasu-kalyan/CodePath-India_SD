import api from './api';
import { Submission } from '../types';

export const submissionService = {
  submitCode: async (challengeId: number, code: string, language: string): Promise<Submission> => {
    const response = await api.post<Submission>('/submissions', { challengeId, code, language });
    return response.data;
  },

  getMySubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/submissions/me');
    return response.data;
  },
};
