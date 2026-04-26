import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';

const router = Router();
const controller = new LeaderboardController();

router.get('/', (req, res) => controller.getLeaderboard(req, res));

export default router;
