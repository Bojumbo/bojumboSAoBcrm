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
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// All routes require authentication
router.use(authenticateToken);
// File upload and management
router.post('/', upload.single('file'), UploadController.uploadFile);
router.delete('/', UploadController.deleteFile);
export default router;
//# sourceMappingURL=upload.js.map