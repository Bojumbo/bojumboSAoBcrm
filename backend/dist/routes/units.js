import { Router } from 'express';
import { UnitController } from '../controllers/unitController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// CRUD operations
router.get('/', UnitController.getAll);
router.get('/:id', UnitController.getById);
router.post('/', UnitController.create);
router.put('/:id', UnitController.update);
router.delete('/:id', UnitController.delete);
export default router;
//# sourceMappingURL=units.js.map