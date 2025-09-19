import { prisma } from '../config/database.js';
import { SubProject, SubProjectWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';
import { Prisma } from '@prisma/client';

// Input type for creating/updating subprojects
interface SubProjectInput {
    name?: string;
    description?: string | null;
    project_id?: number;
    status?: string | null;
    cost?: number;
    sub_project_funnel_id?: number | null;
    sub_project_funnel_stage_id?: number | null;
}

// Helper to convert Prisma types to application types
const toSubProjectWithRelations = (
    subProject: any
): SubProjectWithRelations => {
    return {
        ...subProject,
        cost: subProject.cost.toNumber(),
        project: subProject.project ? {
            ...subProject.project,
            forecast_amount: subProject.project.forecast_amount.toNumber(),
        } : null,
        products: subProject.products?.map((p: any) => ({
            ...p,
            product: {
                ...p.product,
                price: p.product.price.toNumber(),
            }
        })) || [],
        services: subProject.services?.map((s: any) => ({
            ...s,
            quantity: Number(s.quantity || 1),
            service: {
                ...s.service,
                price: s.service.price.toNumber(),
            }
        })) || [],
        sales: subProject.sales?.map((sale: any) => ({
            ...sale,
            products: sale.products?.map((sp: any) => ({
                ...sp,
                product: {
                    ...sp.product,
                    price: Number(sp.product?.price || 0),
                }
            })) || [],
            services: sale.services?.map((ss: any) => ({
                ...ss,
                service: {
                    ...ss.service,
                    price: Number(ss.service?.price || 0),
                }
            })) || [],
        })) || [],
    } as unknown as SubProjectWithRelations;
};

const toSubProject = (subProject: Prisma.SubProjectGetPayload<{}>): SubProject => {
    return {
        ...subProject,
        cost: subProject.cost.toNumber(),
    };
};


export class SubProjectService {
  static async getAll(userRole: string, userId: number, projectId?: number): Promise<SubProjectWithRelations[]> {
    let whereClause: any = {};

    // Додаємо фільтр по проекту, якщо передано projectId
    if (projectId) {
      whereClause.project_id = projectId;
    }

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.project = {
          ...whereClause.project,
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
          ...whereClause.project,
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

    const subProjects = await (prisma.subProject.findMany as any)({
      where: whereClause,
      include: {
        project: {
          include: {
            main_responsible_manager: true,
            counterparty: true
          }
        },
        funnel: {
          include: {
            stages: {
              orderBy: { order: 'asc' }
            }
          }
        },
        funnel_stage: true,
        tasks: { include: { responsible_manager: true, creator_manager: true } },
        comments: { include: { manager: true }, orderBy: { created_at: 'asc' } },
        products: { include: { product: { include: { unit: true } } } },
        services: { include: { service: true } },
        sales: { 
          include: { 
            counterparty: true,
            responsible_manager: true,
            products: { include: { product: true } },
            services: { include: { service: true } }
          },
          orderBy: { created_at: 'desc' }
        }
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

    const subProject = await (prisma.subProject.findFirst as any)({
      where: whereClause,
      include: {
        project: {
          include: {
            main_responsible_manager: true,
            counterparty: true
          }
        },
        funnel: {
          include: {
            stages: {
              orderBy: { order: 'asc' }
            }
          }
        },
        funnel_stage: true,
        tasks: { include: { responsible_manager: true, creator_manager: true } },
        comments: { include: { manager: true }, orderBy: { created_at: 'asc' } },
        products: { include: { product: { include: { unit: true } } } },
        services: { include: { service: true } },
        sales: { 
          include: { 
            counterparty: true,
            responsible_manager: true,
            products: { include: { product: true } },
            services: { include: { service: true } }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });
    
    console.log('SubProject found:', !!subProject);
    if (subProject) {
      console.log('Sales found in subproject:', subProject.sales?.length || 0);
      if (subProject.sales?.length > 0) {
        console.log('First sale products:', subProject.sales[0].products?.length || 0);
        console.log('First sale services:', subProject.sales[0].services?.length || 0);
        if (subProject.sales[0].products?.length > 0) {
          const firstProduct = subProject.sales[0].products[0];
          console.log('First product in sale (before processing):', {
            product_id: firstProduct.product_id,
            quantity: firstProduct.quantity,
            product_price: firstProduct.product?.price?.toString(),
            product_name: firstProduct.product?.name
          });
        }
      }
    }
    
    const result = subProject ? toSubProjectWithRelations(subProject) : null;
    
    // Log processed result
    if (result?.sales && result.sales.length > 0 && result.sales[0].products && result.sales[0].products.length > 0) {
      const firstProduct = result.sales[0].products[0];
      console.log('First product after processing:', {
        product_id: firstProduct.product_id,
        quantity: firstProduct.quantity,
        product_price: (firstProduct as any).product?.price,
        product_price_type: typeof (firstProduct as any).product?.price,
      });
    }
    
    return result;
  }

  static async create(data: any): Promise<SubProject> {
    // Валідація: має бути або project_id, або parent_subproject_id
    if (!data.project_id && !data.parent_subproject_id) {
      throw new Error('Subproject must be attached to either project or another subproject');
    }
    if (data.project_id && data.parent_subproject_id) {
      throw new Error('Subproject cannot be attached to both project and subproject');
    }
    const createData: any = {
      name: data.name,
      cost: data.cost,
      project_id: data.project_id ?? null,
      parent_subproject_id: data.parent_subproject_id ?? null
    };
    if (data.description !== undefined) createData.description = data.description;
    if (data.status !== undefined) createData.status = data.status;
    if (data.sub_project_funnel_id !== undefined) createData.sub_project_funnel_id = data.sub_project_funnel_id;
    if (data.sub_project_funnel_stage_id !== undefined) createData.sub_project_funnel_stage_id = data.sub_project_funnel_stage_id;

    const subProject = await prisma.subProject.create({
      data: createData
    });

    // Додаємо додаткових менеджерів, якщо передано
    if (Array.isArray(data.secondary_responsible_managers) && data.secondary_responsible_managers.length > 0) {
      await Promise.all(
        data.secondary_responsible_managers.map((managerId: number) =>
          prisma.subProjectManager.create({
            data: {
              subproject_id: subProject.subproject_id,
              manager_id: managerId
            }
          })
        )
      );
    }

    return toSubProject(subProject);
  }

  static async update(id: number, data: any): Promise<SubProject | null> {
    // Валідація: має бути або project_id, або parent_subproject_id
    if (!data.project_id && !data.parent_subproject_id) {
      throw new Error('Subproject must be attached to either project or another subproject');
    }
    if (data.project_id && data.parent_subproject_id) {
      throw new Error('Subproject cannot be attached to both project and subproject');
    }
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.project_id !== undefined) updateData.project_id = data.project_id;
    if (data.parent_subproject_id !== undefined) updateData.parent_subproject_id = data.parent_subproject_id;
    // Handle both old and new field names for backward compatibility
    if (data.sub_project_funnel_id !== undefined) updateData.sub_project_funnel_id = data.sub_project_funnel_id;
    else if (data.funnel_id !== undefined) updateData.sub_project_funnel_id = data.funnel_id;
    if (data.sub_project_funnel_stage_id !== undefined) updateData.sub_project_funnel_stage_id = data.sub_project_funnel_stage_id;
    else if (data.funnel_stage_id !== undefined) updateData.sub_project_funnel_stage_id = data.funnel_stage_id;

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

  static async addProduct(subprojectId: number, productId: number, quantity: number = 1): Promise<any> {
    // Check if product is already added to avoid duplicates
    const existing = await prisma.subProjectProduct.findFirst({
      where: {
        subproject_id: subprojectId,
        product_id: productId
      }
    });

    if (existing) {
      // If exists, update quantity
      return await prisma.subProjectProduct.update({
        where: { subproject_product_id: existing.subproject_product_id },
        data: { quantity },
        include: { product: true }
      });
    } else {
      // If not exists, create new
      return await prisma.subProjectProduct.create({
        data: {
          subproject_id: subprojectId,
          product_id: productId,
          quantity
        },
        include: { product: true }
      });
    }
  }

  static async removeProduct(subprojectId: number, productId: number): Promise<boolean> {
    try {
      await prisma.subProjectProduct.deleteMany({
        where: {
          subproject_id: subprojectId,
          product_id: productId
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  static async addService(subprojectId: number, serviceId: number, quantity: number = 1.0): Promise<any> {
    // Check if service is already added to avoid duplicates
    const existing = await prisma.subProjectService.findFirst({
      where: {
        subproject_id: subprojectId,
        service_id: serviceId
      }
    });

    if (existing) {
      // If exists, update quantity
      return await prisma.subProjectService.update({
        where: { subproject_service_id: existing.subproject_service_id },
        data: { quantity: quantity } as any, // Temporary type assertion
        include: { service: true }
      });
    } else {
      // If not exists, create new
      return await prisma.subProjectService.create({
        data: {
          subproject_id: subprojectId,
          service_id: serviceId,
          quantity: quantity
        } as any, // Temporary type assertion
        include: { service: true }
      });
    }
  }

  static async removeService(subprojectId: number, serviceId: number): Promise<boolean> {
    try {
      await prisma.subProjectService.deleteMany({
        where: {
          subproject_id: subprojectId,
          service_id: serviceId
        }
      });
      return true;
    } catch {
      return false;
    }
  }
}
