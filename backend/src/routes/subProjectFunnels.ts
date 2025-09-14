import { Router } from 'express';
import { SubProjectFunnelController } from '../controllers/subProjectFunnelController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Funnel CRUD operations
router.get('/', SubProjectFunnelController.getAll);
router.get('/:id', SubProjectFunnelController.getById);
router.post('/', SubProjectFunnelController.create);
router.put('/:id', SubProjectFunnelController.update);
router.delete('/:id', SubProjectFunnelController.delete);

// Reorder stages
router.put('/:id/reorder-stages', SubProjectFunnelController.reorderStages);

// Funnel Stages CRUD operations
router.get('/stages/all', SubProjectFunnelController.getAllStages);
router.get('/stages/:id', SubProjectFunnelController.getStageById);
router.post('/stages', SubProjectFunnelController.createStage);
router.put('/stages/:id', SubProjectFunnelController.updateStage);
router.delete('/stages/:id', SubProjectFunnelController.deleteStage);

export default router;
