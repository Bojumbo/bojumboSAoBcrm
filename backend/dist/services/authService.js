import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { config } from '../config/env.js';
export class AuthService {
    static async login(credentials) {
        const { email, password } = credentials;
        const manager = await prisma.manager.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (!manager) {
            return null;
        }
        const isValidPassword = await bcrypt.compare(password, manager.password_hash);
        if (!isValidPassword) {
            return null;
        }
        if (!config.jwt.secret) {
            throw new Error('JWT secret is not configured');
        }
        const payload = {
            manager_id: manager.manager_id,
            email: manager.email,
            role: manager.role
        };
        // Use any type to bypass JWT typing issues temporarily
        const token = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn
        });
        const { password_hash, ...userWithoutPassword } = manager;
        return {
            user: userWithoutPassword,
            token
        };
    }
    static async getCurrentUser(managerId) {
        const manager = await prisma.manager.findUnique({
            where: { manager_id: managerId },
            select: {
                manager_id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
                role: true,
                created_at: true,
                updated_at: true
            }
        });
        return manager;
    }
    static async getSubordinateIds(managerId) {
        const subordinates = await prisma.manager.findMany({
            where: {
                supervisors: {
                    some: {
                        manager_id: managerId
                    }
                }
            },
            select: {
                manager_id: true
            }
        });
        return subordinates.map((s) => s.manager_id);
    }
}
//# sourceMappingURL=authService.js.map