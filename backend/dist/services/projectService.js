import { prisma } from '../config/database.js';
import { AuthService } from './authService.js';
// Helper to convert Prisma Decimal to number
const toProject = (project) => {
    return { ...project, forecast_amount: project.forecast_amount.toNumber() };
};
const toSubProject = (subProject) => {
    return { ...subProject, cost: subProject.cost.toNumber() };
};
export class ProjectService {
    static async getAll(userRole, userId) {
        let whereClause = {};
        if (userRole !== 'admin') {
            const projectWhere = {};
            if (userRole === 'head') {
                const subordinateIds = await AuthService.getSubordinateIds(userId);
                projectWhere.OR = [
                    { main_responsible_manager_id: { in: [userId, ...subordinateIds] } },
                    { secondary_responsible_managers: { some: { manager_id: { in: [userId, ...subordinateIds] } } } }
                ];
            }
            else { // 'manager' role
                projectWhere.OR = [
                    { main_responsible_manager_id: userId },
                    { secondary_responsible_managers: { some: { manager_id: userId } } }
                ];
            }
            whereClause = projectWhere;
        }
        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                main_responsible_manager: {
                    select: { manager_id: true, first_name: true, last_name: true }
                },
                secondary_responsible_managers: {
                    include: {
                        manager: {
                            select: { manager_id: true, first_name: true, last_name: true }
                        }
                    }
                },
                counterparty: { select: { counterparty_id: true, name: true } },
                funnel: { select: { funnel_id: true, name: true } },
                funnel_stage: { select: { funnel_stage_id: true, name: true } },
                _count: {
                    select: { subprojects: true, tasks: true, sales: true, comments: true }
                }
            }
        });
        return projects.map(p => ({
            ...p,
            forecast_amount: p.forecast_amount.toNumber(),
            secondary_responsible_managers: p.secondary_responsible_managers.map(sm => sm.manager)
        }));
    }
    static async getById(id, userRole, userId) {
        let whereClause = { project_id: id };
        if (userRole !== 'admin') {
            // Authorization logic can be added here if needed
        }
        const project = await prisma.project.findFirst({
            where: whereClause,
            include: {
                main_responsible_manager: true,
                secondary_responsible_managers: { include: { manager: true } },
                counterparty: true,
                funnel: true,
                funnel_stage: true,
                subprojects: true,
                tasks: { include: { responsible_manager: true, creator_manager: true } },
                sales: { include: { counterparty: true, responsible_manager: true, products: { include: { product: true } }, services: { include: { service: true } } } },
                products: { include: { product: { include: { unit: true } } } },
                services: { include: { service: true } },
                comments: { include: { manager: true }, orderBy: { created_at: 'asc' } }
            }
        });
        if (!project)
            return null;
        const projAny = project;
        // Convert main project forecast amount
        projAny.forecast_amount = projAny.forecast_amount.toNumber();
        // Convert cost in subprojects to number
        if (projAny.subprojects && projAny.subprojects.length > 0) {
            projAny.subprojects = projAny.subprojects.map((sp) => ({
                ...sp,
                cost: sp.cost.toNumber()
            }));
        }
        // Convert total_price in sales to number
        if (projAny.sales && projAny.sales.length > 0) {
            projAny.sales = projAny.sales.map((s) => ({
                ...s,
                total_price: s.total_price ? s.total_price.toNumber() : 0
            }));
        }
        // Normalize products (ensure numeric quantity)
        if (projAny?.products?.length) {
            projAny.products = projAny.products.map((pp) => ({
                ...pp,
                quantity: Number(pp.quantity ?? 1),
                product: pp.product ? { ...pp.product, price: Number(pp.product.price?.toNumber ? pp.product.price.toNumber() : pp.product.price) } : pp.product
            }));
        }
        // Aggregate services by service_id and compute fractional quantity in steps of 0.1
        if (projAny?.services?.length) {
            const grouped = new Map();
            for (const ps of projAny.services) {
                const sid = ps.service_id || ps.service?.service_id;
                if (!sid)
                    continue;
                const g = grouped.get(sid);
                if (g) {
                    g._count += 1;
                }
                else {
                    grouped.set(sid, { ...ps, _count: 1 });
                }
            }
            projAny.services = Array.from(grouped.values()).map((it) => ({
                ...it,
                quantity: (it._count || 1) / 10,
                service: it.service ? { ...it.service, price: Number(it.service.price?.toNumber ? it.service.price.toNumber() : it.service.price) } : it.service
            }));
        }
        return projAny;
    }
    static async create(data) {
        const { secondary_responsible_manager_ids, ...projectData } = data;
        const project = await prisma.project.create({
            data: projectData
        });
        if (secondary_responsible_manager_ids && secondary_responsible_manager_ids.length > 0) {
            await prisma.projectManager.createMany({
                data: secondary_responsible_manager_ids.map((managerId) => ({
                    project_id: project.project_id,
                    manager_id: managerId
                }))
            });
        }
        return toProject(project);
    }
    static async update(id, data) {
        const { secondary_responsible_manager_ids, ...projectData } = data;
        const updatedProject = await prisma.project.update({
            where: { project_id: id },
            data: projectData,
        });
        if (secondary_responsible_manager_ids !== undefined) {
            await prisma.projectManager.deleteMany({ where: { project_id: id } });
            if (secondary_responsible_manager_ids.length > 0) {
                await prisma.projectManager.createMany({
                    data: secondary_responsible_manager_ids.map((managerId) => ({
                        project_id: id,
                        manager_id: managerId,
                    })),
                });
            }
        }
        return toProject(updatedProject);
    }
    static async delete(id) {
        try {
            await prisma.projectManager.deleteMany({ where: { project_id: id } });
            await prisma.project.delete({ where: { project_id: id } });
            return true;
        }
        catch {
            return false;
        }
    }
    static async addProduct(project_id, data) {
        const created = await prisma.projectProduct.create({
            data: {
                project_id,
                product_id: data.product_id,
                quantity: data.quantity
            },
            include: { product: { include: { unit: true } } }
        });
        return { ...created, quantity: Number(created.quantity ?? data.quantity) };
    }
    static async removeProduct(project_product_id) {
        try {
            await prisma.projectProduct.delete({ where: { project_product_id } });
            return true;
        }
        catch {
            return false;
        }
    }
    static async addService(project_id, data) {
        const raw = Number(data.quantity);
        const units = Math.max(1, Math.round((isNaN(raw) ? 1 : raw) * 10)); // store as tenths
        await prisma.projectService.deleteMany({ where: { project_id, service_id: data.service_id } });
        await prisma.projectService.createMany({ data: Array.from({ length: units }).map(() => ({ project_id, service_id: data.service_id })) });
        const svc = await prisma.service.findUnique({ where: { service_id: data.service_id } });
        return { project_id, service_id: data.service_id, quantity: units / 10, service: svc };
    }
    static async removeService(project_service_id) {
        try {
            await prisma.projectService.delete({ where: { project_service_id } });
            return true;
        }
        catch {
            return false;
        }
    }
    static async removeServiceByServiceId(project_id, service_id) {
        try {
            await prisma.projectService.deleteMany({ where: { project_id, service_id } });
            return true;
        }
        catch {
            return false;
        }
    }
}
// Separate SubProjectService for clarity
export class SubProjectService {
    static async getAll(userRole, userId) {
        let whereClause = {};
        if (userRole !== 'admin') {
            const projects = await prisma.project.findMany({
                where: {
                    OR: [
                        { main_responsible_manager_id: userId },
                        { secondary_responsible_managers: { some: { manager_id: userId } } }
                    ]
                },
                select: { project_id: true }
            });
            const projectIds = projects.map(p => p.project_id);
            whereClause.project_id = { in: projectIds };
        }
        const subProjects = await prisma.subProject.findMany({
            where: whereClause,
            include: {
                project: { select: { project_id: true, name: true } },
                _count: {
                    select: { tasks: true, products: true, services: true }
                }
            }
        });
        return subProjects.map(sp => ({ ...sp, cost: sp.cost.toNumber() }));
    }
    static async getById(id) {
        const subProject = await prisma.subProject.findUnique({
            where: { subproject_id: id },
            include: {
                project: true,
                tasks: { include: { responsible_manager: true } },
                products: { include: { product: { include: { unit: true } } } },
                services: { include: { service: true } },
                comments: { include: { manager: true }, orderBy: { created_at: 'asc' } }
            }
        });
        if (!subProject)
            return null;
        return subProject;
    }
    static async create(data) {
        const newSubProject = await prisma.subProject.create({ data });
        return toSubProject(newSubProject);
    }
    static async update(id, data) {
        const { created_at, updated_at, ...updateData } = data;
        const updatedSubProject = await prisma.subProject.update({
            where: { subproject_id: id },
            data: updateData
        });
        return toSubProject(updatedSubProject);
    }
    static async delete(id) {
        try {
            await prisma.subProject.delete({ where: { subproject_id: id } });
            return true;
        }
        catch {
            return false;
        }
    }
}
// Dummy classes to resolve other errors in the file temporarily
export class ProductService {
    static async getAll() {
        return [];
    }
    static async update(id, data) {
        return null;
    }
}
export class SaleService {
    static async update(id, data) {
        return null;
    }
}
//# sourceMappingURL=projectService.js.map