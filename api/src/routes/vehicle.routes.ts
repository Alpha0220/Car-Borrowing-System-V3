import { Router, type IRouter } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { requireRole, verifyJWT } from '../middlewares/auth';

const router: IRouter = Router();
const vehicleController = new VehicleController();

router.get('/', verifyJWT, vehicleController.getAll.bind(vehicleController));
router.get('/:id/summary', verifyJWT, vehicleController.getSummary.bind(vehicleController));
router.get('/:id', verifyJWT, vehicleController.getById.bind(vehicleController));
router.post('/', verifyJWT, requireRole('SUPER_ADMIN', 'MANAGER'), vehicleController.create.bind(vehicleController));
router.patch('/:id', verifyJWT, requireRole('SUPER_ADMIN', 'MANAGER'), vehicleController.update.bind(vehicleController));

export default router;

