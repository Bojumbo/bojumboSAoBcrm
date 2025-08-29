import { Request, Response } from 'express';
import { UnitService } from '../services/unitService.js';

export class UnitController {
  static async getAll(req: Request, res: Response) {
    try {
      const units = await UnitService.getAll();

      res.json({
        success: true,
        data: units
      });
    } catch (error) {
      console.error('Get all units error:', error);
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

      const unit = await UnitService.getById(id);

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      res.json({
        success: true,
        data: unit
      });
    } catch (error) {
      console.error('Get unit by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const unitData = req.body;
      const unit = await UnitService.create(unitData);

      res.status(201).json({
        success: true,
        data: unit
      });
    } catch (error) {
      console.error('Create unit error:', error);
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

      const unitData = req.body;
      const unit = await UnitService.update(id, unitData);

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      res.json({
        success: true,
        data: unit
      });
    } catch (error) {
      console.error('Update unit error:', error);
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

      const success = await UnitService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      res.json({
        success: true,
        message: 'Unit deleted successfully'
      });
    } catch (error) {
      console.error('Delete unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
