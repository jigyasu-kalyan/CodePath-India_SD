import { Router } from 'express';
import { ClassroomController } from '../controllers/ClassroomController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const classroomController = new ClassroomController();

router.use(authMiddleware);

router.post('/', classroomController.createClassroom);
router.post('/join', classroomController.joinClassroom);
router.get('/', classroomController.getMyClassrooms);

export default router;
