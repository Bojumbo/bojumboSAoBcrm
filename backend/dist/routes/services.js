import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// CRUD operations
router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);
router.post('/', ServiceController.create);
router.put('/:id', ServiceController.update);
router.delete('/:id', ServiceController.delete);
export default router;
//# sourceMappingURL=services.js.map