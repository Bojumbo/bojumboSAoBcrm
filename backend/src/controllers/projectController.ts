import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService.js';

export class ProjectController {
  static async getAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const projects = await ProjectService.getAll(req.user.role, req.user.manager_id);

      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Get all projects error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getById(req: Request, res: Response) {
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

      const project = await ProjectService.getById(id, req.user.role, req.user.manager_id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Get project by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const projectData = req.body;
      const project = await ProjectService.create(projectData);

      res.status(201).json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

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

      const projectData = req.body;
      const project = await ProjectService.update(id, projectData);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async delete(req: Request, res: Response) {
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

      const success = await ProjectService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Add a product to a project
  static async addProduct(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      const projectId = parseInt(req.params.id);
      const { product_id, quantity } = req.body || {};
      if (isNaN(projectId) || !product_id || !quantity) return res.status(400).json({ success: false, error: 'Invalid payload' });
      const item = await ProjectService.addProduct(projectId, { product_id: Number(product_id), quantity: Number(quantity) });
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      console.error('Add project product error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async removeProduct(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      const project_product_id = parseInt(req.params.project_product_id);
      if (isNaN(project_product_id)) return res.status(400).json({ success: false, error: 'Invalid ID' });
      const ok = await ProjectService.removeProduct(project_product_id);
      if (!ok) return res.status(404).json({ success: false, error: 'Not found' });
      res.json({ success: true, message: 'Removed' });
    } catch (error) {
      console.error('Remove project product error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // Add a service to a project
  static async addService(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      const projectId = parseInt(req.params.id);
  const { service_id, quantity } = req.body || {};
  if (isNaN(projectId) || !service_id) return res.status(400).json({ success: false, error: 'Invalid payload' });
  const result = await ProjectService.addService(projectId, { service_id: Number(service_id), quantity: Number(quantity) });
  res.status(201).json({ success: true, data: result });
    } catch (error) {
      console.error('Add project service error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async removeService(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      const project_service_id = parseInt(req.params.project_service_id);
      if (isNaN(project_service_id)) return res.status(400).json({ success: false, error: 'Invalid ID' });
      const ok = await ProjectService.removeService(project_service_id);
      if (!ok) return res.status(404).json({ success: false, error: 'Not found' });
      res.json({ success: true, message: 'Removed' });
    } catch (error) {
      console.error('Remove project service error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async removeServiceByServiceId(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
      const project_id = parseInt(req.params.id);
      const service_id = parseInt(req.params.service_id);
      if (isNaN(project_id) || isNaN(service_id)) return res.status(400).json({ success: false, error: 'Invalid ID' });
      const ok = await ProjectService.removeServiceByServiceId(project_id, service_id);
      if (!ok) return res.status(404).json({ success: false, error: 'Not found' });
      res.json({ success: true, message: 'Removed' });
    } catch (error) {
      console.error('Remove project service by service_id error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async getProducts(req: Request, res: Response) {
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

      const products = await ProjectService.getProducts(id);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get project products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async addSecondaryManager(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID'
        });
      }

      const { manager_id } = req.body;
      if (!manager_id || isNaN(parseInt(manager_id))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid manager ID'
        });
      }

      const result = await ProjectService.addSecondaryManager(projectId, parseInt(manager_id));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Add secondary manager error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Manager is already assigned to this project'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async removeSecondaryManager(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const projectId = parseInt(req.params.id);
      const managerId = parseInt(req.params.manager_id);
      
      if (isNaN(projectId) || isNaN(managerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID or manager ID'
        });
      }

      const result = await ProjectService.removeSecondaryManager(projectId, managerId);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Manager assignment not found'
        });
      }

      res.json({
        success: true,
        message: 'Manager removed successfully'
      });
    } catch (error) {
      console.error('Remove secondary manager error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
