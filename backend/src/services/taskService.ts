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
  // status is an enum in schema; keep it as string here to avoid client type drift
  status?: string;
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
    try {
      console.log('TaskService.create called with data:', JSON.stringify(data, null, 2));
      
      // Обробляємо дату, якщо вона передана
      const processedData = { ...data };
      if (processedData.due_date && typeof processedData.due_date === 'string') {
        processedData.due_date = new Date(processedData.due_date);
      }
      
      console.log('Processed create data:', JSON.stringify(processedData, null, 2));
      
      const task = await (prisma as any).task.create({
        data: processedData as any,
        include: {
          responsible_manager: true,
          creator_manager: true,
          project: true,
          subproject: true
        }
      });
      
      console.log(`Task created successfully in service: ${task.title} (ID: ${task.task_id})`);
      return task;
    } catch (error) {
      console.error('TaskService.create error:', error);
      throw error;
    }
  }

  static async update(id: number, data: Partial<TaskInput>): Promise<Task | null> {
    try {
      console.log(`TaskService.update called with id: ${id}`);
      console.log('Update data:', JSON.stringify(data, null, 2));
      
      // Обробляємо дату, якщо вона передана
      const processedData = { ...data };
      if (processedData.due_date && typeof processedData.due_date === 'string') {
        processedData.due_date = new Date(processedData.due_date);
      }
      
      console.log('Processed data:', JSON.stringify(processedData, null, 2));
      
      const updated = await (prisma as any).task.update({
        where: { task_id: id },
        data: processedData as any,
        include: {
          responsible_manager: true,
          creator_manager: true,
          project: true,
          subproject: true
        }
      });
      
      console.log(`Task updated successfully in service: ${updated.title}`);
      return updated;
    } catch (error) {
      console.error('TaskService.update error:', error);
      throw error;
    }
  }

  static async updateStatus(id: number, status: string): Promise<Task | null> {
    try {
      console.log(`UpdateStatus called with id: ${id}, status: ${status}`);
      
      // Перевіримо, що завдання існує
      const existing = await prisma.task.findUnique({ where: { task_id: id } });
      if (!existing) {
        console.log(`Task with id ${id} not found`);
        return null;
      }
      
      console.log(`Found existing task: ${existing.title}, current status: ${existing.status}`);
      
      // Prefer normal client if available
      const updated = await (prisma as any).task.update({ 
        where: { task_id: id }, 
        data: { status },
        include: {
          creator_manager: true,
          responsible_manager: true,
          project: true,
          subproject: true
        }
      });
      
      console.log(`Task updated successfully: ${updated.title}, new status: ${updated.status}`);
      return updated;
    } catch (error) {
      console.error(`Error updating task status:`, error);
      
      // Fallback to raw query if client types/engine mismatch on Windows
      try {
        await (prisma as any).$executeRawUnsafe(`UPDATE tasks SET status = $1 WHERE task_id = $2`, status, id);
        const updated = await prisma.task.findUnique({ 
          where: { task_id: id },
          include: {
            creator_manager: true,
            responsible_manager: true,
            project: true,
            subproject: true
          }
        });
        console.log(`Task updated via raw query: ${updated?.title}, new status: ${updated?.status}`);
        return updated as any;
      } catch (fallbackError) {
        console.error(`Fallback query also failed:`, fallbackError);
        throw fallbackError;
      }
    }
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
