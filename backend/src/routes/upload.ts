import { Router } from 'express';
import { UploadController } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import { config } from '../config/env.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize
  }
  // Видалено fileFilter - дозволяємо всі типи файлів
});

// All routes require authentication
router.use(authenticateToken);

// File upload and management
router.post('/', upload.single('file'), UploadController.uploadFile);
router.delete('/', UploadController.deleteFile);

export default router;
