import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { 
  Project, 
  ProjectWithRelations, 
  SubProject, 
  SubProjectWithRelations,
  Product,
  Sale,
  ProjectManager
} from '../types/index.js';
import { AuthService } from './authService.js';

// Helper to convert Prisma Decimal to number
const toProject = (project: Prisma.ProjectGetPayload<{}>): Project => {
    return { ...project, forecast_amount: project.forecast_amount.toNumber() };
};

const toSubProject = (subProject: Prisma.SubProjectGetPayload<{}>): SubProject => {
    return { ...subProject, cost: subProject.cost.toNumber() };
};


export class ProjectService {
  static async getAll(userRole: string, userId: number): Promise<any[]> {
    let whereClause: any = {};

    if (userRole !== 'admin') {
      const projectWhere: any = {};
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        projectWhere.OR = [
          { main_responsible_manager_id: { in: [userId, ...subordinateIds] } },
          { secondary_responsible_managers: { some: { manager_id: { in: [userId, ...subordinateIds] } } } }
        ];
      } else { // 'manager' role
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

  static async getById(id: number, userRole: string, userId: number): Promise<ProjectWithRelations | null> {
    let whereClause: any = { project_id: id };

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
        sales: { include: { counterparty: true, responsible_manager: true, products: { include: { product: true }}, services: { include: { service: true }} } },
        products: { include: { product: { include: { unit: true } } } },
    services: { include: { service: true } },
        comments: { include: { manager: true }, orderBy: { created_at: 'asc' } }
      }
    });

    if (!project) return null;
    // Normalize products (ensure numeric quantity)
    const projAny: any = project;
    if (projAny?.products?.length) {
      projAny.products = projAny.products.map((pp: any) => ({
        ...pp,
        quantity: Number(pp.quantity ?? 1),
        product: pp.product ? { ...pp.product, price: Number(pp.product.price?.toNumber ? pp.product.price.toNumber() : pp.product.price) } : pp.product
      }));
    }
    // Aggregate services by service_id and compute fractional quantity in steps of 0.1
    if (projAny?.services?.length) {
      const grouped = new Map<number, any>();
      for (const ps of projAny.services as any[]) {
        const sid = ps.service_id || ps.service?.service_id;
        if (!sid) continue;
        const g = grouped.get(sid);
        if (g) {
          g._count += 1;
        } else {
          grouped.set(sid, { ...ps, _count: 1 });
        }
      }
      projAny.services = Array.from(grouped.values()).map((it: any) => ({
        ...it,
        quantity: (it._count || 1) / 10,
        service: it.service ? { ...it.service, price: Number(it.service.price?.toNumber ? it.service.price.toNumber() : it.service.price) } : it.service
      }));
    }
    return projAny as ProjectWithRelations;
  }

  static async create(data: CreateProjectRequest): Promise<Project> {
    const { secondary_responsible_manager_ids, ...projectData } = data;

    const project = await prisma.project.create({
      data: projectData
    });

    if (secondary_responsible_manager_ids && secondary_responsible_manager_ids.length > 0) {
      await prisma.projectManager.createMany({
        data: secondary_responsible_manager_ids.map((managerId: number) => ({
          project_id: project.project_id,
          manager_id: managerId
        }))
      });
    }

    return toProject(project);
  }

  static async update(id: number, data: UpdateProjectRequest): Promise<Project | null> {
    const { secondary_responsible_manager_ids, ...projectData } = data;

    const updatedProject = await prisma.project.update({
      where: { project_id: id },
      data: projectData,
    });

    if (secondary_responsible_manager_ids !== undefined) {
      await prisma.projectManager.deleteMany({ where: { project_id: id } });
      if (secondary_responsible_manager_ids.length > 0) {
        await prisma.projectManager.createMany({
          data: secondary_responsible_manager_ids.map((managerId: number) => ({
            project_id: id,
            manager_id: managerId,
          })),
        });
      }
    }

    return toProject(updatedProject);
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.projectManager.deleteMany({ where: { project_id: id }});
      await prisma.project.delete({ where: { project_id: id } });
      return true;
    } catch {
      return false;
    }
  }

  static async addProduct(project_id: number, data: { product_id: number; quantity: number }) {
    const created = await prisma.projectProduct.create({
      data: {
        project_id,
        product_id: data.product_id,
        quantity: data.quantity
      },
      include: { product: { include: { unit: true } } }
    });
    return { ...created, quantity: Number((created as any).quantity ?? data.quantity) } as any;
  }

  static async removeProduct(project_product_id: number): Promise<boolean> {
    try {
      await prisma.projectProduct.delete({ where: { project_product_id } });
      return true;
    } catch {
      return false;
    }
  }

  static async addService(project_id: number, data: { service_id: number; quantity?: number }) {
    const raw = Number(data.quantity);
    const units = Math.max(1, Math.round((isNaN(raw) ? 1 : raw) * 10)); // store as tenths
    await prisma.projectService.deleteMany({ where: { project_id, service_id: data.service_id } });
    await prisma.projectService.createMany({ data: Array.from({ length: units }).map(() => ({ project_id, service_id: data.service_id })) });
    const svc = await prisma.service.findUnique({ where: { service_id: data.service_id } });
    return { project_id, service_id: data.service_id, quantity: units / 10, service: svc } as any;
  }

  static async removeService(project_service_id: number): Promise<boolean> {
    try {
      await prisma.projectService.delete({ where: { project_service_id } });
      return true;
    } catch {
      return false;
    }
  }

  static async removeServiceByServiceId(project_id: number, service_id: number): Promise<boolean> {
    try {
      await prisma.projectService.deleteMany({ where: { project_id, service_id } });
      return true;
    } catch {
      return false;
    }
  }
}

// Separate SubProjectService for clarity
export class SubProjectService {
    static async getAll(userRole: string, userId: number): Promise<any[]> {
        let whereClause: any = {};
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
        return subProjects.map(sp => ({...sp, cost: sp.cost.toNumber()}));
    }

    static async getById(id: number): Promise<SubProjectWithRelations | null> {
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

        if (!subProject) return null;

        return subProject as unknown as SubProjectWithRelations;
    }

    static async create(data: Omit<SubProject, 'subproject_id' | 'created_at' | 'updated_at' | 'cost'> & {cost: number}): Promise<SubProject> {
        const newSubProject = await prisma.subProject.create({ data });
        return toSubProject(newSubProject);
    }

    static async update(id: number, data: Partial<Omit<SubProject, 'subproject_id' | 'project_id'>>): Promise<SubProject | null> {
        const { created_at, updated_at, ...updateData } = data as any;

        const updatedSubProject = await prisma.subProject.update({
            where: { subproject_id: id },
            data: updateData
        });

        return toSubProject(updatedSubProject);
    }

    static async delete(id: number): Promise<boolean> {
        try {
            await prisma.subProject.delete({ where: { subproject_id: id } });
            return true;
        } catch {
            return false;
        }
    }
}


// Dummy classes to resolve other errors in the file temporarily
export class ProductService {
  static async getAll(): Promise<Product[]> {
    return [];
  }
  static async update(id: number, data: Partial<Product>): Promise<Product | null> {
    return null;
  }
}

export class SaleService {
  static async update(id: number, data: Partial<Sale>): Promise<Sale | null> {
    return null;
  }
}

// Added missing request types used in this file
interface CreateProjectRequest {
  name: string;
  description?: string | null;
  main_responsible_manager_id?: number | null;
  counterparty_id?: number | null;
  funnel_id?: number | null;
  funnel_stage_id?: number | null;
  forecast_amount: number;
  secondary_responsible_manager_ids?: number[];
}

interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}
