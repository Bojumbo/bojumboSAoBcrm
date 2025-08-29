import { prisma } from '../config/database.js';
import { Project, ProjectWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';

export class ProjectService {
  static async getAll(userRole: string, userId: number): Promise<ProjectWithRelations[]> {
    let whereClause: any = {};

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.OR = [
          { main_responsible_manager_id: { in: [userId, ...subordinateIds] } },
          {
            secondary_responsible_managers: {
              some: {
                manager_id: { in: [userId, ...subordinateIds] }
              }
            }
          }
        ];
      } else {
        whereClause.OR = [
          { main_responsible_manager_id: userId },
          {
            secondary_responsible_managers: {
              some: {
                manager_id: userId
              }
            }
          }
        ];
      }
    }

    return await prisma.project.findMany({
      where: whereClause,
      include: {
        main_responsible_manager: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        secondary_responsible_managers: {
          include: {
            manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            }
          }
        },
        counterparty: true,
        funnel: true,
        funnel_stage: true,
        subprojects: true,
        tasks: {
          include: {
            responsible_manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            },
            creator_manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            }
          }
        },
        sales: {
          include: {
            counterparty: true,
            responsible_manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            }
          }
        },
        products: { // renamed from project_products
          include: {
            product: {
              include: {
                unit: true
              }
            }
          }
        },
        services: { // renamed from project_services
          include: {
            service: true
          }
        },
        comments: {
          include: {
            manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });
  }

  static async getById(id: number, userRole: string, userId: number): Promise<ProjectWithRelations | null> {
    let whereClause: any = { project_id: id };

    if (userRole !== 'admin') {
      if (userRole === 'head') {
        const subordinateIds = await AuthService.getSubordinateIds(userId);
        whereClause.OR = [
          { main_responsible_manager_id: { in: [userId, ...subordinateIds] } },
          {
            secondary_responsible_managers: {
              some: {
                manager_id: { in: [userId, ...subordinateIds] }
              }
            }
          }
        ];
      } else {
        whereClause.OR = [
          { main_responsible_manager_id: userId },
          {
            secondary_responsible_managers: {
              some: {
                manager_id: userId
              }
            }
          }
        ];
      }
    }

    const project = await prisma.project.findFirst({
      where: whereClause,
      include: {
        main_responsible_manager: {
          select: {
            manager_id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true
          }
        },
        secondary_responsible_managers: {
          include: {
            manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            }
          }
        },
        counterparty: true,
        funnel: true,
        funnel_stage: true,
        subprojects: true,
        tasks: {
          include: {
            responsible_manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            },
            creator_manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            }
          }
        },
        sales: {
          include: {
            counterparty: true,
            responsible_manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            },
            products: {
              include: {
                product: {
                  include: {
                    unit: true
                  }
                }
              }
            },
            services: {
              include: {
                service: true
              }
            }
          }
        },
        products: { // renamed from project_products
          include: {
            product: {
              include: {
                unit: true
              }
            }
          }
        },
        services: { // renamed from project_services
          include: {
            service: true
          }
        },
        comments: {
          include: {
            manager: {
              select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });

    return project;
  }

  static async create(data: Omit<Project, 'project_id' | 'created_at' | 'updated_at'>): Promise<Project> {
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

    return project;
  }

  static async update(id: number, data: Partial<Project>): Promise<Project | null> {
    const { secondary_responsible_manager_ids, ...projectData } = data;

    if (secondary_responsible_manager_ids !== undefined) {
      // Remove existing secondary managers
      await prisma.projectManager.deleteMany({
        where: { project_id: id }
      });

      // Add new secondary managers
      if (secondary_responsible_manager_ids.length > 0) {
        await prisma.projectManager.createMany({
          data: secondary_responsible_manager_ids.map((managerId: number) => ({
            project_id: id,
            manager_id: managerId
          }))
        });
      }
    }

    return await prisma.project.update({
      where: { project_id: id },
      data: projectData
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.project.delete({
        where: { project_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
