import { prisma } from '../config/database.js';
import { Sale, SaleWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';

export class SaleService {
  static async getAll(userRole: string, userId: number): Promise<SaleWithRelations[]> {
    let whereClause: any = {};

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.responsible_manager_id = {
          in: [userId, ...subordinateIds]
        };
      } else {
        whereClause.responsible_manager_id = userId;
      }
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        counterparty: true,
        responsible_manager: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        project: true,
        products: {
          include: {
            product: {
              include: {
                unit: true
              }
            }
          }
        },
        services: {
          include: {
            service: true
          }
        }
      }
    });

    // Calculate total price for each sale
    return sales.map((sale: any) => {
      const productsTotal = sale.products.reduce((sum: number, item: any) => 
        sum + Number(item.product.price) * item.quantity, 0
      );
      const servicesTotal = sale.services.reduce((sum: number, item: any) => 
        sum + Number(item.service.price), 0
      );

      return {
        ...sale,
        total_price: productsTotal + servicesTotal
      };
    });
  }

  static async getById(id: number, userRole: string, userId: number): Promise<SaleWithRelations | null> {
    let whereClause: any = { sale_id: id };

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.responsible_manager_id = {
          in: [userId, ...subordinateIds]
        };
      } else {
        whereClause.responsible_manager_id = userId;
      }
    }

    const sale = await prisma.sale.findFirst({
      where: whereClause,
      include: {
        counterparty: true,
        responsible_manager: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        project: true,
        products: {
          include: {
            product: {
              include: {
                unit: true
              }
            }
          }
        },
        services: {
          include: {
            service: true
          }
        }
      }
    });

    if (!sale) return null;

    // Calculate total price
    const productsTotal = sale.products.reduce((sum: number, item: any) => 
      sum + Number(item.product.price) * item.quantity, 0
    );
    const servicesTotal = sale.services.reduce((sum: number, item: any) => 
      sum + Number(item.service.price), 0
    );

    return {
      ...sale,
      total_price: productsTotal + servicesTotal
    };
  }

  static async create(data: Omit<Sale, 'sale_id' | 'created_at' | 'updated_at'> & {
    products?: { product_id: number, quantity: number }[];
    services?: { service_id: number }[];
  }): Promise<Sale> {
    const { products, services, ...saleData } = data;

    const sale = await prisma.sale.create({
      data: saleData
    });

    if (products && products.length > 0) {
      await prisma.saleProduct.createMany({
        data: products.map(p => ({
          sale_id: sale.sale_id,
          product_id: p.product_id,
          quantity: p.quantity
        }))
      });

      // Update product stocks
      for (const product of products) {
        await prisma.productStock.updateMany({
          where: {
            product_id: product.product_id,
            warehouse_id: 1 // Default warehouse
          },
          data: {
            quantity: {
              decrement: product.quantity
            }
          }
        });
      }
    }

    if (services && services.length > 0) {
      await prisma.saleService.createMany({
        data: services.map(s => ({
          sale_id: sale.sale_id,
          service_id: s.service_id
        }))
      });
    }

    return sale;
  }

  static async update(id: number, data: Partial<Sale>): Promise<Sale | null> {
    return await prisma.sale.update({
      where: { sale_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.sale.delete({
        where: { sale_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
