import { prisma } from '../config/database.js';
import { Manager, ManagerWithRelations, ManagerRole } from '../types/index.js';
import { AuthService } from './authService.js';
import bcrypt from 'bcryptjs';

interface ManagerInput {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: ManagerRole;
  password_hash: string;
  supervisor_ids?: number[];
}

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

    const managers = await prisma.manager.findMany({
      where: whereClause,
      include: {
        supervisors: true,
        subordinates: true
      }
    });
    return managers as unknown as ManagerWithRelations[];
  }

  static async getAllForAssignment(): Promise<Manager[]> {
    // Повертаємо всіх менеджерів для можливості призначення завдань
    const managers = await prisma.manager.findMany({
      select: {
        manager_id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true
      },
      orderBy: [
        { first_name: 'asc' },
        { last_name: 'asc' }
      ]
    });
    return managers as unknown as Manager[];
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

    const manager = await prisma.manager.findUnique({
      where: { manager_id: id },
      include: {
        supervisors: true,
        subordinates: true,
        counterparties: true,
        sales: true,
        projects_as_main: true,
        projects_as_secondary: true,
        tasks_as_responsible: true,
        tasks_as_creator: true,
      }
    });
    return manager as unknown as ManagerWithRelations;
  }

  static async create(data: ManagerInput): Promise<Manager> {
    const { supervisor_ids, ...managerData } = data;
    const hashedPassword = await bcrypt.hash(managerData.password_hash, 10);

    const newManager = await prisma.manager.create({
      data: {
        ...managerData,
        password_hash: hashedPassword,
        supervisors: supervisor_ids ? { connect: supervisor_ids.map(id => ({ manager_id: id })) } : undefined
      }
    });
    return newManager;
  }

  static async update(id: number, data: Partial<ManagerInput>): Promise<Manager | null> {
    const { supervisor_ids, password_hash, ...managerData } = data;

    let updatePayload: any = { ...managerData };

    if (password_hash) {
      updatePayload.password_hash = await bcrypt.hash(password_hash, 10);
    }

    if (supervisor_ids !== undefined) {
        updatePayload.supervisors = {
            set: supervisor_ids.map(sid => ({ manager_id: sid }))
        };
    }

    return await prisma.manager.update({
      where: { manager_id: id },
      data: updatePayload
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      // This is a complex operation. For now, we'll just delete the manager.
      // In a real app, you'd need to handle reassigning responsibilities.
      await prisma.manager.delete({
        where: { manager_id: id }
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
