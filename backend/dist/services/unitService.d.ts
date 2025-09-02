import { Unit } from '../types/index.js';
interface UnitInput {
    name: string;
}
export declare class UnitService {
    static getAll(): Promise<Unit[]>;
    static getById(id: number): Promise<Unit | null>;
    static create(data: UnitInput): Promise<Unit>;
    static update(id: number, data: Partial<UnitInput>): Promise<Unit | null>;
    static delete(id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=unitService.d.ts.map