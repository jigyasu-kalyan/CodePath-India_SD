import { prisma } from '../config/database';

export class LeaderboardService {
  async updateScore(userId: string, points: number): Promise<void> {
    await prisma.leaderboard.upsert({
      where: { userId },
      update: {
        totalScore: {
          increment: points,
        },
        problemsSolved: {
          increment: 1,
        },
      },
      create: {
        userId,
        totalScore: points,
        problemsSolved: 1,
      },
    });
  }

  async getLeaderboard(limit: number = 100) {
    const leaderboard = await prisma.leaderboard.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { totalScore: 'desc' },
      take: limit,
    });

    return leaderboard.map((entry: any, index: number) => ({
      rank: index + 1,
      ...entry,
    }));
  }

  async getUserRanking(userId: string) {
    const userScore = await prisma.leaderboard.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!userScore) return null;

    const betterScores = await prisma.leaderboard.count({
      where: { totalScore: { gt: userScore.totalScore } },
    });

    return {
      rank: betterScores + 1,
      ...userScore,
    };
  }
}
