import { prisma } from '../config/database.js';
import { Manager } from '../types/index.js';
import bcrypt from 'bcryptjs';

interface UpdateProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export class SettingsService {
  static async getCurrentProfile(managerId: number): Promise<Manager | null> {
    try {
      const manager = await prisma.manager.findUnique({
        where: {
          manager_id: managerId
        },
        select: {
          manager_id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          role: true,
          created_at: true,
          updated_at: true,
          // Не включаємо password_hash для безпеки
        }
      });

      return manager as Manager | null;
    } catch (error) {
      console.error('Error getting current profile:', error);
      throw error;
    }
  }

  static async findUserByEmail(email: string): Promise<Manager | null> {
    try {
      const manager = await prisma.manager.findUnique({
        where: {
          email: email
        },
        select: {
          manager_id: true,
          email: true
        }
      });

      return manager as Manager | null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async updateProfile(managerId: number, data: UpdateProfileData): Promise<Manager> {
    try {
      const updatedManager = await prisma.manager.update({
        where: {
          manager_id: managerId
        },
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          updated_at: new Date()
        },
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

      return updatedManager as Manager;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async changePassword(managerId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Отримати поточний хеш паролю
      const manager = await prisma.manager.findUnique({
        where: {
          manager_id: managerId
        },
        select: {
          password_hash: true
        }
      });

      if (!manager) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Перевірити поточний пароль
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, manager.password_hash);
      
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Хешувати новий пароль
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Оновити пароль
      await prisma.manager.update({
        where: {
          manager_id: managerId
        },
        data: {
          password_hash: newPasswordHash,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}