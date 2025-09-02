import { UploadService } from '../services/uploadService.js';
export class UploadController {
    static async uploadFile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file provided'
                });
            }
            const fileInfo = await UploadService.uploadFile(req.file);
            res.json({
                success: true,
                data: fileInfo
            });
        }
        catch (error) {
            console.error('File upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to upload file'
            });
        }
    }
    static async deleteFile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const { fileUrl } = req.body;
            if (!fileUrl) {
                return res.status(400).json({
                    success: false,
                    error: 'File URL is required'
                });
            }
            const success = await UploadService.deleteFile(fileUrl);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        }
        catch (error) {
            console.error('File deletion error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete file'
            });
        }
    }
}
//# sourceMappingURL=uploadController.js.map