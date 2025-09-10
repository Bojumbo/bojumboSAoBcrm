import { Counterparty, CounterpartyWithRelations, CounterpartyTypeEnum } from '../types/index.js';
interface CounterpartyInput {
    name: string;
    counterparty_type: CounterpartyTypeEnum;
    responsible_manager_id?: number | null;
    phone?: string | null;
    email?: string | null;
}
export declare class CounterpartyService {
    static getAll(userRole: string, userId: number): Promise<CounterpartyWithRelations[]>;
    static getById(id: number, userRole: string, userId: number): Promise<CounterpartyWithRelations | null>;
    static create(data: CounterpartyInput): Promise<Counterparty>;
    static update(id: number, data: Partial<CounterpartyInput>): Promise<Counterparty | null>;
    static delete(id: number): Promise<boolean>;
}
export {};
//# sourceMappingURL=counterpartyService.d.ts.map