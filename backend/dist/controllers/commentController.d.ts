import { Request, Response } from 'express';
export declare class CommentController {
    static deleteComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getProjectComments(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getProjectCommentById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createProjectComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateProjectComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteProjectComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSubProjectComments(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getSubProjectCommentById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createSubProjectComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateSubProjectComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteSubProjectComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=commentController.d.ts.map