import { prisma } from '../config/database.js';
export class UnitService {
    static async getAll() {
        return await prisma.unit.findMany();
    }
    static async getById(id) {
        return await prisma.unit.findUnique({
            where: { unit_id: id }
        });
    }
    static async create(data) {
        return await prisma.unit.create({
            data
        });
    }
    static async update(id, data) {
        return await prisma.unit.update({
            where: { unit_id: id },
            data
        });
    }
    static async delete(id) {
        try {
            await prisma.unit.delete({
                where: { unit_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=unitService.js.map