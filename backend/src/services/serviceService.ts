import { prisma } from '../config/database.js';
import { Service } from '../types/index.js';
import { Prisma } from '@prisma/client';

// Define a specific input type for creating and updating services
interface ServiceInput {
    name: string;
    description?: string | null;
    price: number;
}

// Helper to convert Prisma's Decimal type to a number
const toService = (service: Prisma.ServiceGetPayload<{}>): Service => {
    return {
        ...service,
        price: service.price.toNumber(),
    };
};

export class ServiceService {
  static async getAll(): Promise<Service[]> {
    const services = await prisma.service.findMany();
    return services.map(toService);
  }

  static async getById(id: number): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { service_id: id }
    });
    return service ? toService(service) : null;
  }

  static async create(data: ServiceInput): Promise<Service> {
    const service = await prisma.service.create({
      data
    });
    return toService(service);
  }

  static async update(id: number, data: Partial<ServiceInput>): Promise<Service | null> {
    const service = await prisma.service.update({
      where: { service_id: id },
      data
    });
    return service ? toService(service) : null;
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
