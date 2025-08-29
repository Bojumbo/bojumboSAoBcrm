import { prisma } from '../config/database.js';
import { Task, TaskWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';

export class TaskService {
  static async getAll(userRole: string, userId: number): Promise<TaskWithRelations[]> {
    let whereClause: any = {};

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.OR = [
          { responsible_manager_id: { in: [userId, ...subordinateIds] } },
          { creator_manager_id: { in: [userId, ...subordinateIds] } }
        ];
      } else {
        whereClause.OR = [
          { responsible_manager_id: userId },
          { creator_manager_id: userId }
        ];
      }
    }

    return await prisma.task.findMany({
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
        },
        creator_manager: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        project: true,
        subproject: true
      }
    });
  }

  static async getById(id: number, userRole: string, userId: number): Promise<TaskWithRelations | null> {
    let whereClause: any = { task_id: id };

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.OR = [
          { responsible_manager_id: { in: [userId, ...subordinateIds] } },
          { creator_manager_id: { in: [userId, ...subordinateIds] } }
        ];
      } else {
        whereClause.OR = [
          { responsible_manager_id: userId },
          { creator_manager_id: userId }
        ];
      }
    }

    return await prisma.task.findFirst({
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
        },
        creator_manager: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        project: true,
        subproject: true
      }
    });
  }

  static async create(data: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    return await prisma.task.create({
      data
    });
  }

  static async update(id: number, data: Partial<Task>): Promise<Task | null> {
    return await prisma.task.update({
      where: { task_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.task.delete({
        where: { task_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
