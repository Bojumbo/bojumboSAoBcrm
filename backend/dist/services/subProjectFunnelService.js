import { prisma } from '../config/database.js';
export class SubProjectFunnelService {
    static async getAll() {
        return await prisma.subProjectFunnel.findMany({
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
        return await prisma.subProjectFunnel.findUnique({
            where: { sub_project_funnel_id: id },
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
        return await prisma.subProjectFunnel.create({
            data
        });
    }
    static async update(id, data) {
        return await prisma.subProjectFunnel.update({
            where: { sub_project_funnel_id: id },
            data
        });
    }
    static async delete(id) {
        try {
            await prisma.subProjectFunnel.delete({
                where: { sub_project_funnel_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    // Funnel Stages
    static async getAllStages() {
        return await prisma.subProjectFunnelStage.findMany({
            include: {
                funnel: true
            },
            orderBy: [
                { sub_project_funnel_id: 'asc' },
                { order: 'asc' }
            ]
        });
    }
    static async getStageById(id) {
        return await prisma.subProjectFunnelStage.findUnique({
            where: { sub_project_funnel_stage_id: id },
            include: {
                funnel: true
            }
        });
    }
    static async createStage(data) {
        return await prisma.subProjectFunnelStage.create({
            data
        });
    }
    static async updateStage(id, data) {
        return await prisma.subProjectFunnelStage.update({
            where: { sub_project_funnel_stage_id: id },
            data
        });
    }
    static async deleteStage(id) {
        try {
            await prisma.subProjectFunnelStage.delete({
                where: { sub_project_funnel_stage_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=subProjectFunnelService.js.map