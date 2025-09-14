import { Router } from 'express';
import { ProjectController } from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.get('/:id/products', ProjectController.getProducts);
router.post('/', ProjectController.create);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);

// Project products/services management
router.post('/:id/products', ProjectController.addProduct);
router.delete('/:id/products/:project_product_id', ProjectController.removeProduct);
router.post('/:id/services', ProjectController.addService);
router.delete('/:id/services/:project_service_id', ProjectController.removeService);
router.delete('/:id/services/by-service/:service_id', ProjectController.removeServiceByServiceId);

// Project managers management
router.post('/:id/managers', ProjectController.addSecondaryManager);
router.delete('/:id/managers/:manager_id', ProjectController.removeSecondaryManager);

export default router;
