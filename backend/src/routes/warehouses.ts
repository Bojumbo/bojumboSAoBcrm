import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.get('/', WarehouseController.getAll);
router.get('/:id', WarehouseController.getById);
router.post('/', WarehouseController.create);
router.put('/:id', WarehouseController.update);
router.delete('/:id', WarehouseController.delete);

export default router;
