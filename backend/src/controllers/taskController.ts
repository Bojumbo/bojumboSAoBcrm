import { Request, Response } from 'express';
import { TaskService } from '../services/taskService.js';

export class TaskController {
  static async getAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const tasks = await TaskService.getAll(req.user.role, req.user.manager_id);

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Get all tasks error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const task = await TaskService.getById(id, req.user.role, req.user.manager_id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Get task by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      console.log(`Create task request - User ID: ${req.user.manager_id}, Role: ${req.user.role}`);
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      const taskData = {
        ...req.body,
        creator_manager_id: req.user.manager_id,
        // Якщо виконавець не вказаний, призначаємо того, хто створює
        responsible_manager_id: req.body.responsible_manager_id || req.user.manager_id
      };

      console.log('Task data to create:', JSON.stringify(taskData, null, 2));
      const task = await TaskService.create(taskData);

      console.log(`Task created successfully: ${task.title} (ID: ${task.task_id})`);
      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      console.log(`Update task request - Task ID: ${id}, User ID: ${req.user.manager_id}, Role: ${req.user.role}`);
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      // Only the creator can update task fields (title, description, due, responsible, etc.)
      const existing = await TaskService.getById(id, req.user.role, req.user.manager_id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      console.log(`Found task: ${existing.title}, creator: ${existing.creator_manager_id}, current user: ${req.user.manager_id}`);

      if (existing.creator_manager_id && existing.creator_manager_id !== req.user.manager_id && req.user.role !== 'admin') {
        console.log(`Permission denied: creator ${existing.creator_manager_id} !== user ${req.user.manager_id}, role: ${req.user.role}`);
        return res.status(403).json({ success: false, error: 'Only the creator can edit this task' });
      }

      console.log('Permission check passed, updating task...');
      const taskData = req.body;
      const task = await TaskService.update(id, taskData);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      console.log(`Task updated successfully: ${task.title}`);
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async partialUpdate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      console.log(`Partial update task request - Task ID: ${id}, User ID: ${req.user.manager_id}, Role: ${req.user.role}`);
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      // More relaxed permissions - creator, assignee, or admin can update
      const existing = await TaskService.getById(id, req.user.role, req.user.manager_id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      console.log(`Found task: ${existing.title}, creator: ${existing.creator_manager_id}, responsible: ${existing.responsible_manager_id}, current user: ${req.user.manager_id}`);

      const isCreator = existing.creator_manager_id === req.user.manager_id;
      const isAssignee = existing.responsible_manager_id === req.user.manager_id;
      const isAdmin = req.user.role === 'admin';

      if (!isCreator && !isAssignee && !isAdmin) {
        console.log(`Permission denied: user ${req.user.manager_id} is not creator, assignee, or admin`);
        return res.status(403).json({ success: false, error: 'You can only edit tasks you created or are assigned to' });
      }

      console.log('Permission check passed, updating task...');
      const taskData = req.body;
      const task = await TaskService.update(id, taskData);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      console.log(`Task updated successfully: ${task.title}`);
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Partial update task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID'
        });
      }

      const success = await TaskService.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated' });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid ID' });
      }

      const { status } = req.body as { status?: string };
      console.log(`UpdateStatus request - Task ID: ${id}, New Status: ${status}, User ID: ${req.user.manager_id}`);
      
      if (!status) {
        return res.status(400).json({ success: false, error: 'Missing status' });
      }
      
      const allowed = ['new','in_progress','blocked','done','cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      const existing = await TaskService.getById(id, req.user.role, req.user.manager_id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      console.log(`Found task: ${existing.title}, current status: ${existing.status}`);
      console.log(`Task creator: ${existing.creator_manager_id}, responsible: ${existing.responsible_manager_id}`);

      // Assignee or Creator (or admin) can change status
      const isAssignee = (existing.responsible_manager_id ?? 0) === req.user.manager_id;
      const isCreator = (existing.creator_manager_id ?? 0) === req.user.manager_id;
      
      console.log(`Permission check - isAssignee: ${isAssignee}, isCreator: ${isCreator}, isAdmin: ${req.user.role === 'admin'}`);
      
      if (!isAssignee && !isCreator && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Only the assignee can change status' });
      }

      const updated = await TaskService.updateStatus(id, status);
      
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Task not found after update' });
      }
      
      console.log(`Task status updated successfully: ${updated.title} -> ${updated.status}`);
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
