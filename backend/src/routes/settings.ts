import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Profile settings
router.get('/profile', SettingsController.getCurrentProfile);
router.put('/profile', SettingsController.updateProfile);

// Password settings
router.post('/change-password', SettingsController.changePassword);

export default router;