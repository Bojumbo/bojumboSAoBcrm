import { Router } from 'express';
import { SubProjectController } from '../controllers/subProjectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.get('/', SubProjectController.getAll);
router.get('/:id', SubProjectController.getById);
router.post('/', SubProjectController.create);
router.put('/:id', SubProjectController.update);
router.delete('/:id', SubProjectController.delete);

// Products and Services management
router.post('/:id/products', SubProjectController.addProduct);
router.delete('/:id/products/:productId', SubProjectController.removeProduct);
router.post('/:id/services', SubProjectController.addService);
router.delete('/:id/services/:serviceId', SubProjectController.removeService);

export default router;
