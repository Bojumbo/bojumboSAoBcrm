import { Funnel, FunnelStage } from '../types/index.js';
export declare class FunnelService {
    static getAll(): Promise<Funnel[]>;
    static getById(id: number): Promise<Funnel | null>;
    static create(data: Omit<Funnel, 'funnel_id' | 'created_at'>): Promise<Funnel>;
    static update(id: number, data: Partial<Funnel>): Promise<Funnel | null>;
    static delete(id: number): Promise<boolean>;
    static getAllStages(): Promise<FunnelStage[]>;
    static getStageById(id: number): Promise<FunnelStage | null>;
    static createStage(data: Omit<FunnelStage, 'funnel_stage_id' | 'created_at'>): Promise<FunnelStage>;
    static updateStage(id: number, data: Partial<FunnelStage>): Promise<FunnelStage | null>;
    static deleteStage(id: number): Promise<boolean>;
}
//# sourceMappingURL=funnelService.d.ts.map