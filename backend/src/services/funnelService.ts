import { prisma } from '../config/database.js';
import { Funnel, FunnelStage } from '../types/index.js';

export class FunnelService {
  static async getAll(): Promise<Funnel[]> {
    return await prisma.funnel.findMany({
      include: {
        stages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  static async getById(id: number): Promise<Funnel | null> {
    return await prisma.funnel.findUnique({
      where: { funnel_id: id },
      include: {
        stages: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  }

  static async create(data: Omit<Funnel, 'funnel_id' | 'created_at'>): Promise<Funnel> {
    return await prisma.funnel.create({
      data
    });
  }

  static async update(id: number, data: Partial<Funnel>): Promise<Funnel | null> {
    return await prisma.funnel.update({
      where: { funnel_id: id },
      data
    });
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.funnel.delete({
        where: { funnel_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }

  // Funnel Stages
  static async getAllStages(): Promise<FunnelStage[]> {
    return await prisma.funnelStage.findMany({
      include: {
        funnel: true
      },
      orderBy: [
        { funnel_id: 'asc' },
        { order: 'asc' }
      ]
    });
  }

  static async getStageById(id: number): Promise<FunnelStage | null> {
    return await prisma.funnelStage.findUnique({
      where: { funnel_stage_id: id },
      include: {
        funnel: true
      }
    });
  }

  static async createStage(data: Omit<FunnelStage, 'funnel_stage_id' | 'created_at'>): Promise<FunnelStage> {
    return await prisma.funnelStage.create({
      data
    });
  }

  static async updateStage(id: number, data: Partial<FunnelStage>): Promise<FunnelStage | null> {
    return await prisma.funnelStage.update({
      where: { funnel_stage_id: id },
      data
    });
  }

  static async deleteStage(id: number): Promise<boolean> {
    try {
      await prisma.funnelStage.delete({
        where: { funnel_stage_id: id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
