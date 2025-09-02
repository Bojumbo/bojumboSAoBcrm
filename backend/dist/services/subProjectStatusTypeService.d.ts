export declare class SubProjectStatusTypeService {
    static getAll(): Promise<{
        name: string;
        created_at: Date;
        sub_project_status_id: number;
    }[]>;
    static getById(id: number): Promise<{
        name: string;
        created_at: Date;
        sub_project_status_id: number;
    } | null>;
    static create(data: {
        name: string;
    }): Promise<{
        name: string;
        created_at: Date;
        sub_project_status_id: number;
    }>;
    static update(id: number, data: Partial<{
        name: string;
    }>): Promise<{
        name: string;
        created_at: Date;
        sub_project_status_id: number;
    }>;
    static delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=subProjectStatusTypeService.d.ts.map