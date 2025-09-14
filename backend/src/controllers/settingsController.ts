import { Request, Response } from 'express';
import { SettingsService } from '../services/settingsService.js';

export class SettingsController {
  static async getCurrentProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.manager_id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const profile = await SettingsService.getCurrentProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get current profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.manager_id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { first_name, last_name, email, phone_number } = req.body;

      if (!first_name || !last_name || !email) {
        return res.status(400).json({
          success: false,
          error: 'First name, last name, and email are required'
        });
      }

      // Перевірити чи email не зайнятий іншим користувачем
      const existingUser = await SettingsService.findUserByEmail(email);
      if (existingUser && existingUser.manager_id !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken by another user'
        });
      }

      const updatedProfile = await SettingsService.updateProfile(userId, {
        first_name,
        last_name,
        email,
        phone_number
      });

      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.manager_id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long'
        });
      }

      const result = await SettingsService.changePassword(userId, current_password, new_password);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.message
        });
      }

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}