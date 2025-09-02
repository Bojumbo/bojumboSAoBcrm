import { Router } from 'express';
import { CommentController } from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
// All routes require authentication
router.use(authenticateToken);
// Project Comments
router.get('/projects/:projectId', CommentController.getProjectComments);
router.get('/projects/:projectId/:commentId', CommentController.getProjectCommentById);
router.post('/projects/:projectId', CommentController.createProjectComment);
router.put('/projects/:projectId/:commentId', CommentController.updateProjectComment);
router.delete('/projects/:projectId/:commentId', CommentController.deleteProjectComment);
// SubProject Comments
router.get('/subprojects/:subprojectId', CommentController.getSubProjectComments);
router.get('/subprojects/:subprojectId/:commentId', CommentController.getSubProjectCommentById);
router.post('/subprojects/:subprojectId', CommentController.createSubProjectComment);
router.put('/subprojects/:subprojectId/:commentId', CommentController.updateSubProjectComment);
router.delete('/subprojects/:subprojectId/:commentId', CommentController.deleteSubProjectComment);
export default router;
//# sourceMappingURL=comments.js.map