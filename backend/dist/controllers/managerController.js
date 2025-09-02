import { ManagerService } from '../services/managerService.js';
export class ManagerController {
    static async getAll(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const managers = await ManagerService.getAll(req.user.role, req.user.manager_id);
            res.json({
                success: true,
                data: managers
            });
        }
        catch (error) {
            console.error('Get all managers error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const manager = await ManagerService.getById(id, req.user.role, req.user.manager_id);
            if (!manager) {
                return res.status(404).json({
                    success: false,
                    error: 'Manager not found'
                });
            }
            res.json({
                success: true,
                data: manager
            });
        }
        catch (error) {
            console.error('Get manager by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async create(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const managerData = req.body;
            const manager = await ManagerService.create(managerData);
            res.status(201).json({
                success: true,
                data: manager
            });
        }
        catch (error) {
            console.error('Create manager error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async update(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const managerData = req.body;
            const manager = await ManagerService.update(id, managerData);
            if (!manager) {
                return res.status(404).json({
                    success: false,
                    error: 'Manager not found'
                });
            }
            res.json({
                success: true,
                data: manager
            });
        }
        catch (error) {
            console.error('Update manager error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async delete(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const success = await ManagerService.delete(id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Manager not found'
                });
            }
            res.json({
                success: true,
                message: 'Manager deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete manager error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
//# sourceMappingURL=managerController.js.map