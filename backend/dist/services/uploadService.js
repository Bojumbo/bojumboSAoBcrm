import { config } from '../config/env.js';
import path from 'path';
import fs from 'fs/promises';
export class UploadService {
    static async uploadFile(file) {
        try {
            // Ensure upload directory exists
            await fs.mkdir(config.upload.dir, { recursive: true });
            // Generate unique filename
            const timestamp = Date.now();
            const originalName = file.originalname;
            const extension = path.extname(originalName);
            const fileName = `${timestamp}_${path.basename(originalName, extension)}${extension}`;
            // Save file
            const filePath = path.join(config.upload.dir, fileName);
            await fs.writeFile(filePath, file.buffer);
            // Return file info
            return {
                fileName: originalName,
                fileUrl: `/uploads/${fileName}`,
                fileType: file.mimetype
            };
        }
        catch (error) {
            console.error('File upload error:', error);
            throw new Error('Failed to upload file');
        }
    }
    static async deleteFile(fileUrl) {
        try {
            const fileName = path.basename(fileUrl);
            const filePath = path.join(config.upload.dir, fileName);
            await fs.unlink(filePath);
            return true;
        }
        catch (error) {
            console.error('File deletion error:', error);
            return false;
        }
    }
    static getFileInfo(fileUrl) {
        const fileName = path.basename(fileUrl);
        const filePath = path.join(config.upload.dir, fileName);
        return {
            fileName,
            filePath
        };
    }
}
//# sourceMappingURL=uploadService.js.map