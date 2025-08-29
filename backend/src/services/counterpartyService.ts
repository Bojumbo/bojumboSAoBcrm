import { prisma } from '../config/database.js';
import { Counterparty, CounterpartyWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';

export class CounterpartyService {
  static async getAll(userRole: string, userId: number): Promise<CounterpartyWithRelations[]> {
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

    return await prisma.counterparty.findMany({
      where: whereClause,
      include: {
        responsible_manager: {
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

  static async getById(id: number, userRole: string, userId: number): Promise<CounterpartyWithRelations | null> {
    let whereClause: any = { counterparty_id: id };

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

    return await prisma.counterparty.findFirst({
      where: whereClause,
      include: {
        responsible_manager: {
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

  static async create(data: Omit<Counterparty, 'counterparty_id' | 'created_at' | 'updated_at'>): Promise<Counterparty> {
    return await prisma.counterparty.create({
      data
    });
  }

  static async update(id: number, data: Partial<Counterparty>): Promise<Counterparty | null> {
    return await prisma.counterparty.update({
      where: { counterparty_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.counterparty.delete({
        where: { counterparty_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
