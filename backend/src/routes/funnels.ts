import { Router } from 'express';
import { FunnelController } from '../controllers/funnelController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Funnel CRUD operations
router.get('/', FunnelController.getAll);
router.get('/:id', FunnelController.getById);
router.post('/', FunnelController.create);
router.put('/:id', FunnelController.update);
router.delete('/:id', FunnelController.delete);

// Funnel Stages CRUD operations
router.get('/stages/all', FunnelController.getAllStages);
router.get('/stages/:id', FunnelController.getStageById);
router.post('/stages', FunnelController.createStage);
router.put('/stages/:id', FunnelController.updateStage);
router.delete('/stages/:id', FunnelController.deleteStage);

export default router;
