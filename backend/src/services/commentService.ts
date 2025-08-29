import { prisma } from '../config/database.js';
import { ProjectComment, SubProjectComment, ProjectCommentWithRelations, SubProjectCommentWithRelations } from '../types/index.js';

export class CommentService {
  // Project Comments
  static async getProjectComments(projectId: number): Promise<ProjectCommentWithRelations[]> {
    return await prisma.projectComment.findMany({
      where: { project_id: projectId },
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
    });
  }

  static async getProjectCommentById(commentId: number): Promise<ProjectCommentWithRelations | null> {
    return await prisma.projectComment.findUnique({
      where: { comment_id: commentId },
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
    });
  }

  static async createProjectComment(data: Omit<ProjectComment, 'comment_id' | 'created_at'>): Promise<ProjectComment> {
    return await prisma.projectComment.create({
      data
    });
  }

  static async updateProjectComment(commentId: number, data: Partial<ProjectComment>): Promise<ProjectComment | null> {
    return await prisma.projectComment.update({
      where: { comment_id: commentId },
      data
    });
  }

  static async deleteProjectComment(commentId: number): Promise<boolean> {
    try {
      await prisma.projectComment.delete({
        where: { comment_id: commentId }
      });
      return true;
    } catch {
      return false;
    }
  }

  // SubProject Comments
  static async getSubProjectComments(subprojectId: number): Promise<SubProjectCommentWithRelations[]> {
    return await prisma.subProjectComment.findMany({
      where: { subproject_id: subprojectId },
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
    });
  }

  static async getSubProjectCommentById(commentId: number): Promise<SubProjectCommentWithRelations | null> {
    return await prisma.subProjectComment.findUnique({
      where: { comment_id: commentId },
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
    });
  }

  static async createSubProjectComment(data: Omit<SubProjectComment, 'comment_id' | 'created_at'>): Promise<SubProjectComment> {
    return await prisma.subProjectComment.create({
      data
    });
  }

  static async updateSubProjectComment(commentId: number, data: Partial<SubProjectComment>): Promise<SubProjectComment | null> {
    return await prisma.subProjectComment.update({
      where: { comment_id: commentId },
      data
    });
  }

  static async deleteSubProjectComment(commentId: number): Promise<boolean> {
    try {
      await prisma.subProjectComment.delete({
        where: { comment_id: commentId }
      });
      return true;
    } catch {
      return false;
    }
  }
}
