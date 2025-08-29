import { prisma } from '../config/database.js';
import { Unit } from '../types/index.js';

export class UnitService {
  static async getAll(): Promise<Unit[]> {
    return await prisma.unit.findMany();
  }

  static async getById(id: number): Promise<Unit | null> {
    return await prisma.unit.findUnique({
      where: { unit_id: id }
    });
  }

  static async create(data: Omit<Unit, 'unit_id' | 'created_at'>): Promise<Unit> {
    return await prisma.unit.create({
      data
    });
  }

  static async update(id: number, data: Partial<Unit>): Promise<Unit | null> {
    return await prisma.unit.update({
      where: { unit_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.unit.delete({
        where: { unit_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
