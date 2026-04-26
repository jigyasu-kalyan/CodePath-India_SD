import api from './api';
import { Challenge } from '../types';

export const challengeService = {
  getChallenges: async (): Promise<Challenge[]> => {
    const response = await api.get<Challenge[]>('/challenges');
    return response.data;
  },

  getChallengeById: async (id: number): Promise<Challenge> => {
    const response = await api.get<Challenge>(`/challenges/${id}`);
    return response.data;
  },

  getCodeforcesProblems: async (): Promise<any[]> => {
    const response = await api.get('/challenges/codeforces');
    return response.data;
  },
};
