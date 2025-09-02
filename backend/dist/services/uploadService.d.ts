export declare class UploadService {
    static uploadFile(file: Express.Multer.File): Promise<{
        fileName: string;
        fileUrl: string;
        fileType: string;
    }>;
    static deleteFile(fileUrl: string): Promise<boolean>;
    static getFileInfo(fileUrl: string): {
        fileName: string;
        filePath: string;
    };
}
//# sourceMappingURL=uploadService.d.ts.map