import { CounterpartyService } from '../services/counterpartyService.js';
export class CounterpartyController {
    static async getAll(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const counterparties = await CounterpartyService.getAll(req.user.role, req.user.manager_id);
            res.json({
                success: true,
                data: counterparties
            });
        }
        catch (error) {
            console.error('Get all counterparties error:', error);
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
            const counterparty = await CounterpartyService.getById(id, req.user.role, req.user.manager_id);
            if (!counterparty) {
                return res.status(404).json({
                    success: false,
                    error: 'Counterparty not found'
                });
            }
            res.json({
                success: true,
                data: counterparty
            });
        }
        catch (error) {
            console.error('Get counterparty by ID error:', error);
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
            const counterpartyData = req.body;
            const counterparty = await CounterpartyService.create(counterpartyData);
            res.status(201).json({
                success: true,
                data: counterparty
            });
        }
        catch (error) {
            console.error('Create counterparty error:', error);
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
            const counterpartyData = req.body;
            const counterparty = await CounterpartyService.update(id, counterpartyData);
            if (!counterparty) {
                return res.status(404).json({
                    success: false,
                    error: 'Counterparty not found'
                });
            }
            res.json({
                success: true,
                data: counterparty
            });
        }
        catch (error) {
            console.error('Update counterparty error:', error);
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
            const success = await CounterpartyService.delete(id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Counterparty not found'
                });
            }
            res.json({
                success: true,
                message: 'Counterparty deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete counterparty error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
//# sourceMappingURL=counterpartyController.js.map