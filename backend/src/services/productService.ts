import { prisma } from '../config/database.js';
import { Product, ProductWithRelations } from '../types/index.js';

export class ProductService {
  static async getAll(): Promise<ProductWithRelations[]> {
    return await prisma.product.findMany({
      include: {
        unit: true,
        stocks: {
          include: {
            warehouse: true
          }
        }
      }
    });
  }

  static async getById(id: number): Promise<ProductWithRelations | null> {
    return await prisma.product.findUnique({
      where: { product_id: id },
      include: {
        unit: true,
        stocks: {
          include: {
            warehouse: true
          }
        }
      }
    });
  }

  static async create(data: Omit<Product, 'product_id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return await prisma.product.create({
      data
    });
  }

  static async update(id: number, data: Partial<Product>): Promise<Product | null> {
    return await prisma.product.update({
      where: { product_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { product_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }

  static async setProductStocks(productId: number, stocks: { warehouse_id: number, quantity: number }[]): Promise<boolean> {
    try {
      for (const stock of stocks) {
        await prisma.productStock.upsert({
          where: {
            product_id_warehouse_id: {
              product_id: productId,
              warehouse_id: stock.warehouse_id
            }
          },
          update: {
            quantity: stock.quantity
          },
          create: {
            product_id: productId,
            warehouse_id: stock.warehouse_id,
            quantity: stock.quantity
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error setting product stocks:', error);
      return false;
    }
  }

  static async getProductStocks(productId: number) {
    return await prisma.productStock.findMany({
      where: { product_id: productId },
      include: {
        warehouse: true
      }
    });
  }
}
