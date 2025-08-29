import { prisma } from '../config/database.js';

export class SubProjectStatusTypeService {
  static async getAll() {
    return prisma.subProjectStatusType.findMany({ orderBy: { created_at: 'asc' } });
  }

  static async getById(id: number) {
    return prisma.subProjectStatusType.findUnique({ where: { sub_project_status_id: id } });
  }

  static async create(data: { name: string }) {
    return prisma.subProjectStatusType.create({ data });
  }

  static async update(id: number, data: Partial<{ name: string }>) {
    return prisma.subProjectStatusType.update({ where: { sub_project_status_id: id }, data });
  }

  static async delete(id: number) {
    try {
      await prisma.subProjectStatusType.delete({ where: { sub_project_status_id: id } });
      return true;
    } catch {
      return false;
    }
  }
}


