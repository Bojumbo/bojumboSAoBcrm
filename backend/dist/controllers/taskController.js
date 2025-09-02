import { TaskService } from '../services/taskService.js';
export class TaskController {
    static async getAll(req, res) {
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
        }
        catch (error) {
            console.error('Get all tasks error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getById(req, res) {
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
        }
        catch (error) {
            console.error('Get task by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const taskData = {
                ...req.body,
                creator_manager_id: req.user.manager_id,
                status: req.body?.status || 'new'
            };
            const task = await TaskService.create(taskData);
            res.status(201).json({
                success: true,
                data: task
            });
        }
        catch (error) {
            console.error('Create task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async update(req, res) {
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
            // Only the creator can update task fields (title, description, due, responsible, etc.)
            const existing = await TaskService.getById(id, req.user.role, req.user.manager_id);
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Task not found' });
            }
            if (existing.creator_manager_id && existing.creator_manager_id !== req.user.manager_id && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Only the creator can edit this task' });
            }
            const taskData = req.body;
            const task = await TaskService.update(id, taskData);
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
        }
        catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async delete(req, res) {
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
        }
        catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async updateStatus(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Not authenticated' });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid ID' });
            }
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ success: false, error: 'Missing status' });
            }
            const existing = await TaskService.getById(id, req.user.role, req.user.manager_id);
            if (!existing) {
                return res.status(404).json({ success: false, error: 'Task not found' });
            }
            // Only responsible manager (assignee) can change status; admins allowed
            if ((existing.responsible_manager_id ?? 0) !== req.user.manager_id && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Only the assignee can change status' });
            }
            const updated = await TaskService.updateStatus(id, status);
            res.json({ success: true, data: updated });
        }
        catch (error) {
            console.error('Update task status error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}
//# sourceMappingURL=taskController.js.map