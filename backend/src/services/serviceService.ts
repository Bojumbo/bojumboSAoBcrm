import { prisma } from '../config/database.js';
import { Service } from '../types/index.js';

export class ServiceService {
  static async getAll(): Promise<Service[]> {
    return await prisma.service.findMany();
  }

  static async getById(id: number): Promise<Service | null> {
    return await prisma.service.findUnique({
      where: { service_id: id }
    });
  }

  static async create(data: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>): Promise<Service> {
    return await prisma.service.create({
      data
    });
  }

  static async update(id: number, data: Partial<Service>): Promise<Service | null> {
    return await prisma.service.update({
      where: { service_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.service.delete({
        where: { service_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
