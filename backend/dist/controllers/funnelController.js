import { FunnelService } from '../services/funnelService.js';
export class FunnelController {
    static async getAll(req, res) {
        try {
            const funnels = await FunnelService.getAll();
            res.json({
                success: true,
                data: funnels
            });
        }
        catch (error) {
            console.error('Get all funnels error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const funnel = await FunnelService.getById(id);
            if (!funnel) {
                return res.status(404).json({
                    success: false,
                    error: 'Funnel not found'
                });
            }
            res.json({
                success: true,
                data: funnel
            });
        }
        catch (error) {
            console.error('Get funnel by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async create(req, res) {
        try {
            const funnelData = req.body;
            const funnel = await FunnelService.create(funnelData);
            res.status(201).json({
                success: true,
                data: funnel
            });
        }
        catch (error) {
            console.error('Create funnel error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const funnelData = req.body;
            const funnel = await FunnelService.update(id, funnelData);
            if (!funnel) {
                return res.status(404).json({
                    success: false,
                    error: 'Funnel not found'
                });
            }
            res.json({
                success: true,
                data: funnel
            });
        }
        catch (error) {
            console.error('Update funnel error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const success = await FunnelService.delete(id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Funnel not found'
                });
            }
            res.json({
                success: true,
                message: 'Funnel deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete funnel error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    // Funnel Stages
    static async getAllStages(req, res) {
        try {
            const stages = await FunnelService.getAllStages();
            res.json({
                success: true,
                data: stages
            });
        }
        catch (error) {
            console.error('Get all funnel stages error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getStageById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const stage = await FunnelService.getStageById(id);
            if (!stage) {
                return res.status(404).json({
                    success: false,
                    error: 'Funnel stage not found'
                });
            }
            res.json({
                success: true,
                data: stage
            });
        }
        catch (error) {
            console.error('Get funnel stage by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async createStage(req, res) {
        try {
            const stageData = req.body;
            const stage = await FunnelService.createStage(stageData);
            res.status(201).json({
                success: true,
                data: stage
            });
        }
        catch (error) {
            console.error('Create funnel stage error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async updateStage(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const stageData = req.body;
            const stage = await FunnelService.updateStage(id, stageData);
            if (!stage) {
                return res.status(404).json({
                    success: false,
                    error: 'Funnel stage not found'
                });
            }
            res.json({
                success: true,
                data: stage
            });
        }
        catch (error) {
            console.error('Update funnel stage error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async deleteStage(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid ID'
                });
            }
            const success = await FunnelService.deleteStage(id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Funnel stage not found'
                });
            }
            res.json({
                success: true,
                message: 'Funnel stage deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete funnel stage error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
//# sourceMappingURL=funnelController.js.map