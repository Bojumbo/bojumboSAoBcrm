import { Router } from 'express';
import { CommentController } from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import { config } from '../config/env.js';

const router = Router();

// Configure multer for comment files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize
  }
  // Видалено fileFilter - дозволяємо всі типи файлів
});

// All routes require authentication
router.use(authenticateToken);

// General comment operations
router.delete('/:commentId', CommentController.deleteComment);

// Project Comments
router.get('/projects/:projectId', CommentController.getProjectComments);
router.get('/projects/:projectId/:commentId', CommentController.getProjectCommentById);
router.post('/projects/:projectId', upload.array('files', 5), CommentController.createProjectComment);
router.put('/projects/:projectId/:commentId', CommentController.updateProjectComment);
router.delete('/projects/:projectId/:commentId', CommentController.deleteProjectComment);

// SubProject Comments
router.get('/subprojects/:subprojectId', CommentController.getSubProjectComments);
router.get('/subprojects/:subprojectId/:commentId', CommentController.getSubProjectCommentById);
router.post('/subprojects/:subprojectId', upload.array('files', 5), CommentController.createSubProjectComment);
router.put('/subprojects/:subprojectId/:commentId', CommentController.updateSubProjectComment);
router.delete('/subprojects/:subprojectId/:commentId', CommentController.deleteSubProjectComment);

export default router;
