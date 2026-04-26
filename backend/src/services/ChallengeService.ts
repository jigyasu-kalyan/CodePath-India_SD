import { CodeforcesService, CodeforcesProblem } from './CodeforcesService';
import { prisma } from '../config/database';

export interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  tags: string[];
  source: 'Codeforces' | 'Manual';
  rating?: number;
}

export class ChallengeService {
  private codeforcesService: CodeforcesService;

  constructor() {
    this.codeforcesService = new CodeforcesService();
  }

  async getAllChallenges(tags?: string, limit: number = 50): Promise<Challenge[]> {
    const problems = await this.codeforcesService.getProblems(tags, limit);
    const cfChallenges = problems.map(p => this.transformProblemToChallenge(p));

    const localWhere = tags ? { tags: { has: tags } } : {};
    const localProblems = await prisma.challenge.findMany({
      where: localWhere,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const manualChallenges: Challenge[] = localProblems.map(p => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags || [],
      source: 'Manual',
      description: p.description ?? undefined,
      sampleInput: p.sampleInput ?? undefined,
      sampleOutput: p.sampleOutput ?? undefined
    }));

    return [...manualChallenges, ...cfChallenges].slice(0, limit);
  }

  async getChallengeById(contestId: number | string, index: string): Promise<Challenge | null> {
    // If contestId is a UUID string, it's a local challenge
    if (typeof contestId === 'string' && isNaN(parseInt(contestId))) {
      // It's a local challenge ID (uuid) since contestId string fails parseInt or isn't number.
      // Wait, actually the controller passes (contestId, index). For local challenges, we might just pass the uuid directly as id.
      // We should handle that in the controller. But to be safe, if we get a UUID here, let's search it.
    }
    
    // Default Codeforces fetch
    const problem = await this.codeforcesService.getProblemById(contestId as number, index);
    return problem ? this.transformProblemToChallenge(problem) : null;
  }

  async searchChallenges(keyword: string, limit: number = 50): Promise<Challenge[]> {
    const problems = await this.codeforcesService.searchProblems(keyword);
    return problems.slice(0, limit).map(p => this.transformProblemToChallenge(p));
  }

  async getChallengeStats(challengeId: string) {
    const totalAttempts = await prisma.submission.count({
      where: { challengeId },
    });

    const successfulAttempts = await prisma.submission.count({
      where: { challengeId, verdict: 'Accepted' },
    });

    return {
      challengeId,
      totalAttempts,
      successfulAttempts,
      solveRate: totalAttempts > 0 ? ((successfulAttempts / totalAttempts) * 100).toFixed(2) : 0,
    };
  }

  private transformProblemToChallenge(problem: CodeforcesProblem): Challenge {
    return {
      id: `${problem.contestId}-${problem.index}`,
      title: problem.name,
      difficulty: this.mapRatingToDifficulty(problem.rating),
      tags: problem.tags || [],
      source: 'Codeforces',
      rating: problem.rating,
    };
  }

  private mapRatingToDifficulty(rating?: number): string {
    if (!rating) return 'UNRATED';
    if (rating < 1200) return 'EASY';
    if (rating < 1600) return 'MEDIUM';
    if (rating < 2000) return 'HARD';
    return 'EXPERT';
  }
}
