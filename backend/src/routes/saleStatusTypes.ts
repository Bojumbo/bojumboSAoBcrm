import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { SaleStatusTypeController } from '../controllers/saleStatusTypeController.js';

const router = Router();

router.use(authenticateToken);

router.get('/', SaleStatusTypeController.getAll);
router.get('/:id', SaleStatusTypeController.getById);
router.post('/', SaleStatusTypeController.create);
router.put('/:id', SaleStatusTypeController.update);
router.delete('/:id', SaleStatusTypeController.delete);

export default router;


