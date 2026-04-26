import { IObserver, SubmissionEvent } from './IObserver';
import { BadgeService } from '../../services/BadgeService';

export class BadgeObserver implements IObserver {
  private badgeService: BadgeService;

  constructor() {
    this.badgeService = new BadgeService();
  }

  async update(event: SubmissionEvent): Promise<void> {
    if (event.status === 'ACCEPTED') {
      await this.badgeService.checkAndAwardBadges(event.userId);
    }
  }
}
