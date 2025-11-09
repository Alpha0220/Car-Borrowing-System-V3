import { Router, type IRouter } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router: IRouter = Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

export default router;

