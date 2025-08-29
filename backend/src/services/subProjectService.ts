import { prisma } from '../config/database.js';
import { SubProject, SubProjectWithRelations } from '../types/index.js';
import { AuthService } from './authService.js';

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

    return await prisma.subProject.findMany({
      where: whereClause,
      include: {
        project: {
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
            counterparty: true
          }
        },
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
    });
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

    return await prisma.subProject.findFirst({
      where: whereClause,
      include: {
        project: {
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
            counterparty: true
          }
        },
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
    });
  }

  static async create(data: Omit<SubProject, 'subproject_id' | 'created_at' | 'updated_at'>): Promise<SubProject> {
    return await prisma.subProject.create({
      data
    });
  }

  static async update(id: number, data: Partial<SubProject>): Promise<SubProject | null> {
    return await prisma.subProject.update({
      where: { subproject_id: id },
      data
    });
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
