import { Request, Response } from 'express';
import { CommentService } from '../services/commentService.js';

export class CommentController {
  // General comment operations
  static async deleteComment(req: Request, res: Response) {
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

      // Since we're using the generic delete endpoint, we need to determine
      // which type of comment this is. We'll check both types and see which one exists.
      let comment = null;
      let isProjectComment = false;

      // First try to find as a project comment
      try {
        const projectComment = await CommentService.getProjectCommentById(commentId);
        if (projectComment) {
          comment = projectComment;
          isProjectComment = true;
        }
      } catch (e) {
        // Continue to check subproject comments
      }

      // If not found as project comment, try subproject comment
      if (!comment) {
        try {
          const subProjectComment = await CommentService.getSubProjectCommentById(commentId);
          if (subProjectComment) {
            comment = subProjectComment;
            isProjectComment = false;
          }
        } catch (e) {
          // Comment not found in either table
        }
      }
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }

      // Check if user owns the comment
      if (!comment.manager || comment.manager.manager_id !== req.user.manager_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own comments'
        });
      }

      // Delete the appropriate comment type
      let success = false;
      if (isProjectComment) {
        success = await CommentService.deleteProjectComment(commentId);
      } else {
        success = await CommentService.deleteSubProjectComment(commentId);
      }

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Failed to delete comment'
        });
      }

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Project Comments
  static async getProjectComments(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Get project comments error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProjectCommentById(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Get project comment by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createProjectComment(req: Request, res: Response) {
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

      const body = req.body as any;
      if (!body || (!body.content && !body.file)) {
        return res.status(400).json({ success: false, error: 'Content or file required' });
      }

      // Resolve manager from token's email to avoid stale IDs after reseed
      const { prisma } = await import('../config/database.js');
      const authEmail = String(req.user.email || '').toLowerCase();
      console.log('Creating comment - Auth email:', authEmail);
      const managerRecord = await prisma.manager.findUnique({ where: { email: authEmail }, select: { manager_id: true } });
      console.log('Manager record found:', managerRecord);
      if (!managerRecord) {
        return res.status(404).json({ success: false, error: 'Manager not found' });
      }
      const managerId = managerRecord.manager_id;
      console.log('Using manager ID:', managerId);

      // Validate project exists to avoid FK error
      const projectExists = await prisma.project.findUnique({ where: { project_id: projectId }, select: { project_id: true } });
      if (!projectExists) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const data: any = {
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
      console.log('Created comment:', JSON.stringify(comment, null, 2));

      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('Create project comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateProjectComment(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Update project comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteProjectComment(req: Request, res: Response) {
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

      // First get the comment to check ownership
      const comment = await CommentService.getProjectCommentById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }

      // Check if user owns the comment
      if (!comment.manager || comment.manager.manager_id !== req.user.manager_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own comments'
        });
      }

      const success = await CommentService.deleteProjectComment(commentId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Failed to delete comment'
        });
      }

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete project comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // SubProject Comments
  static async getSubProjectComments(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Get subproject comments error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getSubProjectCommentById(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Get subproject comment by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async createSubProjectComment(req: Request, res: Response) {
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

      const commentData = {
        content: req.body.content,
        subproject_id: subprojectId,
        manager_id: req.user.manager_id,
        ...(req.body.file && {
          file_name: req.body.file.name,
          file_url: req.body.file.url,
          file_type: req.body.file.type
        })
      };
      
      const comment = await CommentService.createSubProjectComment(commentData);

      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('Create subproject comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateSubProjectComment(req: Request, res: Response) {
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
    } catch (error) {
      console.error('Update subproject comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async deleteSubProjectComment(req: Request, res: Response) {
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

      // First get the comment to check ownership
      const comment = await CommentService.getSubProjectCommentById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }

      // Check if user owns the comment
      if (!comment.manager || comment.manager.manager_id !== req.user.manager_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own comments'
        });
      }

      const success = await CommentService.deleteSubProjectComment(commentId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Failed to delete comment'
        });
      }

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete subproject comment error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
