import { IObserver, SubmissionEvent } from './IObserver';
import { LeaderboardService } from '../../services/LeaderboardService';

export class LeaderboardObserver implements IObserver {
  private leaderboardService: LeaderboardService;

  constructor() {
    this.leaderboardService = new LeaderboardService();
  }

  async update(event: SubmissionEvent): Promise<void> {
    if (event.status === 'ACCEPTED') {
      await this.leaderboardService.updateScore(event.userId, 100);
    }
  }
}
