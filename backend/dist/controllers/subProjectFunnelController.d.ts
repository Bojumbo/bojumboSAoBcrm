import { Request, Response } from 'express';
export declare class SubProjectFunnelController {
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static create(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAllStages(req: Request, res: Response): Promise<void>;
    static getStageById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createStage(req: Request, res: Response): Promise<void>;
    static updateStage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteStage(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=subProjectFunnelController.d.ts.map