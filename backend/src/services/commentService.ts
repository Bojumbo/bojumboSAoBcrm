import { prisma } from '../config/database.js';
import { ProjectComment, SubProjectComment, ProjectCommentWithRelations, SubProjectCommentWithRelations } from '../types/index.js';

// Define specific input types for creating comments to ensure type safety.
interface CreateProjectCommentInput {
  project_id: number;
  manager_id: number;
  content: string;
  file_name?: string | null;
  file_type?: string | null;
  file_url?: string | null;
}

interface CreateSubProjectCommentInput {
  subproject_id: number;
  manager_id: number;
  content: string;
  file_name?: string | null;
  file_type?: string | null;
  file_url?: string | null;
}

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
    }) as unknown as ProjectCommentWithRelations[];
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
    }) as unknown as ProjectCommentWithRelations;
  }

  static async createProjectComment(data: CreateProjectCommentInput): Promise<ProjectCommentWithRelations> {
    return await prisma.projectComment.create({
      data,
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
    }) as unknown as ProjectCommentWithRelations;
  }

  static async updateProjectComment(commentId: number, data: Partial<CreateProjectCommentInput>): Promise<ProjectComment | null> {
    return await prisma.projectComment.update({
      where: { comment_id: commentId },
      data
    });
  }

  static async deleteProjectComment(commentId: number): Promise<boolean> {
    try {
      await prisma.projectComment.update({
        where: { comment_id: commentId },
        data: { is_deleted: true }
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
    }) as unknown as SubProjectCommentWithRelations[];
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
    }) as unknown as SubProjectCommentWithRelations;
  }

  static async createSubProjectComment(data: CreateSubProjectCommentInput): Promise<SubProjectCommentWithRelations> {
    return await prisma.subProjectComment.create({
      data,
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
    }) as unknown as SubProjectCommentWithRelations;
  }

  static async updateSubProjectComment(commentId: number, data: Partial<CreateSubProjectCommentInput>): Promise<SubProjectComment | null> {
    return await prisma.subProjectComment.update({
      where: { comment_id: commentId },
      data
    });
  }

  static async deleteSubProjectComment(commentId: number): Promise<boolean> {
    try {
      await prisma.subProjectComment.update({
        where: { comment_id: commentId },
        data: { is_deleted: true }
      });
      return true;
    } catch {
      return false;
    }
  }
}
