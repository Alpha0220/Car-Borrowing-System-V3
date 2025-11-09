import { Router, type IRouter } from 'express';
import { BorrowController } from '../controllers/borrow.controller';
import { verifyJWT, requireRole } from '../middlewares/auth';

const router: IRouter = Router();
const borrowController = new BorrowController();

router.post('/', verifyJWT, borrowController.create.bind(borrowController));
router.get('/my', verifyJWT, borrowController.getMyBorrows.bind(borrowController));
router.get('/pending', verifyJWT, requireRole('MANAGER', 'SUPER_ADMIN'), borrowController.getPending.bind(borrowController));
router.patch('/:id/approve', verifyJWT, requireRole('MANAGER', 'SUPER_ADMIN'), borrowController.approve.bind(borrowController));
router.patch('/:id/return', verifyJWT, borrowController.return.bind(borrowController));
router.get('/reports', verifyJWT, requireRole('MANAGER', 'SUPER_ADMIN'), borrowController.getReports.bind(borrowController));

export default router;

