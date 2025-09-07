import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { config } from './config/env.js';

// Import routes
import authRoutes from './routes/auth.js';
import managerRoutes from './routes/managers.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import counterpartyRoutes from './routes/counterparties.js';
import taskRoutes from './routes/tasks.js';
import subprojectRoutes from './routes/subprojects.js';
import serviceRoutes from './routes/services.js';
import unitRoutes from './routes/units.js';
import warehouseRoutes from './routes/warehouses.js';
import funnelRoutes from './routes/funnels.js';
import commentRoutes from './routes/comments.js';
import projectRoutes from './routes/projects.js';
import uploadRoutes from './routes/upload.js';
import saleStatusTypeRoutes from './routes/saleStatusTypes.js';
import subProjectStatusTypeRoutes from './routes/subProjectStatusTypes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!config.jwt.secret) {
  console.error('FATAL ERROR: JWT secret is not defined.');
  process.exit(1);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), config.upload.dir)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/counterparties', counterpartyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/subprojects', subprojectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/funnels', funnelRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sale-status-types', saleStatusTypeRoutes);
app.use('/api/subproject-status-types', subProjectStatusTypeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Upload directory: ${config.upload.dir}`);
});
