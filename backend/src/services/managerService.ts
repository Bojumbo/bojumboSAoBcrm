import { prisma } from '../config/database.js';
import { Manager, ManagerWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';

export class ManagerService {
  static async getAll(userRole: string, userId: number): Promise<ManagerWithRelations[]> {
    let whereClause: any = {};

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.manager_id = {
          in: [userId, ...subordinateIds]
        };
      } else {
        whereClause.manager_id = userId;
      }
    }

    return await prisma.manager.findMany({
      where: whereClause,
      include: {
        supervisors: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        subordinates: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  static async getById(id: number, userRole: string, userId: number): Promise<ManagerWithRelations | null> {
    if (userRole !== 'admin' && userId !== id) {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        if (!subordinateIds.includes(id)) {
          return null;
        }
      } else {
        return null;
      }
    }

    return await prisma.manager.findUnique({
      where: { manager_id: id },
      include: {
        supervisors: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        subordinates: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  static async create(data: Omit<Manager, 'manager_id' | 'created_at' | 'updated_at'>): Promise<Manager> {
    return await prisma.manager.create({
      data
    });
  }

  static async update(id: number, data: Partial<Manager>): Promise<Manager | null> {
    return await prisma.manager.update({
      where: { manager_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.manager.delete({
        where: { manager_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
