import { Request } from 'express';
import { config } from '../config/env.js';
import path from 'path';
import fs from 'fs/promises';

export class UploadService {
  static async uploadFile(file: Express.Multer.File): Promise<{ fileName: string; fileUrl: string; fileType: string }> {
    try {
      console.log('Upload service - file info:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // Ensure upload directory exists
      await fs.mkdir(config.upload.dir, { recursive: true });
      console.log('Upload directory ensured:', config.upload.dir);

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.originalname;
      const extension = path.extname(originalName);
      const fileName = `${timestamp}_${path.basename(originalName, extension)}${extension}`;
      
      console.log('Generated file name parts:', {
        timestamp,
        originalName,
        extension,
        fileName
      });
      
      // Save file
      const filePath = path.join(config.upload.dir, fileName);
      await fs.writeFile(filePath, file.buffer);
      console.log('File saved to:', filePath);

      const result = {
        fileName: originalName,
        fileUrl: `/uploads/${fileName}`,
        fileType: file.mimetype
      };
      console.log('Upload result:', result);

      // Return file info
      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(config.upload.dir, fileName);
      
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  static getFileInfo(fileUrl: string): { fileName: string; filePath: string } {
    const fileName = path.basename(fileUrl);
    const filePath = path.join(config.upload.dir, fileName);
    
    return {
      fileName,
      filePath
    };
  }
}
