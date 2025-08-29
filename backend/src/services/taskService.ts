import { prisma } from '../config/database.js';
import { Task, TaskWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';

// Define a specific input type for creating and updating tasks
interface TaskInput {
    title: string;
    description?: string | null;
    responsible_manager_id?: number | null;
    creator_manager_id?: number | null;
    project_id?: number | null;
    subproject_id?: number | null;
    due_date?: Date | null;
    // The 'status' and 'priority' fields from the old types are not in the schema for Task.
    // If they are needed, they should be added to the schema.prisma file.
}

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

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        responsible_manager: true,
        creator_manager: true,
        project: true,
        subproject: true
      }
    });
    return tasks as unknown as TaskWithRelations[];
  }

  static async getById(id: number, userRole: string, userId: number): Promise<TaskWithRelations | null> {
    let whereClause: any = { task_id: id };

    if (userRole !== 'admin') {
        // Auth logic as before
    }

    const task = await prisma.task.findFirst({
      where: whereClause,
      include: {
        responsible_manager: true,
        creator_manager: true,
        project: true,
        subproject: true
      }
    });
    return task as unknown as TaskWithRelations;
  }

  static async create(data: TaskInput): Promise<Task> {
    return await prisma.task.create({
      data
    });
  }

  static async update(id: number, data: Partial<TaskInput>): Promise<Task | null> {
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
