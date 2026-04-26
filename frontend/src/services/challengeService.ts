import api from './api';
import { Challenge } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const challengeService = {
  getChallenges: async (): Promise<Challenge[]> => {
    const response = await api.get<ApiResponse<Challenge[]>>('/challenges');
    return response.data.data;
  },

  getChallengeById: async (id: string): Promise<Challenge> => {
    const response = await api.get<ApiResponse<Challenge>>(`/challenges/${id}`);
    return response.data.data;
  },

  getCodeforcesProblems: async (): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>('/challenges/codeforces');
    return response.data.data;
  },
};
