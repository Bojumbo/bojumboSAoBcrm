import { Router } from 'express';
import { ManagerController } from '../controllers/managerController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.get('/', ManagerController.getAll);
router.get('/:id', ManagerController.getById);

// Admin only operations
router.post('/', requireAdmin, ManagerController.create);
router.put('/:id', requireAdmin, ManagerController.update);
router.delete('/:id', requireAdmin, ManagerController.delete);

export default router;
