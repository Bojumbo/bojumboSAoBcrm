import { SubProjectFunnel, SubProjectFunnelStage } from '../types/index.js';
export declare class SubProjectFunnelService {
    static getAll(): Promise<SubProjectFunnel[]>;
    static getById(id: number): Promise<SubProjectFunnel | null>;
    static create(data: Omit<SubProjectFunnel, 'sub_project_funnel_id' | 'created_at'>): Promise<SubProjectFunnel>;
    static update(id: number, data: Partial<SubProjectFunnel>): Promise<SubProjectFunnel | null>;
    static delete(id: number): Promise<boolean>;
    static getAllStages(): Promise<SubProjectFunnelStage[]>;
    static getStageById(id: number): Promise<SubProjectFunnelStage | null>;
    static createStage(data: Omit<SubProjectFunnelStage, 'sub_project_funnel_stage_id' | 'created_at'>): Promise<SubProjectFunnelStage>;
    static updateStage(id: number, data: Partial<SubProjectFunnelStage>): Promise<SubProjectFunnelStage | null>;
    static deleteStage(id: number): Promise<boolean>;
}
//# sourceMappingURL=subProjectFunnelService.d.ts.map