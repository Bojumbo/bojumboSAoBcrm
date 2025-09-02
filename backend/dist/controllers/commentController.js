import { CommentService } from '../services/commentService.js';
export class CommentController {
    // Project Comments
    static async getProjectComments(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const projectId = parseInt(req.params.projectId);
            if (isNaN(projectId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid project ID'
                });
            }
            const comments = await CommentService.getProjectComments(projectId);
            res.json({
                success: true,
                data: comments
            });
        }
        catch (error) {
            console.error('Get project comments error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getProjectCommentById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid comment ID'
                });
            }
            const comment = await CommentService.getProjectCommentById(commentId);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    error: 'Comment not found'
                });
            }
            res.json({
                success: true,
                data: comment
            });
        }
        catch (error) {
            console.error('Get project comment by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async createProjectComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const projectId = parseInt(req.params.projectId);
            if (isNaN(projectId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid project ID'
                });
            }
            const body = req.body;
            if (!body || (!body.content && !body.file)) {
                return res.status(400).json({ success: false, error: 'Content or file required' });
            }
            // Resolve manager from token's email to avoid stale IDs after reseed
            const { prisma } = await import('../config/database.js');
            const authEmail = String(req.user.email || '').toLowerCase();
            const managerRecord = await prisma.manager.findUnique({ where: { email: authEmail }, select: { manager_id: true } });
            if (!managerRecord) {
                return res.status(404).json({ success: false, error: 'Manager not found' });
            }
            const managerId = managerRecord.manager_id;
            // Validate project exists to avoid FK error
            const projectExists = await prisma.project.findUnique({ where: { project_id: projectId }, select: { project_id: true } });
            if (!projectExists) {
                return res.status(404).json({ success: false, error: 'Project not found' });
            }
            const data = {
                project_id: projectId,
                manager_id: managerId,
                content: body.content || ''
            };
            if (body.file) {
                data.file_name = body.file.name;
                data.file_type = body.file.type;
                data.file_url = body.file.url;
            }
            const comment = await CommentService.createProjectComment(data);
            res.status(201).json({
                success: true,
                data: comment
            });
        }
        catch (error) {
            console.error('Create project comment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async updateProjectComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid comment ID'
                });
            }
            const commentData = req.body;
            const comment = await CommentService.updateProjectComment(commentId, commentData);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    error: 'Comment not found'
                });
            }
            res.json({
                success: true,
                data: comment
            });
        }
        catch (error) {
            console.error('Update project comment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async deleteProjectComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid comment ID'
                });
            }
            const success = await CommentService.deleteProjectComment(commentId);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Comment not found'
                });
            }
            res.json({
                success: true,
                message: 'Comment deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete project comment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    // SubProject Comments
    static async getSubProjectComments(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const subprojectId = parseInt(req.params.subprojectId);
            if (isNaN(subprojectId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid subproject ID'
                });
            }
            const comments = await CommentService.getSubProjectComments(subprojectId);
            res.json({
                success: true,
                data: comments
            });
        }
        catch (error) {
            console.error('Get subproject comments error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getSubProjectCommentById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid comment ID'
                });
            }
            const comment = await CommentService.getSubProjectCommentById(commentId);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    error: 'Comment not found'
                });
            }
            res.json({
                success: true,
                data: comment
            });
        }
        catch (error) {
            console.error('Get subproject comment by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async createSubProjectComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const commentData = req.body;
            const comment = await CommentService.createSubProjectComment(commentData);
            res.status(201).json({
                success: true,
                data: comment
            });
        }
        catch (error) {
            console.error('Create subproject comment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async updateSubProjectComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid comment ID'
                });
            }
            const commentData = req.body;
            const comment = await CommentService.updateSubProjectComment(commentId, commentData);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    error: 'Comment not found'
                });
            }
            res.json({
                success: true,
                data: comment
            });
        }
        catch (error) {
            console.error('Update subproject comment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async deleteSubProjectComment(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid comment ID'
                });
            }
            const success = await CommentService.deleteSubProjectComment(commentId);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Comment not found'
                });
            }
            res.json({
                success: true,
                message: 'Comment deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete subproject comment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
//# sourceMappingURL=commentController.js.map