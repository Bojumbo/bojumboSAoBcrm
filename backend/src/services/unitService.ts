import { prisma } from '../config/database.js';
import { Unit } from '../types/index.js';

// Define a specific input type for creating and updating units
interface UnitInput {
    name: string;
    // The 'short_name' field from the old types is not in the schema for Unit.
}

export class UnitService {
  static async getAll(): Promise<Unit[]> {
    return await prisma.unit.findMany();
  }

  static async getById(id: number): Promise<Unit | null> {
    return await prisma.unit.findUnique({
      where: { unit_id: id }
    });
  }

  static async create(data: UnitInput): Promise<Unit> {
    return await prisma.unit.create({
      data
    });
  }

  static async update(id: number, data: Partial<UnitInput>): Promise<Unit | null> {
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
