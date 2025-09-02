import { Router } from 'express';
import { CounterpartyController } from '../controllers/counterpartyController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// CRUD operations
router.get('/', CounterpartyController.getAll);
router.get('/:id', CounterpartyController.getById);
router.post('/', CounterpartyController.create);
router.put('/:id', CounterpartyController.update);
router.delete('/:id', CounterpartyController.delete);
export default router;
//# sourceMappingURL=counterparties.js.map