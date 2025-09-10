import { Request, Response } from 'express';
import { SubProjectFunnelService } from '../services/subProjectFunnelService.js';

export class SubProjectFunnelController {
  static async getAll(req: Request, res: Response) {
    try {
      const funnels = await SubProjectFunnelService.getAll();

      res.json({
        success: true,
        data: funnels
      });
    } catch (error) {
      console.error('Get all sub-project funnels error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const funnel = await SubProjectFunnelService.getById(id);

      if (!funnel) {
        return res.status(404).json({
          success: false,
          error: 'Sub-project funnel not found'
        });
      }

      res.json({
        success: true,
        data: funnel
      });
    } catch (error) {
      console.error('Get sub-project funnel by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const funnelData = req.body;
      const funnel = await SubProjectFunnelService.create(funnelData);

      res.status(201).json({
        success: true,
        data: funnel
      });
    } catch (error) {
      console.error('Create sub-project funnel error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const funnelData = req.body;
      const funnel = await SubProjectFunnelService.update(id, funnelData);

      if (!funnel) {
        return res.status(404).json({
          success: false,
          error: 'Sub-project funnel not found'
        });
      }

      res.json({
        success: true,
        data: funnel
      });
    } catch (error) {
      console.error('Update sub-project funnel error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const success = await SubProjectFunnelService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Sub-project funnel not found'
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete sub-project funnel error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Stages
  static async getAllStages(req: Request, res: Response) {
    try {
      const stages = await SubProjectFunnelService.getAllStages();
      res.json({
        success: true,
        data: stages
      });
    } catch (error) {
      console.error('Get all sub-project funnel stages error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getStageById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const stage = await SubProjectFunnelService.getStageById(id);

      if (!stage) {
        return res.status(404).json({
          success: false,
          error: 'Sub-project funnel stage not found'
        });
      }

      res.json({
        success: true,
        data: stage
      });
    } catch (error) {
      console.error('Get sub-project funnel stage by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createStage(req: Request, res: Response) {
    try {
      const stageData = req.body;
      const stage = await SubProjectFunnelService.createStage(stageData);

      res.status(201).json({
        success: true,
        data: stage
      });
    } catch (error) {
      console.error('Create sub-project funnel stage error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateStage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const stageData = req.body;
      const stage = await SubProjectFunnelService.updateStage(id, stageData);

      if (!stage) {
        return res.status(404).json({
          success: false,
          error: 'Sub-project funnel stage not found'
        });
      }

      res.json({
        success: true,
        data: stage
      });
    } catch (error) {
      console.error('Update sub-project funnel stage error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteStage(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const success = await SubProjectFunnelService.deleteStage(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Sub-project funnel stage not found'
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete sub-project funnel stage error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
