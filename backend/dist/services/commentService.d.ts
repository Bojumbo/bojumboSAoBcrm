import { ProjectComment, SubProjectComment, ProjectCommentWithRelations, SubProjectCommentWithRelations } from '../types/index.js';
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
export declare class CommentService {
    static getProjectComments(projectId: number): Promise<ProjectCommentWithRelations[]>;
    static getProjectCommentById(commentId: number): Promise<ProjectCommentWithRelations | null>;
    static createProjectComment(data: CreateProjectCommentInput): Promise<ProjectCommentWithRelations>;
    static updateProjectComment(commentId: number, data: Partial<CreateProjectCommentInput>): Promise<ProjectComment | null>;
    static deleteProjectComment(commentId: number): Promise<boolean>;
    static getSubProjectComments(subprojectId: number): Promise<SubProjectCommentWithRelations[]>;
    static getSubProjectCommentById(commentId: number): Promise<SubProjectCommentWithRelations | null>;
    static createSubProjectComment(data: CreateSubProjectCommentInput): Promise<SubProjectCommentWithRelations>;
    static updateSubProjectComment(commentId: number, data: Partial<CreateSubProjectCommentInput>): Promise<SubProjectComment | null>;
    static deleteSubProjectComment(commentId: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=commentService.d.ts.map