import { Router } from 'express';
import { ChallengeController } from '../controllers/ChallengeController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ChallengeController();

router.get('/', (req, res) => controller.getChallenges(req, res));
router.get('/:id', (req, res) => controller.getChallengeById(req, res));
router.post('/', authMiddleware, (req, res) => controller.createChallenge(req, res));

export default router;
