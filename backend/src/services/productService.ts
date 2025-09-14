import { prisma } from '../config/database.js';
import { Product, ProductWithRelations, ProductStockWithRelations } from '../types/index.js';
import { Prisma } from '@prisma/client';

// Define a specific input type for creating and updating products
interface ProductInput {
    name: string;
    sku?: string; // Робимо необов'язковим для автогенерації
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
  static async getAll(searchQuery?: string): Promise<ProductWithRelations[]> {
    const whereClause = searchQuery ? {
      OR: [
        {
          name: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        },
        {
          sku: {
            contains: searchQuery,
            mode: 'insensitive' as const
          }
        }
      ]
    } : {};

    const products = await prisma.product.findMany({
      where: whereClause,
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
    try {
      // Якщо SKU не надано, генеруємо автоматично
      if (!data.sku || data.sku.trim() === '') {
        data.sku = await this.generateUniqueSKU(data.name);
      }

      const product = await prisma.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          description: data.description,
          price: data.price,
          unit_id: data.unit_id || undefined
        }
      });
      return toProductBase(product);
    } catch (error: any) {
      // Перевіряємо чи це помилка унікальності SKU
      if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
        throw new Error('Артикул (SKU) вже існує. Будь ласка, використайте інший артикул.');
      }
      throw error;
    }
  }

  static async update(id: number, data: Partial<ProductInput>): Promise<Product | null> {
    try {
      const updateData: any = { ...data };
      if (updateData.unit_id === null) {
        updateData.unit_id = undefined;
      }

      const product = await prisma.product.update({
        where: { product_id: id },
        data: updateData
      });
      return product ? toProductBase(product) : null;
    } catch (error: any) {
      // Перевіряємо чи це помилка унікальності SKU
      if (error.code === 'P2002' && error.meta?.target?.includes('sku')) {
        throw new Error('Артикул (SKU) вже існує. Будь ласка, використайте інший артикул.');
      }
      throw error;
    }
  }

  // Метод для генерації унікального SKU
  static async generateUniqueSKU(productName: string): Promise<string> {
    // Генеруємо SKU тільки з цифр
    const timestamp = Date.now().toString();
    let sku = timestamp.slice(-6); // Беремо останні 6 цифр timestamp
    let counter = 1;

    // Шукаємо унікальний SKU
    while (await this.skuExists(sku)) {
      sku = `${timestamp.slice(-4)}${counter.toString().padStart(2, '0')}`;
      counter++;
    }

    return sku;
  }

  // Перевіряємо чи існує SKU
  static async skuExists(sku: string): Promise<boolean> {
    const existing = await prisma.product.findUnique({
      where: { sku }
    });
    return existing !== null;
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
