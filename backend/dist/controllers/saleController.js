import { SaleService } from '../services/saleService.js';
import { prisma } from '../config/database.js';
export class SaleController {
    static async getAll(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
            const sales = await SaleService.getAll(req.user.role, req.user.manager_id);
            res.json({
                success: true,
                data: sales
            });
        }
        catch (error) {
            console.error('Get all sales error:', error);
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
            const sale = await SaleService.getById(id, req.user.role, req.user.manager_id);
            if (!sale) {
                return res.status(404).json({
                    success: false,
                    error: 'Sale not found'
                });
            }
            res.json({
                success: true,
                data: sale
            });
        }
        catch (error) {
            console.error('Get sale by ID error:', error);
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
            const saleData = { ...req.body };
            // Always attach to the manager who creates the sale
            saleData.responsible_manager_id = req.user.manager_id;
            // If created within a project or subproject context, ensure linkage and auto-fill counterparty
            if (saleData.subproject_id) {
                const sub = await prisma.subProject.findUnique({
                    where: { subproject_id: Number(saleData.subproject_id) },
                    select: { project_id: true, project: { select: { counterparty_id: true } } }
                });
                if (sub) {
                    saleData.project_id = sub.project_id;
                    if (!saleData.counterparty_id && sub.project?.counterparty_id) {
                        saleData.counterparty_id = sub.project.counterparty_id;
                    }
                }
            }
            else if (saleData.project_id) {
                const project = await prisma.project.findUnique({
                    where: { project_id: Number(saleData.project_id) },
                    select: { counterparty_id: true }
                });
                if (!saleData.counterparty_id && project?.counterparty_id) {
                    saleData.counterparty_id = project.counterparty_id;
                }
            }
            // Default sale date to now if not provided
            if (!saleData.sale_date) {
                saleData.sale_date = new Date().toISOString();
            }
            // Persist without subproject_id column; linkage to project handled above
            delete saleData.subproject_id;
            const sale = await SaleService.create(saleData);
            res.status(201).json({
                success: true,
                data: sale
            });
        }
        catch (error) {
            console.error('Create sale error:', error);
            if (error?.message === 'COUNTERPARTY_REQUIRED') {
                return res.status(400).json({ success: false, error: 'Потрібно обрати контрагента' });
            }
            if (error?.message === 'INVALID_SALE_STATUS') {
                return res.status(400).json({ success: false, error: 'Невірний статус продажу' });
            }
            res.status(500).json({ success: false, error: 'Internal server error' });
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
            const saleData = req.body;
            const sale = await SaleService.update(id, saleData);
            if (!sale) {
                return res.status(404).json({
                    success: false,
                    error: 'Sale not found'
                });
            }
            res.json({
                success: true,
                data: sale
            });
        }
        catch (error) {
            console.error('Update sale error:', error);
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
            const success = await SaleService.delete(id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Sale not found'
                });
            }
            res.json({
                success: true,
                message: 'Sale deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete sale error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
//# sourceMappingURL=saleController.js.map