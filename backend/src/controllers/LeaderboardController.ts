import { Request, Response } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';

export class LeaderboardController {
  private leaderboardService = new LeaderboardService();

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const leaderboard = await this.leaderboardService.getLeaderboard(limit);
      
      // Map to the frontend LeaderboardEntry format
      const formatted = leaderboard.map(entry => ({
        rank: entry.rank,
        userId: entry.userId,
        name: entry.user.name,
        score: entry.totalScore,
        badges: [] // Optionally fetch badges, but we can leave empty for now
      }));

      res.status(200).json(formatted);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
