import { Request, Response } from 'express';
export declare class ProjectController {
    static getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static addProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static addService(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeService(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static removeServiceByServiceId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=projectController.d.ts.map