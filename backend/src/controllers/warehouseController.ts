import { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouseService.js';

export class WarehouseController {
  static async getAll(req: Request, res: Response) {
    try {
      const warehouses = await WarehouseService.getAll();

      res.json({
        success: true,
        data: warehouses
      });
    } catch (error) {
      console.error('Get all warehouses error:', error);
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

      const warehouse = await WarehouseService.getById(id);

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          error: 'Warehouse not found'
        });
      }

      res.json({
        success: true,
        data: warehouse
      });
    } catch (error) {
      console.error('Get warehouse by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const warehouseData = req.body;
      const warehouse = await WarehouseService.create(warehouseData);

      res.status(201).json({
        success: true,
        data: warehouse
      });
    } catch (error) {
      console.error('Create warehouse error:', error);
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

      const warehouseData = req.body;
      const warehouse = await WarehouseService.update(id, warehouseData);

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          error: 'Warehouse not found'
        });
      }

      res.json({
        success: true,
        data: warehouse
      });
    } catch (error) {
      console.error('Update warehouse error:', error);
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

      const success = await WarehouseService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Warehouse not found'
        });
      }

      res.json({
        success: true,
        message: 'Warehouse deleted successfully'
      });
    } catch (error) {
      console.error('Delete warehouse error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
