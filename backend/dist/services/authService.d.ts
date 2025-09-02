import { LoginRequest, LoginResponse } from '../types/index.js';
export declare class AuthService {
    static login(credentials: LoginRequest): Promise<LoginResponse | null>;
    static getCurrentUser(managerId: number): Promise<{
        manager_id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        role: import(".prisma/client").$Enums.ManagerRole;
        created_at: Date;
        updated_at: Date;
    } | null>;
    static getSubordinateIds(managerId: number): Promise<number[]>;
}
//# sourceMappingURL=authService.d.ts.map