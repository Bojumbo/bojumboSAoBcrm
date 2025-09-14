import { prisma } from '../config/database.js';
import { SubProjectFunnel, SubProjectFunnelStage } from '../types/index.js';

export class SubProjectFunnelService {
  static async getAll(): Promise<SubProjectFunnel[]> {
    return await prisma.subProjectFunnel.findMany({
      include: {
        stages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  static async getById(id: number): Promise<SubProjectFunnel | null> {
    return await prisma.subProjectFunnel.findUnique({
      where: { sub_project_funnel_id: id },
      include: {
        stages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  static async create(data: Omit<SubProjectFunnel, 'sub_project_funnel_id' | 'created_at'>): Promise<SubProjectFunnel> {
    return await prisma.subProjectFunnel.create({
      data
    });
  }

  static async update(id: number, data: Partial<SubProjectFunnel>): Promise<SubProjectFunnel | null> {
    return await prisma.subProjectFunnel.update({
      where: { sub_project_funnel_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.subProjectFunnel.delete({
        where: { sub_project_funnel_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }

  // Funnel Stages
  static async getAllStages(): Promise<SubProjectFunnelStage[]> {
    return await prisma.subProjectFunnelStage.findMany({
      include: {
        funnel: true
      },
      orderBy: [
        { sub_project_funnel_id: 'asc' },
        { order: 'asc' }
      ]
    });
  }

  static async getStageById(id: number): Promise<SubProjectFunnelStage | null> {
    return await prisma.subProjectFunnelStage.findUnique({
      where: { sub_project_funnel_stage_id: id },
      include: {
        funnel: true
      }
    });
  }

  static async createStage(data: Omit<SubProjectFunnelStage, 'sub_project_funnel_stage_id' | 'created_at'>): Promise<SubProjectFunnelStage> {
    return await prisma.subProjectFunnelStage.create({
      data
    });
  }

  static async updateStage(id: number, data: Partial<SubProjectFunnelStage>): Promise<SubProjectFunnelStage | null> {
    return await prisma.subProjectFunnelStage.update({
      where: { sub_project_funnel_stage_id: id },
      data
    });
  }

  static async deleteStage(id: number): Promise<boolean> {
    try {
      await prisma.subProjectFunnelStage.delete({
        where: { sub_project_funnel_stage_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }

  static async reorderStages(funnelId: number, stageOrders: { stage_id: number; order: number }[]): Promise<SubProjectFunnelStage[]> {
    // Оновлюємо порядок кожного етапу
    await Promise.all(
      stageOrders.map(({ stage_id, order }) =>
        prisma.subProjectFunnelStage.update({
          where: { sub_project_funnel_stage_id: stage_id },
          data: { order }
        })
      )
    );

    // Повертаємо оновлені етапи
    return await prisma.subProjectFunnelStage.findMany({
      where: { sub_project_funnel_id: funnelId },
      orderBy: { order: 'asc' },
      include: {
        funnel: true
      }
    });
  }
}
