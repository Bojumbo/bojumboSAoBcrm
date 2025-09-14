import { Request, Response } from 'express';
import { ProductService } from '../services/productService.js';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const searchQuery = req.query.search as string;
      const products = await ProductService.getAll(searchQuery);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get all products error:', error);
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

      const product = await ProductService.getById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const productData = req.body;
      const product = await ProductService.create(productData);

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error: any) {
      console.error('Create product error:', error);
      
      // Перевіряємо чи це наша кастомна помилка про дублювання SKU
      if (error.message && error.message.includes('Артикул (SKU) вже існує')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      // Перевіряємо чи це помилка валідації Prisma
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Дані не унікальні. Можливо, артикул вже використовується.'
        });
      }

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

      const productData = req.body;
      const product = await ProductService.update(id, productData);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error: any) {
      console.error('Update product error:', error);
      
      // Перевіряємо чи це наша кастомна помилка про дублювання SKU
      if (error.message && error.message.includes('Артикул (SKU) вже існує')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      // Перевіряємо чи це помилка валідації Prisma
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Дані не унікальні. Можливо, артикул вже використовується.'
        });
      }

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

      const success = await ProductService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async setProductStocks(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const { stocks } = req.body;

      if (!Array.isArray(stocks)) {
        return res.status(400).json({
          success: false,
          error: 'Stocks must be an array'
        });
      }

      const success = await ProductService.setProductStocks(id, stocks);

      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update product stocks'
        });
      }

      res.json({
        success: true,
        message: 'Product stocks updated successfully'
      });
    } catch (error) {
      console.error('Set product stocks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProductStocks(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const stocks = await ProductService.getProductStocks(id);

      res.json({
        success: true,
        data: stocks
      });
    } catch (error) {
      console.error('Get product stocks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
