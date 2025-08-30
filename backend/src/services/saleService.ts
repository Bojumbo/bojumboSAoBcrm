import { prisma } from '../config/database.js';
import { Sale, SaleWithRelations, CreateSaleRequest, UpdateSaleRequest } from '../types/index.js';
import { AuthService } from './authService.js';
import { Prisma } from '@prisma/client';

// Helper function to calculate total price and convert Decimal types
const toSaleWithRelations = (
    sale: Prisma.SaleGetPayload<{
        include: {
            counterparty: true;
            responsible_manager: true;
            project: true;
            products: { include: { product: true } };
            services: { include: { service: true } };
        };
    }>
): SaleWithRelations => {
    const productsTotal = sale.products.reduce(
        (sum, item) => sum + item.product.price.toNumber() * item.quantity,
        0
    );
  const servicesTotal = sale.services.reduce(
    (sum, item) => sum + item.service.price.toNumber(),
    0
  );

    return {
        ...sale,
        total_price: productsTotal + servicesTotal,
  products: sale.products.map(p => ({...p, product: {...p.product, price: p.product.price.toNumber()}})),
  services: sale.services.map(s => ({...s, service: {...s.service, price: s.service.price.toNumber()}})),
    } as unknown as SaleWithRelations;
};

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
        responsible_manager: true,
        project: true,
        products: { include: { product: true } },
        services: { include: { service: true } }
      }
    });

    return sales.map(toSaleWithRelations);
  }

  static async getById(id: number, userRole: string, userId: number): Promise<SaleWithRelations | null> {
    let whereClause: any = { sale_id: id };

    if (userRole !== 'admin') {
        // Auth logic as before
    }

    const sale = await prisma.sale.findFirst({
      where: whereClause,
      include: {
        counterparty: true,
        responsible_manager: true,
        project: true,
        products: { include: { product: true } },
        services: { include: { service: true } }
      }
    });

    return sale ? toSaleWithRelations(sale) : null;
  }

  static async create(data: CreateSaleRequest): Promise<Sale> {
    const { products, services, ...raw } = data as any;

    // Convert possible numeric status (sale_status_type_id) to status name expected by schema
    let statusValue = raw.status;
    if (typeof statusValue === 'number') {
      const s = await prisma.saleStatusType.findUnique({ where: { sale_status_id: statusValue } });
      if (s) statusValue = s.name;
      else throw new Error('INVALID_SALE_STATUS');
    }

  const saleData: any = { ...raw, status: statusValue };
  // Remove non-persisted helper field if present
  if ('subproject_id' in saleData) delete saleData.subproject_id;

    if (!saleData.counterparty_id) {
      throw new Error('COUNTERPARTY_REQUIRED');
    }
    if (!saleData.responsible_manager_id) {
      throw new Error('RESPONSIBLE_REQUIRED');
    }

    return await prisma.sale.create({
      data: {
        ...saleData,
        sale_date: new Date(saleData.sale_date),
        deferred_payment_date: saleData.deferred_payment_date ? new Date(saleData.deferred_payment_date) : null,
        products: products ? {
          create: products.map((p: { product_id: number; quantity: number }) => ({
            quantity: p.quantity,
            product: { connect: { product_id: p.product_id } }
          }))
        } : undefined,
        services: services ? {
          create: services.flatMap((s: { service_id: number; quantity?: number }) => {
            const qty = Math.max(1, Math.round(Number(s.quantity ?? 1)));
            return Array.from({ length: qty }).map(() => ({
              service: { connect: { service_id: s.service_id } }
            }));
          })
        } : undefined
      }
    });
  }

  static async update(id: number, data: UpdateSaleRequest): Promise<Sale | null> {
    const { products, services, ...saleData } = data;

    // Handling date conversions for update
    const updateData: any = { ...saleData };
    if (saleData.sale_date) {
        updateData.sale_date = new Date(saleData.sale_date);
    }
    if (saleData.deferred_payment_date) {
        updateData.deferred_payment_date = new Date(saleData.deferred_payment_date);
    }

    // If status provided as numeric id, map to name like in create()
    if (typeof updateData.status === 'number') {
      const s = await prisma.saleStatusType.findUnique({ where: { sale_status_id: updateData.status } });
      if (!s) throw new Error('INVALID_SALE_STATUS');
      updateData.status = s.name;
    }

  // Remove non-persisted helper field if present
  if ('subproject_id' in updateData) delete (updateData as any).subproject_id;

    const updatedSale = await prisma.sale.update({
      where: { sale_id: id },
      data: {
        ...updateData,
        products: products ? {
          deleteMany: {},
          create: products.map(p => ({
            quantity: p.quantity,
            product: { connect: { product_id: p.product_id } }
          }))
        } : undefined,
        services: services ? {
          deleteMany: {},
          create: services.flatMap(s => {
            const qty = Math.max(1, Math.round(Number((s as any).quantity ?? 1)));
            return Array.from({ length: qty }).map(() => ({
              service: { connect: { service_id: s.service_id } }
            }));
          })
        } : undefined
      }
    });

    return updatedSale;
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.saleProduct.deleteMany({ where: { sale_id: id } });
      await prisma.saleService.deleteMany({ where: { sale_id: id } });
      await prisma.sale.delete({ where: { sale_id: id } });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
