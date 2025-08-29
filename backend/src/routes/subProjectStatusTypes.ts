import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { SubProjectStatusTypeController } from '../controllers/subProjectStatusTypeController.js';

const router = Router();

router.use(authenticateToken);

router.get('/', SubProjectStatusTypeController.getAll);
router.get('/:id', SubProjectStatusTypeController.getById);
router.post('/', SubProjectStatusTypeController.create);
router.put('/:id', SubProjectStatusTypeController.update);
router.delete('/:id', SubProjectStatusTypeController.delete);

export default router;


