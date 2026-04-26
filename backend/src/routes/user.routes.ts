import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new UserController();

router.get('/me/stats', authMiddleware, (req, res) => controller.getMyStats(req, res));
router.get('/me/badges', authMiddleware, (req, res) => controller.getMyBadges(req, res));

export default router;
