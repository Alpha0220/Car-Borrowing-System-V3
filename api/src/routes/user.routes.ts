import { Router, type IRouter } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireRole, verifyJWT } from '../middlewares/auth';
// import { verifyJWT, requireRole } from '../middlewares/auth';

const router: IRouter = Router();
const userController = new UserController();

// router.post('/', userController.create.bind(userController));
// router.get('/', userController.getAll.bind(userController));
// router.get('/me', userController.getMe.bind(userController));
router.post('/', verifyJWT, requireRole('SUPER_ADMIN'), userController.create.bind(userController));
router.get('/', verifyJWT, requireRole('SUPER_ADMIN', 'MANAGER'), userController.getAll.bind(userController));
router.get('/me', verifyJWT, userController.getMe.bind(userController));

export default router;

