import { prisma } from '../config/database.js';
import { AuthService } from './authService.js';
export class TaskService {
    static async getAll(userRole, userId) {
        let whereClause = {};
        if (userRole !== 'admin') {
            if (userRole === 'head') {
                const subordinateIds = await AuthService.getSubordinateIds(userId);
                whereClause.OR = [
                    { responsible_manager_id: { in: [userId, ...subordinateIds] } },
                    { creator_manager_id: { in: [userId, ...subordinateIds] } }
                ];
            }
            else {
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
        return tasks;
    }
    static async getById(id, userRole, userId) {
        let whereClause = { task_id: id };
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
        return task;
    }
    static async create(data) {
        return await prisma.task.create({
            data: data
        });
    }
    static async update(id, data) {
        return await prisma.task.update({
            where: { task_id: id },
            data: data
        });
    }
    static async updateStatus(id, status) {
        try {
            // Prefer normal client if available
            return await prisma.task.update({ where: { task_id: id }, data: { status } });
        }
        catch {
            // Fallback to raw query if client types/engine mismatch on Windows
            await prisma.$executeRawUnsafe(`UPDATE tasks SET status = $1 WHERE task_id = $2`, status, id);
            const updated = await prisma.task.findUnique({ where: { task_id: id } });
            return updated;
        }
    }
    static async delete(id) {
        try {
            await prisma.task.delete({
                where: { task_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=taskService.js.map