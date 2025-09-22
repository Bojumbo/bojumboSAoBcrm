import { Request, Response } from 'express';
import { SubProjectService } from '../services/subProjectService.js';

export class SubProjectController {
  // ... методи getAll, getById, create залишаються без змін ...

  static async getAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const projectId = req.query.project_id ? parseInt(req.query.project_id as string) : undefined;
      const subprojects = await SubProjectService.getAll(req.user.role, req.user.manager_id, projectId);
      res.json({ success: true, data: subprojects });
    } catch (error) {
      console.error('Get all subprojects error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid ID' });
      }
      const subproject = await SubProjectService.getById(id, req.user.role, req.user.manager_id);
      if (!subproject) {
        return res.status(404).json({ success: false, error: 'Subproject not found' });
      }
      res.json({ success: true, data: subproject });
    } catch (error) {
      console.error('Get subproject by ID error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const subprojectData = req.body;
      if (!subprojectData.project_id && !subprojectData.parent_subproject_id) {
        return res.status(400).json({ success: false, error: 'Subproject must be attached to either project or another subproject' });
      }
      if (subprojectData.project_id && subprojectData.parent_subproject_id) {
        return res.status(400).json({ success: false, error: 'Subproject cannot be attached to both project and subproject' });
      }
      const subproject = await SubProjectService.create(subprojectData);
      res.status(201).json({ success: true, data: subproject });
    } catch (error) {
      console.error('Create subproject error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // --- ФУНКЦІЯ UPDATE ВИПРАВЛЕНА ---
  static async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const subprojectData = req.body;

      // ------> ВИДАЛЕНИЙ БЛОК ВАЛІДАЦІЇ <------
      // Ця валідація не потрібна для оновлення, оскільки існуючий
      // підпроект вже має прив'язку до проекту або іншого підпроекту.
      // Вона заважала оновлювати окремі поля, такі як funnel_stage_id.
      
      const updated = await SubProjectService.update(id, subprojectData);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Subproject not found'
        });
      }
      
      // Повертаємо повний об'єкт підпроекту з усіма зв'язками
      const subproject = await SubProjectService.getById(id, req.user.role, req.user.manager_id);
      res.json({
        success: true,
        data: subproject
      });
    } catch (error) {
      console.error('Update subproject error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
  
  // ... решта методів (delete, addProduct і т.д.) залишаються без змін ...
  static async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid ID' });
      }
      const success = await SubProjectService.delete(id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Subproject not found' });
      }
      res.json({ success: true, message: 'Subproject deleted successfully' });
    } catch (error) {
      console.error('Delete subproject error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async addProduct(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const subprojectId = parseInt(req.params.id);
      const { product_id, quantity = 1 } = req.body;
      if (isNaN(subprojectId)) {
        return res.status(400).json({ success: false, error: 'Invalid subproject ID' });
      }
      if (!product_id) {
        return res.status(400).json({ success: false, error: 'Product ID is required' });
      }
      const result = await SubProjectService.addProduct(subprojectId, product_id, quantity);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Add product to subproject error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async removeProduct(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const subprojectId = parseInt(req.params.id);
      const productId = parseInt(req.params.productId);
      if (isNaN(subprojectId) || isNaN(productId)) {
        return res.status(400).json({ success: false, error: 'Invalid IDs' });
      }
      const success = await SubProjectService.removeProduct(subprojectId, productId);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Product not found in subproject' });
      }
      res.json({ success: true, message: 'Product removed from subproject' });
    } catch (error) {
      console.error('Remove product from subproject error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async addService(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const subprojectId = parseInt(req.params.id);
      const { service_id, quantity = 1.0 } = req.body;
      if (isNaN(subprojectId)) {
        return res.status(400).json({ success: false, error: 'Invalid subproject ID' });
      }
      if (!service_id) {
        return res.status(400).json({ success: false, error: 'Service ID is required' });
      }
      const result = await SubProjectService.addService(subprojectId, service_id, quantity);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Add service to subproject error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async removeService(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }
      const subprojectId = parseInt(req.params.id);
      const serviceId = parseInt(req.params.serviceId);
      if (isNaN(subprojectId) || isNaN(serviceId)) {
        return res.status(400).json({ success: false, error: 'Invalid IDs' });
      }
      const success = await SubProjectService.removeService(subprojectId, serviceId);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Service not found in subproject' });
      }
      res.json({ success: true, message: 'Service removed from subproject' });
    } catch (error) {
      console.error('Remove service from subproject error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}