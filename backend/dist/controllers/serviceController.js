import { ServiceService } from '../services/serviceService.js';
export class ServiceController {
    static async getAll(req, res) {
        try {
            const services = await ServiceService.getAll();
            res.json({
                success: true,
                data: services
            });
        }
        catch (error) {
            console.error('Get all services error:', error);
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
            const service = await ServiceService.getById(id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    error: 'Service not found'
                });
            }
            res.json({
                success: true,
                data: service
            });
        }
        catch (error) {
            console.error('Get service by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async create(req, res) {
        try {
            const serviceData = req.body;
            const service = await ServiceService.create(serviceData);
            res.status(201).json({
                success: true,
                data: service
            });
        }
        catch (error) {
            console.error('Create service error:', error);
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
            const serviceData = req.body;
            const service = await ServiceService.update(id, serviceData);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    error: 'Service not found'
                });
            }
            res.json({
                success: true,
                data: service
            });
        }
        catch (error) {
            console.error('Update service error:', error);
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
            const success = await ServiceService.delete(id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Service not found'
                });
            }
            res.json({
                success: true,
                message: 'Service deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete service error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
//# sourceMappingURL=serviceController.js.map