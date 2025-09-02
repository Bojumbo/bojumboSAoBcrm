import { prisma } from '../config/database.js';
import { AuthService } from './authService.js';
export class CounterpartyService {
    static async getAll(userRole, userId) {
        let whereClause = {};
        if (userRole !== 'admin') {
            if (userRole === 'head') {
                const subordinateIds = await AuthService.getSubordinateIds(userId);
                whereClause.responsible_manager_id = {
                    in: [userId, ...subordinateIds]
                };
            }
            else {
                whereClause.responsible_manager_id = userId;
            }
        }
        const counterparties = await prisma.counterparty.findMany({
            where: whereClause,
            include: {
                responsible_manager: true
            }
        });
        return counterparties;
    }
    static async getById(id, userRole, userId) {
        let whereClause = { counterparty_id: id };
        if (userRole !== 'admin') {
            if (userRole === 'head') {
                const subordinateIds = await AuthService.getSubordinateIds(userId);
                whereClause.responsible_manager_id = {
                    in: [userId, ...subordinateIds]
                };
            }
            else {
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
        return counterparty;
    }
    static async create(data) {
        return await prisma.counterparty.create({
            data
        });
    }
    static async update(id, data) {
        return await prisma.counterparty.update({
            where: { counterparty_id: id },
            data
        });
    }
    static async delete(id) {
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
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
}
//# sourceMappingURL=counterpartyService.js.map