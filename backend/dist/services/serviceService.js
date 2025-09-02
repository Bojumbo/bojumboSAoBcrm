import { prisma } from '../config/database.js';
// Helper to convert Prisma's Decimal type to a number
const toService = (service) => {
    return {
        ...service,
        price: service.price.toNumber(),
    };
};
export class ServiceService {
    static async getAll() {
        const services = await prisma.service.findMany();
        return services.map(toService);
    }
    static async getById(id) {
        const service = await prisma.service.findUnique({
            where: { service_id: id }
        });
        return service ? toService(service) : null;
    }
    static async create(data) {
        const service = await prisma.service.create({
            data
        });
        return toService(service);
    }
    static async update(id, data) {
        const service = await prisma.service.update({
            where: { service_id: id },
            data
        });
        return service ? toService(service) : null;
    }
    static async delete(id) {
        try {
            await prisma.service.delete({
                where: { service_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=serviceService.js.map