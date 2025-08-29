import { prisma } from '../config/database.js';
import { Product, ProductWithRelations, ProductStockWithRelations } from '../types/index.js';
import { Prisma } from '@prisma/client';

// Define a specific input type for creating and updating products
interface ProductInput {
    name: string;
    description?: string | null;
    price: number;
    unit_id?: number | null;
}

// Helper to convert Prisma's Decimal type to a number for the Product entity
const toProduct = (
    product: Prisma.ProductGetPayload<{
        include: { unit: true; stocks: { include: { warehouse: true } } };
    }>
): ProductWithRelations => {
    return {
        ...product,
        price: product.price.toNumber(),
        // The 'stocks' relation is already in the correct shape
    };
};

const toProductBase = (product: Prisma.ProductGetPayload<{}>): Product => {
    return {
        ...product,
        price: product.price.toNumber(),
    };
};

export class ProductService {
  static async getAll(): Promise<ProductWithRelations[]> {
    const products = await prisma.product.findMany({
      include: {
        unit: true,
        stocks: {
          include: {
            warehouse: true
          }
        }
      }
    });
    return products.map(toProduct);
  }

  static async getById(id: number): Promise<ProductWithRelations | null> {
    const product = await prisma.product.findUnique({
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
    return product ? toProduct(product) : null;
  }

  static async create(data: ProductInput): Promise<Product> {
    const product = await prisma.product.create({
      data
    });
    return toProductBase(product);
  }

  static async update(id: number, data: Partial<ProductInput>): Promise<Product | null> {
    const product = await prisma.product.update({
      where: { product_id: id },
      data
    });
    return product ? toProductBase(product) : null;
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
      const stockUpserts = stocks.map(stock => 
        prisma.productStock.upsert({
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
        })
      );
      await prisma.$transaction(stockUpserts);
      return true;
    } catch (error) {
      console.error('Error setting product stocks:', error);
      return false;
    }
  }

  static async getProductStocks(productId: number): Promise<ProductStockWithRelations[]> {
    const stocks = await prisma.productStock.findMany({
      where: { product_id: productId },
      include: {
        warehouse: true
      }
    });
    return stocks as unknown as ProductStockWithRelations[];
  }
}
