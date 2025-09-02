import { prisma } from '../config/database.js';
export class WarehouseService {
    static async getAll() {
        return await prisma.warehouse.findMany();
    }
    static async getById(id) {
        return await prisma.warehouse.findUnique({
            where: { warehouse_id: id }
        });
    }
    static async create(data) {
        return await prisma.warehouse.create({
            data
        });
    }
    static async update(id, data) {
        return await prisma.warehouse.update({
            where: { warehouse_id: id },
            data
        });
    }
    static async delete(id) {
        try {
            await prisma.warehouse.delete({
                where: { warehouse_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=warehouseService.js.map