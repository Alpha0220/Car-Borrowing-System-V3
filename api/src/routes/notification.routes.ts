import { Router, type IRouter } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { verifyJWT } from '../middlewares/auth';

const router: IRouter = Router();
const notificationController = new NotificationController();

router.get('/', verifyJWT, notificationController.getMyNotifications.bind(notificationController));
router.patch('/:id/read', verifyJWT, notificationController.markAsRead.bind(notificationController));
router.patch('/read-all', verifyJWT, notificationController.markAllAsRead.bind(notificationController));

export default router;

