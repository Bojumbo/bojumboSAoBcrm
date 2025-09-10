import { prisma } from '../config/database.js';
import { Counterparty, CounterpartyWithRelations, CounterpartyTypeEnum } from '../types/index.js';
import { AuthService } from './authService.js';

// Define a specific input type for creating and updating counterparties
interface CounterpartyInput {
  name: string;
  counterparty_type: CounterpartyTypeEnum;
  responsible_manager_id?: number | null;
  phone?: string | null;
  email?: string | null;
}

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

    const counterparties = await prisma.counterparty.findMany({
      where: whereClause,
      include: {
        responsible_manager: true
      }
    });
    return counterparties as unknown as CounterpartyWithRelations[];
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

    const counterparty = await prisma.counterparty.findFirst({
      where: whereClause,
      include: {
        responsible_manager: true,
        projects: true,
        sales: true
      }
    });

    return counterparty as unknown as CounterpartyWithRelations;
  }

  static async create(data: CounterpartyInput): Promise<Counterparty> {
    return await prisma.counterparty.create({
      data
    });
  }

  static async update(id: number, data: Partial<CounterpartyInput>): Promise<Counterparty | null> {
    return await prisma.counterparty.update({
      where: { counterparty_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      // Add logic to handle related records if necessary
      await prisma.project.updateMany({
        where: { counterparty_id: id },
        data: { counterparty_id: null }
      });
      await prisma.sale.deleteMany({
        where: { counterparty_id: id }
      });
      await prisma.counterparty.delete({
        where: { counterparty_id: id }
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
