import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// Public routes
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
// Protected routes
router.get('/me', authenticateToken, AuthController.getCurrentUser);
export default router;
//# sourceMappingURL=auth.js.map