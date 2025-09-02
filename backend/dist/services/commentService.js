import { prisma } from '../config/database.js';
export class CommentService {
    // Project Comments
    static async getProjectComments(projectId) {
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
    static async getProjectCommentById(commentId) {
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
    static async createProjectComment(data) {
        return await prisma.projectComment.create({
            data
        });
    }
    static async updateProjectComment(commentId, data) {
        return await prisma.projectComment.update({
            where: { comment_id: commentId },
            data
        });
    }
    static async deleteProjectComment(commentId) {
        try {
            await prisma.projectComment.delete({
                where: { comment_id: commentId }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    // SubProject Comments
    static async getSubProjectComments(subprojectId) {
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
    static async getSubProjectCommentById(commentId) {
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
    static async createSubProjectComment(data) {
        return await prisma.subProjectComment.create({
            data
        });
    }
    static async updateSubProjectComment(commentId, data) {
        return await prisma.subProjectComment.update({
            where: { comment_id: commentId },
            data
        });
    }
    static async deleteSubProjectComment(commentId) {
        try {
            await prisma.subProjectComment.delete({
                where: { comment_id: commentId }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=commentService.js.map