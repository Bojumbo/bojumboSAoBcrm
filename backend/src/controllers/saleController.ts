import { Request, Response } from 'express';
import { SaleService } from '../services/saleService.js';

export class SaleController {
  static async getAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const sales = await SaleService.getAll(req.user.role, req.user.manager_id);

      res.json({
        success: true,
        data: sales
      });
    } catch (error) {
      console.error('Get all sales error:', error);
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

      const sale = await SaleService.getById(id, req.user.role, req.user.manager_id);

      if (!sale) {
        return res.status(404).json({
          success: false,
          error: 'Sale not found'
        });
      }

      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      console.error('Get sale by ID error:', error);
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

      const saleData = req.body;
      const sale = await SaleService.create(saleData);

      res.status(201).json({
        success: true,
        data: sale
      });
    } catch (error) {
      console.error('Create sale error:', error);
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

      const saleData = req.body;
      const sale = await SaleService.update(id, saleData);

      if (!sale) {
        return res.status(404).json({
          success: false,
          error: 'Sale not found'
        });
      }

      res.json({
        success: true,
        data: sale
      });
    } catch (error) {
      console.error('Update sale error:', error);
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

      const success = await SaleService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Sale not found'
        });
      }

      res.json({
        success: true,
        message: 'Sale deleted successfully'
      });
    } catch (error) {
      console.error('Delete sale error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
