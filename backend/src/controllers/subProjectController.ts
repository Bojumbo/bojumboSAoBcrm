import { Request, Response } from 'express';
import { SubProjectService } from '../services/subProjectService.js';

export class SubProjectController {
  static async getAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const subprojects = await SubProjectService.getAll(req.user.role, req.user.manager_id);

      res.json({
        success: true,
        data: subprojects
      });
    } catch (error) {
      console.error('Get all subprojects error:', error);
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

      const subproject = await SubProjectService.getById(id, req.user.role, req.user.manager_id);

      if (!subproject) {
        return res.status(404).json({
          success: false,
          error: 'Subproject not found'
        });
      }

      res.json({
        success: true,
        data: subproject
      });
    } catch (error) {
      console.error('Get subproject by ID error:', error);
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

      const subprojectData = req.body;
      const subproject = await SubProjectService.create(subprojectData);

      res.status(201).json({
        success: true,
        data: subproject
      });
    } catch (error) {
      console.error('Create subproject error:', error);
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

      const subprojectData = req.body;
      const subproject = await SubProjectService.update(id, subprojectData);

      if (!subproject) {
        return res.status(404).json({
          success: false,
          error: 'Subproject not found'
        });
      }

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

      const success = await SubProjectService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Subproject not found'
        });
      }

      res.json({
        success: true,
        message: 'Subproject deleted successfully'
      });
    } catch (error) {
      console.error('Delete subproject error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
