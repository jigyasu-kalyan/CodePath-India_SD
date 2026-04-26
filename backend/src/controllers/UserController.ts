import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class UserController {
  async getMyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const totalSubmissions = await prisma.submission.count({
        where: { userId },
      });

      const badgesEarned = await prisma.badge.count({
        where: { userId },
      });

      // Calculate Leaderboard Rank
      const allLeaderboard = await prisma.leaderboard.findMany({
        orderBy: [
          { totalScore: 'desc' },
          { problemsSolved: 'desc' },
          { updatedAt: 'asc' }
        ],
        select: { userId: true }
      });

      const rankIndex = allLeaderboard.findIndex(l => l.userId === userId);
      const leaderboardRank = rankIndex !== -1 ? rankIndex + 1 : 0; // 0 means not ranked

      res.status(200).json({
        totalSubmissions,
        badgesEarned,
        leaderboardRank,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyBadges(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const badges = await prisma.badge.findMany({
        where: { userId },
        orderBy: { awardedAt: 'desc' }
      });

      res.status(200).json({ success: true, data: badges });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
