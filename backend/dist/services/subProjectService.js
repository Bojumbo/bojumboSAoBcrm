import { prisma } from '../config/database.js';
import { AuthService } from './authService.js';
// Helper to convert Prisma types to application types
const toSubProjectWithRelations = (subProject) => {
    return {
        ...subProject,
        cost: subProject.cost.toNumber(),
        project: {
            ...subProject.project,
            forecast_amount: subProject.project.forecast_amount.toNumber(),
        },
        products: subProject.products.map(p => ({
            ...p,
            product: {
                ...p.product,
                price: p.product.price.toNumber(),
            }
        })),
        services: subProject.services.map(s => ({
            ...s,
            service: {
                ...s.service,
                price: s.service.price.toNumber(),
            }
        })),
    };
};
const toSubProject = (subProject) => {
    return {
        ...subProject,
        cost: subProject.cost.toNumber(),
    };
};
export class SubProjectService {
    static async getAll(userRole, userId) {
        let whereClause = {};
        if (userRole !== 'admin') {
            if (userRole === 'head') {
                const subordinateIds = await AuthService.getSubordinateIds(userId);
                whereClause.project = {
                    OR: [
                        { main_responsible_manager_id: { in: [userId, ...subordinateIds] } },
                        {
                            secondary_responsible_managers: {
                                some: {
                                    manager_id: { in: [userId, ...subordinateIds] }
                                }
                            }
                        }
                    ]
                };
            }
            else {
                whereClause.project = {
                    OR: [
                        { main_responsible_manager_id: userId },
                        {
                            secondary_responsible_managers: {
                                some: {
                                    manager_id: userId
                                }
                            }
                        }
                    ]
                };
            }
        }
        const subProjects = await prisma.subProject.findMany({
            where: whereClause,
            include: {
                project: {
                    include: {
                        main_responsible_manager: true,
                        counterparty: true
                    }
                },
                tasks: { include: { responsible_manager: true, creator_manager: true } },
                comments: { include: { manager: true }, orderBy: { created_at: 'asc' } },
                products: { include: { product: { include: { unit: true } } } },
                services: { include: { service: true } }
            }
        });
        return subProjects.map(toSubProjectWithRelations);
    }
    static async getById(id, userRole, userId) {
        let whereClause = { subproject_id: id };
        if (userRole !== 'admin') {
            if (userRole === 'head') {
                const subordinateIds = await AuthService.getSubordinateIds(userId);
                whereClause.project = {
                    OR: [
                        { main_responsible_manager_id: { in: [userId, ...subordinateIds] } },
                        {
                            secondary_responsible_managers: {
                                some: {
                                    manager_id: { in: [userId, ...subordinateIds] }
                                }
                            }
                        }
                    ]
                };
            }
            else {
                whereClause.project = {
                    OR: [
                        { main_responsible_manager_id: userId },
                        {
                            secondary_responsible_managers: {
                                some: {
                                    manager_id: userId
                                }
                            }
                        }
                    ]
                };
            }
        }
        const subProject = await prisma.subProject.findFirst({
            where: whereClause,
            include: {
                project: {
                    include: {
                        main_responsible_manager: true,
                        counterparty: true
                    }
                },
                tasks: { include: { responsible_manager: true, creator_manager: true } },
                comments: { include: { manager: true }, orderBy: { created_at: 'asc' } },
                products: { include: { product: { include: { unit: true } } } },
                services: { include: { service: true } }
            }
        });
        return subProject ? toSubProjectWithRelations(subProject) : null;
    }
    static async create(data) {
        const subProject = await prisma.subProject.create({
            data
        });
        return toSubProject(subProject);
    }
    static async update(id, data) {
        // Explicitly pick only the fields that are part of the SubProject model
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.cost !== undefined)
            updateData.cost = data.cost;
        const subProject = await prisma.subProject.update({
            where: { subproject_id: id },
            data: updateData
        });
        return subProject ? toSubProject(subProject) : null;
    }
    static async delete(id) {
        try {
            await prisma.subProject.delete({
                where: { subproject_id: id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=subProjectService.js.map