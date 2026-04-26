import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new SubmissionController();

router.post('/verify', authMiddleware, (req, res) => controller.verifyCodeforces(req, res));
router.post('/', authMiddleware, (req, res) => controller.submitCode(req, res));
router.get('/me', authMiddleware, (req, res) => controller.getMySubmissions(req, res));

export default router;
