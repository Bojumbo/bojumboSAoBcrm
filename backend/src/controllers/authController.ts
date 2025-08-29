import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { LoginRequest } from '../types/index.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const credentials: LoginRequest = req.body;

      if (!credentials.email || !credentials.password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await AuthService.login(credentials);

      if (!result) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      const user = await AuthService.getCurrentUser(req.user.manager_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
