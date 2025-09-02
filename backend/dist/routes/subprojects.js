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
export default router;
//# sourceMappingURL=subprojects.js.map