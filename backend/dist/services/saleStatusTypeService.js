import { prisma } from '../config/database.js';
export class SaleStatusTypeService {
    static async getAll() {
        return prisma.saleStatusType.findMany({ orderBy: { created_at: 'asc' } });
    }
    static async getById(id) {
        return prisma.saleStatusType.findUnique({ where: { sale_status_id: id } });
    }
    static async create(data) {
        return prisma.saleStatusType.create({ data });
    }
    static async update(id, data) {
        return prisma.saleStatusType.update({ where: { sale_status_id: id }, data });
    }
    static async delete(id) {
        try {
            await prisma.saleStatusType.delete({ where: { sale_status_id: id } });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=saleStatusTypeService.js.map