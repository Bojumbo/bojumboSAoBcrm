import { prisma } from '../config/database.js';
import { SubProject, SubProjectWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';
import { Prisma } from '@prisma/client';

// Input type for creating/updating subprojects
interface SubProjectInput {
    name: string;
    description?: string | null;
    project_id: number;
    status?: string | null;
    cost: number;
}

// Helper to convert Prisma types to application types
const toSubProjectWithRelations = (
    subProject: Prisma.SubProjectGetPayload<{
        include: {
            project: { include: { main_responsible_manager: true, counterparty: true } },
            tasks: { include: { responsible_manager: true, creator_manager: true } },
            comments: { include: { manager: true } },
            products: { include: { product: { include: { unit: true } } } },
            services: { include: { service: true } }
        }
    }>
): SubProjectWithRelations => {
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
    } as unknown as SubProjectWithRelations;
};

const toSubProject = (subProject: Prisma.SubProjectGetPayload<{}>): SubProject => {
    return {
        ...subProject,
        cost: subProject.cost.toNumber(),
    };
};


export class SubProjectService {
  static async getAll(userRole: string, userId: number): Promise<SubProjectWithRelations[]> {
    let whereClause: any = {};

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
      } else {
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

  static async getById(id: number, userRole: string, userId: number): Promise<SubProjectWithRelations | null> {
    let whereClause: any = { subproject_id: id };

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
      } else {
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

  static async create(data: SubProjectInput): Promise<SubProject> {
    const subProject = await prisma.subProject.create({
      data
    });
    return toSubProject(subProject);
  }

  static async update(id: number, data: Partial<SubProjectInput>): Promise<SubProject | null> {
    // Explicitly pick only the fields that are part of the SubProject model
    const updateData: {
        name?: string;
        description?: string | null;
        status?: string | null;
        cost?: number;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.cost !== undefined) updateData.cost = data.cost;

    const subProject = await prisma.subProject.update({
      where: { subproject_id: id },
      data: updateData
    });
    return subProject ? toSubProject(subProject) : null;
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.subProject.delete({
        where: { subproject_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
