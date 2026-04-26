import { prisma } from '../config/database';

interface BadgeDefinition {
  name: string;
  threshold: number;
  icon: string;
}

export class BadgeService {
  private badges: BadgeDefinition[] = [
    { name: 'First Blood', threshold: 1, icon: '🩸' },
    { name: 'Problem Solver', threshold: 10, icon: '🔧' },
    { name: 'Algorithm Master', threshold: 25, icon: '👑' },
    { name: 'Code Champion', threshold: 50, icon: '🏆' },
    { name: 'Competitive Coder', threshold: 100, icon: '⭐' },
  ];

  async checkAndAwardBadges(userId: string): Promise<void> {
    const leaderboardEntry = await prisma.leaderboard.findUnique({
      where: { userId },
    });

    if (!leaderboardEntry) return;

    for (const badge of this.badges) {
      if (leaderboardEntry.problemsSolved >= badge.threshold) {
        const exists = await prisma.badge.findFirst({
          where: { userId, name: badge.name },
        });

        if (!exists) {
          await prisma.badge.create({
            data: {
              userId,
              name: badge.name,
              icon: badge.icon,
            },
          });
        }
      }
    }
  }

  async getUserBadges(userId: string) {
    return await prisma.badge.findMany({
      where: { userId },
      orderBy: { awardedAt: 'asc' },
    });
  }

  async getBadgeCount(userId: string): Promise<number> {
    return await prisma.badge.count({
      where: { userId },
    });
  }

  getBadgeDefinitions(): BadgeDefinition[] {
    return this.badges;
  }
}
