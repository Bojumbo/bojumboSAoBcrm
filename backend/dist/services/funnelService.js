import { prisma } from '../config/database.js';
export class FunnelService {
    static async getAll() {
        return await prisma.funnel.findMany({
            include: {
                stages: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
    }
    static async getById(id) {
        return await prisma.funnel.findUnique({
            where: { funnel_id: id },
            include: {
                stages: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
    }
    static async create(data) {
        return await prisma.funnel.create({
            data
        });
    }
    static async update(id, data) {
        return await prisma.funnel.update({
            where: { funnel_id: id },
            data
        });
    }
    static async delete(id) {
        try {
            await prisma.funnel.delete({
                where: { funnel_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    // Funnel Stages
    static async getAllStages() {
        return await prisma.funnelStage.findMany({
            include: {
                funnel: true
            },
            orderBy: [
                { funnel_id: 'asc' },
                { order: 'asc' }
            ]
        });
    }
    static async getStageById(id) {
        return await prisma.funnelStage.findUnique({
            where: { funnel_stage_id: id },
            include: {
                funnel: true
            }
        });
    }
    static async createStage(data) {
        return await prisma.funnelStage.create({
            data
        });
    }
    static async updateStage(id, data) {
        return await prisma.funnelStage.update({
            where: { funnel_stage_id: id },
            data
        });
    }
    static async deleteStage(id) {
        try {
            await prisma.funnelStage.delete({
                where: { funnel_stage_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=funnelService.js.map