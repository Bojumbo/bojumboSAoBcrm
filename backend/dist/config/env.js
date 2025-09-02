import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    database: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/crm_db',
    },
    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    },
};
//# sourceMappingURL=env.js.map