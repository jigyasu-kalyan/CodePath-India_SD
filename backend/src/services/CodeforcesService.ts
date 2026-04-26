import axios from 'axios';

export interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

export class CodeforcesService {
  private baseUrl = 'https://codeforces.com/api';
  private cache = new Map<string, CodeforcesProblem[]>();

  async getProblems(tags?: string, limit: number = 50): Promise<CodeforcesProblem[]> {
    const cacheKey = `problems:${tags || 'all'}`;
    const cachedProblems = this.cache.get(cacheKey);
    if (cachedProblems) {
      return cachedProblems.slice(0, limit);
    }

    const url = tags
      ? `${this.baseUrl}/problemset.problems?tags=${tags}`
      : `${this.baseUrl}/problemset.problems`;

    try {
      const res = await axios.get(url, { timeout: 10000 });
      const problems = res.data.result?.problems || [];
      this.cache.set(cacheKey, problems);
      return problems.slice(0, limit);
    } catch {
      return [];
    }
  }

  async getProblemById(contestId: number, index: string): Promise<CodeforcesProblem | null> {
    try {
      const res = await axios.get(`${this.baseUrl}/problemset.problems`, { timeout: 10000 });
      const problems = res.data.result?.problems || [];
      return problems.find((p: any) => p.contestId === contestId && p.index === index) || null;
    } catch {
      return null;
    }
  }

  async searchProblems(keyword: string): Promise<CodeforcesProblem[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/problemset.problems`, { timeout: 10000 });
      const problems = res.data.result?.problems || [];
      const term = keyword.toLowerCase();
      return problems.filter((p: any) =>
        p.name.toLowerCase().includes(term) || p.tags.some((t: string) => t.toLowerCase().includes(term))
      );
    } catch {
      return [];
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
