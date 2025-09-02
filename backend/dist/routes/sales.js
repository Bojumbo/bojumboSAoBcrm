import { Router } from 'express';
import { SaleController } from '../controllers/saleController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// CRUD operations
router.get('/', SaleController.getAll);
router.get('/:id', SaleController.getById);
router.post('/', SaleController.create);
router.put('/:id', SaleController.update);
router.delete('/:id', SaleController.delete);
export default router;
//# sourceMappingURL=sales.js.map