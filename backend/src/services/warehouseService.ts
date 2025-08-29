import { prisma } from '../config/database.js';
import { Warehouse } from '../types/index.js';

export class WarehouseService {
  static async getAll(): Promise<Warehouse[]> {
    return await prisma.warehouse.findMany();
  }

  static async getById(id: number): Promise<Warehouse | null> {
    return await prisma.warehouse.findUnique({
      where: { warehouse_id: id }
    });
  }

  static async create(data: Omit<Warehouse, 'warehouse_id' | 'created_at'>): Promise<Warehouse> {
    return await prisma.warehouse.create({
      data
    });
  }

  static async update(id: number, data: Partial<Warehouse>): Promise<Warehouse | null> {
    return await prisma.warehouse.update({
      where: { warehouse_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.warehouse.delete({
        where: { warehouse_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
