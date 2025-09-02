import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// CRUD operations
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);
// Special endpoints
router.post('/:id/stock', ProductController.setProductStocks);
router.get('/:id/stock', ProductController.getProductStocks);
export default router;
//# sourceMappingURL=products.js.map